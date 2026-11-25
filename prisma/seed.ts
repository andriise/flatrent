import bcrypt from "bcryptjs";
import {
  PrismaClient,
  Role,
  ListingStatus,
  SubscriptionPlan,
} from "@prisma/client";

const prisma = new PrismaClient();

const amenities = [
  ["Wi-Fi", "wifi"],
  ["Пральна машина", "washer"],
  ["Кондиціонер", "snowflake"],
  ["Паркомісце", "parking"],
  ["Балкон", "balcony"],
  ["Посудомийна машина", "dishwasher"],
  ["Генератор у будинку", "battery"],
  ["Ліфт", "elevator"],
  ["Тварини дозволені", "paw"],
  ["Тепла підлога", "heat"],
] as const;

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  await prisma.report.deleteMany();
  await prisma.contactRequest.deleteMany();
  await prisma.savedListing.deleteMany();
  await prisma.listingAmenity.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.amenity.deleteMany();
  await prisma.user.deleteMany();

  const [admin, owner, renter] = await Promise.all([
    prisma.user.create({
      data: {
        name: "Адміністратор FlatRent",
        email: "admin@flatrent.ua",
        passwordHash,
        role: Role.ADMIN,
        isVerified: true,
        trustScore: 100,
      },
    }),
    prisma.user.create({
      data: {
        name: "Микола Коваль",
        email: "mykola@example.com",
        passwordHash,
        role: Role.OWNER,
        phone: "+380671112233",
        isVerified: true,
        trustScore: 94,
      },
    }),
    prisma.user.create({
      data: {
        name: "Іван Петренко",
        email: "ivan@example.com",
        passwordHash,
        role: Role.USER,
        phone: "+380931234567",
        isVerified: true,
        trustScore: 82,
      },
    }),
  ]);

  await prisma.subscription.create({
    data: {
      userId: renter.id,
      plan: SubscriptionPlan.MONTHLY,
      active: true,
      endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  const createdAmenities = await Promise.all(
    amenities.map(([name, icon]) =>
      prisma.amenity.create({ data: { name, icon } }),
    ),
  );

  const listings = [
    {
      title: "Світла 1-кімнатна квартира біля Центрального парку",
      description:
        "Затишна квартира у Центрі Вінниці з новим ремонтом, окремою кухнею та швидким інтернетом. Власник, без комісії.",
      price: 12000,
      district: "Центр",
      address: "вул. Соборна, 48",
      street: "Соборна",
      houseNumber: "48",
      propertyType: "apartment",
      rooms: 1,
      area: 42,
      floor: 3,
      totalFloors: 9,
      buildingType: "brick",
      condition: "euro",
      furniture: "yes",
      isFurnished: true,
      petsAllowed: false,
      childrenAllowed: true,
      minRentPeriod: "6m",
      contactMethods: ["phone", "viber", "telegram"],
      trustScore: 96,
      seed: "vinnytsia-center-flat",
      amenityIndexes: [0, 1, 2, 4, 7],
    },
    {
      title: "2-кімнатна квартира на Вишеньці з паркомісцем",
      description:
        "Простора квартира для сім'ї поруч із ТРЦ, школою та транспортом. Є закрите паркомісце, меблі та техніка.",
      price: 16500,
      district: "Вишенька",
      address: "просп. Космонавтів, 71",
      street: "Космонавтів",
      houseNumber: "71",
      propertyType: "apartment",
      rooms: 2,
      area: 58,
      floor: 4,
      totalFloors: 9,
      buildingType: "panel",
      condition: "cosmetic",
      furniture: "yes",
      isFurnished: true,
      petsAllowed: true,
      childrenAllowed: true,
      minRentPeriod: "1y",
      contactMethods: ["phone", "viber"],
      trustScore: 91,
      seed: "vyshenka-family-home",
      amenityIndexes: [0, 1, 3, 6, 8],
    },
    {
      title: "Студія в Замості для однієї людини або пари",
      description:
        "Компактна студія після ремонту. До вокзалу 8 хвилин пішки, тихий двір, оплата напряму власнику.",
      price: 9800,
      district: "Замостя",
      address: "вул. Київська, 22",
      street: "Київська",
      houseNumber: "22",
      propertyType: "apartment",
      rooms: 1,
      area: 31,
      floor: 2,
      totalFloors: 5,
      buildingType: "brick",
      condition: "cosmetic",
      furniture: "partial",
      isFurnished: true,
      petsAllowed: false,
      childrenAllowed: false,
      minRentPeriod: "3m",
      contactMethods: ["phone", "telegram"],
      trustScore: 88,
      seed: "zamostia-studio",
      amenityIndexes: [0, 1, 2],
    },
    {
      title: "3-кімнатна квартира у Пирогово з великим балконом",
      description:
        "Теплий будинок, роздільні кімнати, велика кухня і балкон. Підійде для родини, поруч лікарня та парк.",
      price: 19000,
      district: "Пирогово",
      address: "вул. Пирогова, 154",
      street: "Пирогова",
      houseNumber: "154",
      propertyType: "apartment",
      rooms: 3,
      area: 74,
      floor: 6,
      totalFloors: 10,
      buildingType: "monolith",
      condition: "living",
      furniture: "no",
      isFurnished: false,
      petsAllowed: true,
      childrenAllowed: true,
      minRentPeriod: "1y",
      contactMethods: ["phone", "whatsapp"],
      trustScore: 84,
      seed: "pyrohovo-three-room",
      amenityIndexes: [3, 4, 7, 8],
    },
    {
      title: "Атмосферна квартира у Старому місті",
      description:
        "Окрема спальня, кухня-вітальня, якісний ремонт. Ідеально для тих, хто хоче спокійний район біля центру.",
      price: 14000,
      district: "Старе місто",
      address: "вул. Мури, 9",
      street: "Мури",
      houseNumber: "9",
      propertyType: "apartment",
      rooms: 2,
      area: 49,
      floor: 1,
      totalFloors: 4,
      buildingType: "brick",
      condition: "author",
      furniture: "yes",
      isFurnished: true,
      petsAllowed: true,
      childrenAllowed: true,
      minRentPeriod: "6m",
      contactMethods: ["phone", "viber", "whatsapp"],
      trustScore: 93,
      seed: "old-town-vinnytsia",
      amenityIndexes: [0, 1, 5, 8, 9],
    },
  ];

  for (const listing of listings) {
    await prisma.listing.create({
      data: {
        title: listing.title,
        description: listing.description,
        price: listing.price,
        district: listing.district,
        address: listing.address,
        street: listing.street,
        houseNumber: listing.houseNumber,
        propertyType: listing.propertyType,
        rooms: listing.rooms,
        area: listing.area,
        floor: listing.floor,
        totalFloors: listing.totalFloors,
        buildingType: listing.buildingType,
        condition: listing.condition,
        furniture: listing.furniture,
        isFurnished: listing.isFurnished,
        petsAllowed: listing.petsAllowed,
        childrenAllowed: listing.childrenAllowed,
        minRentPeriod: listing.minRentPeriod,
        contactMethods: listing.contactMethods,
        status: ListingStatus.ACTIVE,
        trustScore: listing.trustScore,
        ownerId: owner.id,
        photos: {
          create: [0, 1, 2].map((order) => ({
            url: `https://picsum.photos/seed/${listing.seed}-${order}/800/600`,
            alt: listing.title,
            order,
          })),
        },
        amenities: {
          create: listing.amenityIndexes.map((index) => ({
            amenityId: createdAmenities[index].id,
          })),
        },
      },
    });
  }

  await prisma.savedListing.create({
    data: {
      userId: renter.id,
      listingId: (
        await prisma.listing.findFirstOrThrow({ where: { district: "Центр" } })
      ).id,
    },
  });

  const extraDistricts = [
    "Центр",
    "Вишенька",
    "Замостя",
    "Пирогово",
    "Старе місто",
    "Поділля",
    "Слов'янка",
    "Тяжилів",
  ];
  const extraPrices = [
    8500, 10500, 11200, 13500, 14800, 15900, 17200, 18500, 20500, 22800, 24000,
    27500,
  ];

  for (let index = 0; index < extraPrices.length; index += 1) {
    const district = extraDistricts[index % extraDistricts.length];
    const rooms = (index % 4) + 1;
    const area = 28 + rooms * 14 + (index % 5) * 3;
    const floor = (index % 8) + 1;
    const totalFloors = Math.max(floor + 2, 9);
    await prisma.listing.create({
      data: {
        title: `${rooms}-кімнатна квартира у районі ${district}`,
        description: `Світла ${rooms}-кімнатна квартира у районі ${district}. Зручне розташування, меблі та побутова техніка, можливий прямий зв'язок із власником.`,
        price: extraPrices[index],
        district,
        address: `вул. Прикладна, ${10 + index}`,
        street: "Прикладна",
        houseNumber: String(10 + index),
        propertyType: "apartment",
        rooms,
        area,
        floor,
        totalFloors,
        buildingType: index % 2 === 0 ? "brick" : "panel",
        condition: index % 3 === 0 ? "euro" : "cosmetic",
        furniture: index % 4 === 0 ? "no" : "yes",
        isFurnished: index % 4 !== 0,
        petsAllowed: index % 3 === 0,
        childrenAllowed: true,
        minRentPeriod: "6m",
        contactMethods: ["phone", "viber"],
        status: ListingStatus.ACTIVE,
        trustScore: 80 + (index % 15),
        ownerId: owner.id,
        photos: {
          create: [0, 1].map((order) => ({
            url: `https://picsum.photos/seed/flatrent-extra-${index}-${order}/800/600`,
            alt: `${rooms}-кімнатна квартира у районі ${district}`,
            order,
          })),
        },
      },
    });
  }

  console.log(
    "Seed completed: admin@flatrent.ua, mykola@example.com, ivan@example.com",
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
