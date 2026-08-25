import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TableFeature } from '@prisma/client';
import { scoreFeatureMatch } from '../common/table-features';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { SearchRestaurantsDto } from './dto/search-restaurants.dto';

@Injectable()
export class RestaurantsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRestaurantDto, ownerId: string) {
    return this.prisma.restaurant.create({
      data: {
        ...dto,
        slug: this.slugify(dto.name),
        averageRating: new Prisma.Decimal(dto.averageRating),
        approvalStatus: 'PENDING',
        ownerId,
      },
    });
  }

  async findAll(filters: SearchRestaurantsDto) {
    const preferredViews = filters.preferredViews ?? [];
    const restaurants = await this.prisma.restaurant.findMany({
      where: {
        isActive: true,
        approvalStatus: 'APPROVED',
        city: filters.city ? { equals: filters.city, mode: 'insensitive' } : undefined,
        cuisine: filters.cuisine ? { contains: filters.cuisine, mode: 'insensitive' } : undefined,
        priceForTwo:
          filters.minPriceForTwo || filters.maxPriceForTwo
            ? { gte: filters.minPriceForTwo, lte: filters.maxPriceForTwo }
            : undefined,
        OR: filters.query
          ? [
              { name: { contains: filters.query, mode: 'insensitive' } },
              { cuisine: { contains: filters.query, mode: 'insensitive' } },
              { neighborhood: { contains: filters.query, mode: 'insensitive' } },
            ]
          : undefined,
        tables: filters.partySize
          ? {
              some: {
                capacity: { gte: filters.partySize },
                features: preferredViews.length ? { hasSome: preferredViews } : undefined,
                isActive: true,
              },
            }
          : undefined,
      },
      include: this.restaurantInclude(),
      orderBy: [{ averageRating: 'desc' }, { deliveryTimeMin: 'asc' }],
    });

    return restaurants.map((restaurant) => ({
      ...restaurant,
      matchScore: this.matchScore(preferredViews, restaurant.tables),
    }));
  }

  async findOne(idOrSlug: string) {
    const restaurant = await this.prisma.restaurant.findFirst({
      where: {
        isActive: true,
        approvalStatus: 'APPROVED',
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: this.restaurantInclude(),
    });

    if (!restaurant) throw new NotFoundException('Restaurant not found');
    return restaurant;
  }

  async findByOwner(ownerId: string) {
    return this.prisma.restaurant.findMany({
      where: { ownerId },
      include: this.restaurantInclude(),
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAvailability(
    restaurantId: string,
    partySize: number,
    preferredViews: TableFeature[] = [],
    bookingTime?: Date,
  ) {
    await this.ensureBookableRestaurant(restaurantId);

    const startWindow = bookingTime
      ? new Date(bookingTime.getTime() - 90 * 60 * 1000)
      : undefined;
    const endWindow = bookingTime
      ? new Date(bookingTime.getTime() + 90 * 60 * 1000)
      : undefined;

    const tables = await this.prisma.restaurantTable.findMany({
      where: {
        restaurantId,
        capacity: { gte: partySize },
        isActive: true,
        bookings: bookingTime
          ? {
              none: {
                status: { in: ['REQUESTED', 'CONFIRMED', 'SEATED'] },
                bookingTime: { gte: startWindow, lte: endWindow },
              },
            }
          : undefined,
      },
      include: { zone: true },
      orderBy: [{ capacity: 'asc' }, { minSpend: 'asc' }],
    });

    return tables
      .map((table) => ({ ...table, matchScore: scoreFeatureMatch(preferredViews, table.features) }))
      .sort((a, b) => b.matchScore - a.matchScore || a.capacity - b.capacity);
  }

  async toggleOpenStatus(id: string, isOpen: boolean, ownerId: string) {
    await this.ensureOwner(id, ownerId);
    return this.prisma.restaurant.update({ where: { id }, data: { isOpen } });
  }

  async claimRestaurant(id: string, ownerId: string) {
    const [restaurant, owner] = await Promise.all([
      this.prisma.restaurant.findUnique({ where: { id } }),
      this.prisma.user.findUnique({ where: { id: ownerId } }),
    ]);
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    if (!owner || owner.role !== 'RESTAURANT_OWNER') {
      throw new BadRequestException('The selected user is not a restaurant owner');
    }
    if (restaurant.ownerId) throw new ConflictException('This restaurant already has an owner');
    return this.prisma.restaurant.update({ where: { id }, data: { ownerId } });
  }

  async ensureOwner(restaurantId: string, ownerId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({ where: { id: restaurantId } });
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    if (restaurant.ownerId !== ownerId) throw new ForbiddenException('You do not own this restaurant');
    return restaurant;
  }

  async ensureOrderableRestaurant(id: string) {
    const restaurant = await this.prisma.restaurant.findFirst({
      where: { id, isActive: true, isOpen: true, approvalStatus: 'APPROVED' },
    });
    if (!restaurant) throw new BadRequestException('Restaurant is not accepting orders');
    return restaurant;
  }

  async ensureBookableRestaurant(id: string) {
    const restaurant = await this.prisma.restaurant.findFirst({
      where: { id, isActive: true, reservable: true, approvalStatus: 'APPROVED' },
    });
    if (!restaurant) throw new BadRequestException('Restaurant is not accepting table bookings');
    return restaurant;
  }

  async ensureRestaurant(id: string) {
    const restaurant = await this.prisma.restaurant.findUnique({ where: { id } });
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    return restaurant;
  }

  private restaurantInclude() {
    return {
      seatingZones: {
        include: {
          viewScenes: true,
          tables: { orderBy: [{ capacity: 'asc' as const }, { label: 'asc' as const }] },
        },
      },
      viewScenes: true,
      menuItems: { where: { isAvailable: true }, orderBy: { name: 'asc' as const } },
      tables: true,
    };
  }

  private matchScore(preferredViews: TableFeature[], tables: Array<{ features: TableFeature[] }>) {
    if (!preferredViews.length) return 0;
    return Math.max(0, ...tables.map((table) => scoreFeatureMatch(preferredViews, table.features)));
  }

  private slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}
