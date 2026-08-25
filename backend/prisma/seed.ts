import { PrismaClient, TableFeature } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

const realRestaurantSeeds = [
  restaurantSeed('rim-naam', 'Rim Naam', 'Thai', 'The Oberoi, MG Road, Bengaluru', 'MG Road', 4200, 45, [
    zone('Lakeside Pavilion', 'Open-air water-garden tables with calmer premium dining.', 'Garden', [
      table('L1', 2, 3500, ['WINDOW_VIEW', 'TERRACE', 'QUIET_ZONE'], 28, 42),
      table('L2', 4, 5200, ['WINDOW_VIEW', 'PRIVATE_DINING'], 54, 44),
    ]),
  ]),
  restaurantSeed('karavalli', 'Karavalli', 'Coastal', 'The Gateway Hotel, Residency Road, Bengaluru', 'Residency Road', 3600, 38, [
    zone('Heritage Courtyard', 'Traditional coastal dining room with courtyard-facing tables.', 'Ground', [
      table('C1', 2, 2800, ['WINDOW_VIEW', 'QUIET_ZONE'], 24, 44),
      table('C2', 6, 5600, ['PRIVATE_DINING', 'FAMILY_FRIENDLY'], 64, 50),
    ]),
  ]),
  restaurantSeed('toit-indiranagar', 'Toit', 'Brewery', '100 Feet Road, Indiranagar, Bengaluru', 'Indiranagar', 2000, 34, [
    zone('Brewery Floor', 'High-energy brewery tables with group seating and screen angles.', 'Level 1', [
      table('B1', 4, 1800, ['PROJECTOR_VIEW', 'FAMILY_FRIENDLY'], 32, 46),
      table('B2', 8, 3600, ['PROJECTOR_VIEW', 'LIVE_MUSIC_VIEW'], 72, 42),
    ]),
  ]),
  restaurantSeed('mtr-lalbagh', 'Mavalli Tiffin Rooms', 'South Indian', 'Lalbagh Road, Bengaluru', 'Lalbagh', 500, 22, [
    zone('Classic Hall', 'Fast-moving heritage tiffin hall with family-friendly tables.', 'Ground', [
      table('M1', 2, 300, ['FAMILY_FRIENDLY'], 30, 42),
      table('M2', 4, 600, ['FAMILY_FRIENDLY'], 58, 46),
    ]),
  ]),
  restaurantSeed('vidyarthi-bhavan', 'Vidyarthi Bhavan', 'South Indian', 'Gandhi Bazaar, Basavanagudi, Bengaluru', 'Basavanagudi', 400, 28, [
    zone('Heritage Seating', 'Iconic dosa hall with compact shared seating.', 'Ground', [
      table('V1', 2, 300, ['FAMILY_FRIENDLY'], 36, 44),
      table('V2', 4, 600, ['FAMILY_FRIENDLY'], 62, 48),
    ]),
  ]),
  restaurantSeed('central-tiffin-room', 'Central Tiffin Room', 'South Indian', 'Margosa Road, Malleshwaram, Bengaluru', 'Malleshwaram', 450, 25, [
    zone('Tiffin Room', 'Classic breakfast room with simple group tables.', 'Ground', [
      table('CTR1', 2, 300, ['FAMILY_FRIENDLY'], 34, 42),
      table('CTR2', 4, 600, ['FAMILY_FRIENDLY'], 60, 46),
    ]),
  ]),
  restaurantSeed('airlines-hotel', 'Airlines Hotel', 'Cafe', 'Lavelle Road, Bengaluru', 'Lavelle Road', 700, 26, [
    zone('Garden Cafe', 'Open outdoor cafe tables under trees.', 'Garden', [
      table('G1', 2, 500, ['TERRACE', 'QUIET_ZONE'], 30, 38),
      table('G2', 4, 900, ['TERRACE', 'FAMILY_FRIENDLY'], 58, 44),
    ]),
  ]),
  restaurantSeed('truffles-st-marks', 'Truffles', 'Burgers', 'St Marks Road, Bengaluru', 'St Marks Road', 900, 30, [
    zone('Casual Diner', 'Busy casual diner with larger group booths.', 'Ground', [
      table('TR1', 2, 600, ['FAMILY_FRIENDLY'], 35, 42),
      table('TR2', 6, 1800, ['FAMILY_FRIENDLY', 'PROJECTOR_VIEW'], 68, 50),
    ]),
  ]),
  restaurantSeed('nagarjuna-residency-road', 'Nagarjuna', 'Andhra', 'Residency Road, Bengaluru', 'Residency Road', 1000, 32, [
    zone('Meals Hall', 'Large-format dining room for group meals.', 'Ground', [
      table('N1', 4, 1000, ['FAMILY_FRIENDLY'], 36, 44),
      table('N2', 8, 2200, ['FAMILY_FRIENDLY', 'PRIVATE_DINING'], 70, 48),
    ]),
  ]),
  restaurantSeed('meghana-foods-indiranagar', 'Meghana Foods', 'Biryani', 'Indiranagar, Bengaluru', 'Indiranagar', 800, 29, [
    zone('Biryani Hall', 'Fast casual dining for biryani and groups.', 'Ground', [
      table('MF1', 2, 500, ['FAMILY_FRIENDLY'], 34, 42),
      table('MF2', 6, 1500, ['FAMILY_FRIENDLY'], 66, 48),
    ]),
  ]),
  restaurantSeed('corner-house', 'Corner House', 'Desserts', 'Residency Road, Bengaluru', 'Residency Road', 450, 20, []),
  restaurantSeed('glens-bakehouse', "Glen's Bakehouse", 'Bakery', 'Indiranagar, Bengaluru', 'Indiranagar', 900, 27, []),
];

async function seedRestaurants() {
  for (const seed of realRestaurantSeeds) {
    const restaurant = await prisma.restaurant.upsert({
      where: { slug: seed.slug },
      update: {
        source: 'CURATED_REAL_NAME',
        syncQuery: seed.syncQuery,
        name: seed.name,
        cuisine: seed.cuisine,
        address: seed.address,
        neighborhood: seed.neighborhood,
        city: 'Bengaluru',
      },
      create: {
        source: 'CURATED_REAL_NAME',
        syncQuery: seed.syncQuery,
        slug: seed.slug,
        name: seed.name,
        description: `Real Bengaluru restaurant seed. Run Google Places sync to attach customer-uploaded photos and live place metadata.`,
        cuisine: seed.cuisine,
        address: seed.address,
        neighborhood: seed.neighborhood,
        city: 'Bengaluru',
        averageRating: '0',
        priceForTwo: seed.priceForTwo,
        deliveryTimeMin: seed.deliveryTimeMin,
        outdoorSeating: seed.zones.some((item) => item.features.includes('TERRACE')),
        reservable: seed.zones.length > 0,
        goodForGroups: seed.zones.some((item) => item.tables.some((restaurantTable) => restaurantTable.capacity >= 6)),
        menuItems: {
          create: defaultMenu(seed.cuisine),
        },
      },
    });

    for (const zoneSeed of seed.zones) {
      const seatingZone = await prisma.seatingZone.upsert({
        where: { id: `${seed.slug}-${slugify(zoneSeed.name)}` },
        update: {},
        create: {
          id: `${seed.slug}-${slugify(zoneSeed.name)}`,
          restaurantId: restaurant.id,
          name: zoneSeed.name,
          description: zoneSeed.description,
          floor: zoneSeed.floor,
          ambience: zoneSeed.description,
          features: zoneSeed.features,
        },
      });

      await prisma.restaurantTable.createMany({
        data: zoneSeed.tables.map((item) => ({
          restaurantId: restaurant.id,
          zoneId: seatingZone.id,
          label: item.label,
          capacity: item.capacity,
          minSpend: item.minSpend,
          features: item.features,
          x: item.x,
          y: item.y,
        })),
        skipDuplicates: true,
      });

      await prisma.viewScene.upsert({
        where: {
          restaurantId_title: {
            restaurantId: restaurant.id,
            title: `${zoneSeed.name} customer photo preview pending`,
          },
        },
        update: {},
        create: {
          restaurantId: restaurant.id,
          zoneId: seatingZone.id,
          title: `${zoneSeed.name} customer photo preview pending`,
          imageUrl: '',
          thumbnailUrl: '',
          hotSpots: [{ label: 'Run Places sync to attach real customer-uploaded photos' }],
        },
      });
    }
  }
}

async function seedUsersAndDelivery() {
  const passwordHash = await hash('Password123', 12);
  await prisma.user.upsert({
    where: { email: 'demo.customer@khatejao.dev' },
    update: {},
    create: {
      name: 'Demo Customer',
      email: 'demo.customer@khatejao.dev',
      phone: '+919844604784',
      passwordHash,
      role: 'CUSTOMER',
    },
  });

  await prisma.deliveryPartner.upsert({
    where: { email: 'rider@khatejao.dev' },
    update: {},
    create: {
      name: 'Aman Rider',
      phone: '+919900000001',
      email: 'rider@khatejao.dev',
      passwordHash,
      vehicleType: 'Bike',
      status: 'AVAILABLE',
    },
  });
}

function restaurantSeed(
  slug: string,
  name: string,
  cuisine: string,
  address: string,
  neighborhood: string,
  priceForTwo: number,
  deliveryTimeMin: number,
  zones: ZoneSeed[],
) {
  return {
    slug,
    name,
    cuisine,
    address,
    neighborhood,
    priceForTwo,
    deliveryTimeMin,
    syncQuery: `${name} ${neighborhood} Bengaluru`,
    zones,
  };
}

function zone(name: string, description: string, floor: string, tables: TableSeed[]) {
  const features = Array.from(new Set(tables.flatMap((item) => item.features)));
  return { name, description, floor, features, tables };
}

function table(
  label: string,
  capacity: number,
  minSpend: number,
  features: TableFeature[],
  x: number,
  y: number,
) {
  return { label, capacity, minSpend, features, x, y };
}

function defaultMenu(cuisine: string) {
  return [
    { name: `${cuisine} signature plate`, description: 'Signature item placeholder until menu integration.', price: 420 },
    { name: 'House beverage', description: 'Restaurant beverage placeholder.', price: 160 },
    { name: 'Dessert of the day', description: 'Rotating dessert placeholder.', price: 220 },
  ];
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

type TableSeed = ReturnType<typeof table>;
type ZoneSeed = {
  name: string;
  description: string;
  floor: string;
  features: TableFeature[];
  tables: TableSeed[];
};

async function main() {
  await seedRestaurants();
  await seedUsersAndDelivery();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
