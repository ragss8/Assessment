import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, TableFeature } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type GooglePhoto = {
  name: string;
  authorAttributions?: Array<{
    displayName?: string;
    uri?: string;
    photoUri?: string;
  }>;
};

type GooglePlace = {
  id: string;
  name: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  rating?: number;
  userRatingCount?: number;
  priceLevel?: string;
  types?: string[];
  photos?: GooglePhoto[];
  googleMapsUri?: string;
  websiteUri?: string;
  nationalPhoneNumber?: string;
  outdoorSeating?: boolean;
  reservable?: boolean;
  goodForGroups?: boolean;
  servesVegetarianFood?: boolean;
  primaryTypeDisplayName?: { text?: string };
};

@Injectable()
export class PlacesService {
  private readonly endpoint = 'https://places.googleapis.com/v1';

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async syncRestaurants(queries: string[], city = 'Bengaluru') {
    this.requireApiKey();
    const synced = [];

    for (const query of queries) {
      const place = await this.searchFirstPlace(`${query} restaurant ${city}`);
      if (!place) {
        continue;
      }
      synced.push(await this.upsertPlace(place, city));
    }

    return { count: synced.length, restaurants: synced };
  }

  async getPhotoMediaUrl(photoName: string, maxWidthPx = 1200) {
    const apiKey = this.requireApiKey();
    if (!photoName.startsWith('places/')) {
      throw new BadRequestException('Invalid Google photo resource name');
    }

    const response = await fetch(
      `${this.endpoint}/${photoName}/media?maxWidthPx=${maxWidthPx}&skipHttpRedirect=true&key=${apiKey}`,
    );

    if (!response.ok) {
      throw new ServiceUnavailableException('Could not fetch Google Places photo');
    }

    const payload = (await response.json()) as { photoUri?: string };
    if (!payload.photoUri) {
      throw new ServiceUnavailableException('Google Places did not return a photo URI');
    }

    return payload.photoUri;
  }

  private async searchFirstPlace(textQuery: string) {
    const apiKey = this.requireApiKey();
    const response = await fetch(`${this.endpoint}/places:searchText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': [
          'places.id',
          'places.name',
          'places.displayName',
          'places.formattedAddress',
          'places.location',
          'places.rating',
          'places.userRatingCount',
          'places.priceLevel',
          'places.types',
          'places.photos',
          'places.googleMapsUri',
          'places.websiteUri',
          'places.nationalPhoneNumber',
          'places.outdoorSeating',
          'places.reservable',
          'places.goodForGroups',
          'places.servesVegetarianFood',
          'places.primaryTypeDisplayName',
        ].join(','),
      },
      body: JSON.stringify({ textQuery, includedType: 'restaurant', languageCode: 'en' }),
    });

    if (!response.ok) {
      throw new ServiceUnavailableException('Google Places search failed');
    }

    const payload = (await response.json()) as { places?: GooglePlace[] };
    return payload.places?.[0] ?? null;
  }

  private async upsertPlace(place: GooglePlace, city: string) {
    const firstPhoto = place.photos?.[0];
    const cuisine = this.toCuisine(place);
    const addressParts = (place.formattedAddress ?? '').split(',').map((part) => part.trim());
    const neighborhood = addressParts.length > 2 ? addressParts[addressParts.length - 4] ?? city : city;
    const slug = this.slugify(place.displayName?.text ?? place.id);

    const restaurant = await this.prisma.restaurant.upsert({
      where: { googlePlaceId: place.id },
      create: {
        source: 'GOOGLE_PLACES',
        googlePlaceId: place.id,
        googleMapsUri: place.googleMapsUri,
        websiteUri: place.websiteUri,
        phoneNumber: place.nationalPhoneNumber,
        slug,
        name: place.displayName?.text ?? slug,
        description: `Real restaurant record synced from Google Places for ${place.displayName?.text ?? slug}.`,
        cuisine,
        address: place.formattedAddress ?? city,
        neighborhood,
        city,
        latitude: place.location?.latitude ? new Prisma.Decimal(place.location.latitude) : undefined,
        longitude: place.location?.longitude ? new Prisma.Decimal(place.location.longitude) : undefined,
        averageRating: new Prisma.Decimal(place.rating ?? 0),
        priceForTwo: this.priceForTwo(place.priceLevel),
        deliveryTimeMin: 30,
        heroImageUrl: firstPhoto ? `/api/place-photos/image?name=${encodeURIComponent(firstPhoto.name)}` : undefined,
        primaryPhotoName: firstPhoto?.name,
        primaryPhotoAttributions: (firstPhoto?.authorAttributions ?? []) as Prisma.InputJsonValue,
        outdoorSeating: Boolean(place.outdoorSeating),
        reservable: Boolean(place.reservable),
        goodForGroups: Boolean(place.goodForGroups),
        servesVegetarianFood: Boolean(place.servesVegetarianFood),
        menuItems: {
          create: this.defaultMenu(cuisine),
        },
      },
      update: {
        source: 'GOOGLE_PLACES',
        googleMapsUri: place.googleMapsUri,
        websiteUri: place.websiteUri,
        phoneNumber: place.nationalPhoneNumber,
        name: place.displayName?.text,
        address: place.formattedAddress,
        latitude: place.location?.latitude ? new Prisma.Decimal(place.location.latitude) : undefined,
        longitude: place.location?.longitude ? new Prisma.Decimal(place.location.longitude) : undefined,
        averageRating: new Prisma.Decimal(place.rating ?? 0),
        heroImageUrl: firstPhoto ? `/api/place-photos/image?name=${encodeURIComponent(firstPhoto.name)}` : undefined,
        primaryPhotoName: firstPhoto?.name,
        primaryPhotoAttributions: (firstPhoto?.authorAttributions ?? []) as Prisma.InputJsonValue,
        outdoorSeating: Boolean(place.outdoorSeating),
        reservable: Boolean(place.reservable),
        goodForGroups: Boolean(place.goodForGroups),
        servesVegetarianFood: Boolean(place.servesVegetarianFood),
      },
      include: {
        seatingZones: true,
        viewScenes: true,
        menuItems: true,
      },
    });

    const firstZone =
      restaurant.seatingZones[0] ??
      (await this.prisma.seatingZone.create({
        data: {
          restaurantId: restaurant.id,
          name: 'Customer Photos',
          description: 'Photo-backed preview sourced through Google Places customer uploads.',
          floor: 'Main',
          ambience: 'Real customer-uploaded venue view',
          features: place.outdoorSeating ? ['WINDOW_VIEW', 'TERRACE'] : ['WINDOW_VIEW', 'FAMILY_FRIENDLY'],
        },
      }));

    await this.ensureDefaultTables(restaurant.id, firstZone.id);

    if (firstPhoto) {
      await this.prisma.viewScene.upsert({
        where: {
          restaurantId_title: {
            restaurantId: restaurant.id,
            title: 'Customer uploaded venue preview',
          },
        },
        update: {
          imageUrl: `/api/place-photos/image?name=${encodeURIComponent(firstPhoto.name)}`,
          thumbnailUrl: `/api/place-photos/image?name=${encodeURIComponent(firstPhoto.name)}&maxWidthPx=480`,
          sourcePhotoName: firstPhoto.name,
          photoAttributions: (firstPhoto.authorAttributions ?? []) as Prisma.InputJsonValue,
        },
        create: {
          restaurantId: restaurant.id,
          zoneId: firstZone.id,
          title: 'Customer uploaded venue preview',
          imageUrl: `/api/place-photos/image?name=${encodeURIComponent(firstPhoto.name)}`,
          thumbnailUrl: `/api/place-photos/image?name=${encodeURIComponent(firstPhoto.name)}&maxWidthPx=480`,
          sourcePhotoName: firstPhoto.name,
          photoAttributions: (firstPhoto.authorAttributions ?? []) as Prisma.InputJsonValue,
          hotSpots: [{ label: 'Real place photo', source: 'Google Places' }],
        },
      });
    }

    return this.prisma.restaurant.findUnique({
      where: { id: restaurant.id },
      include: { seatingZones: true, viewScenes: true, menuItems: true },
    });
  }

  private async ensureDefaultTables(restaurantId: string, zoneId: string) {
    const existingCount = await this.prisma.restaurantTable.count({ where: { restaurantId } });
    if (existingCount > 0) {
      return;
    }

    await this.prisma.restaurantTable.createMany({
      data: [
        { restaurantId, zoneId, label: 'A1', capacity: 2, minSpend: 1000, features: ['WINDOW_VIEW', 'QUIET_ZONE'] as TableFeature[], x: 30, y: 42 },
        { restaurantId, zoneId, label: 'A2', capacity: 4, minSpend: 1600, features: ['FAMILY_FRIENDLY', 'WINDOW_VIEW'] as TableFeature[], x: 55, y: 48 },
      ],
      skipDuplicates: true,
    });
  }

  private defaultMenu(cuisine: string) {
    return [
      { name: `${cuisine} tasting plate`, description: 'Signature dish placeholder until menu sync is connected.', price: 420 },
      { name: 'House beverage', description: 'Restaurant beverage placeholder.', price: 160 },
    ];
  }

  private toCuisine(place: GooglePlace) {
    return place.primaryTypeDisplayName?.text ?? place.types?.find((type) => type.includes('restaurant')) ?? 'Restaurant';
  }

  private priceForTwo(priceLevel?: string) {
    const prices: Record<string, number> = {
      PRICE_LEVEL_INEXPENSIVE: 700,
      PRICE_LEVEL_MODERATE: 1400,
      PRICE_LEVEL_EXPENSIVE: 2600,
      PRICE_LEVEL_VERY_EXPENSIVE: 4200,
    };
    return prices[priceLevel ?? ''] ?? 1200;
  }

  private slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private requireApiKey() {
    const apiKey = this.config.get<string>('GOOGLE_PLACES_API_KEY');
    if (!apiKey) {
      throw new ServiceUnavailableException('GOOGLE_PLACES_API_KEY is required for real customer-uploaded photos');
    }
    return apiKey;
  }
}
