import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

const categories = [
  {
    name: 'Electronics',
    description: 'Electronic products and devices',
  },
  {
    name: 'Grocery',
    description: 'Groceries, food, beverages and daily essentials',
  },
  {
    name: 'Fashion',
    description: 'Clothing, footwear and fashion accessories',
  },
  {
    name: 'Home & Kitchen',
    description: 'Home appliances, kitchen products and household items',
  },
  {
    name: 'Beauty & Personal Care',
    description: 'Beauty, skincare, haircare and personal care products',
  },
  {
    name: 'Automotive',
    description: 'Automotive products, parts and accessories',
  },
  {
    name: 'Pharmacy & Healthcare',
    description: 'Healthcare, wellness and pharmacy products',
  },
  {
    name: 'Books & Stationery',
    description: 'Books, educational materials and stationery',
  },
  {
    name: 'Sports & Fitness',
    description: 'Sports equipment, fitness products and accessories',
  },
  {
    name: 'Toys & Games',
    description: 'Toys, games and entertainment products',
  },
  {
    name: 'Furniture',
    description: 'Furniture and home furnishing products',
  },
  {
    name: 'Hardware & Tools',
    description: 'Hardware, tools and equipment',
  },
  {
    name: 'Pet Supplies',
    description: 'Pet food, accessories and pet care products',
  },
  {
    name: 'Flowers & Gifts',
    description: 'Flowers, gifts and special occasion products',
  },
  {
    name: 'Jewellery & Accessories',
    description: 'Jewellery, watches and fashion accessories',
  },
  {
    name: 'Services',
    description: 'Local professional and consumer services',
  },
];

async function main() {
  console.log('Seeding categories...');

  for (const category of categories) {
    const slug = category.name
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    await prisma.category.upsert({
      where: {
        slug,
      },
      update: {
        name: category.name,
        description: category.description,
        isActive: true,
      },
      create: {
        name: category.name,
        slug,
        description: category.description,
        isActive: true,
      },
    });

    console.log(`✓ ${category.name}`);
  }

  console.log(`Seeded ${categories.length} categories.`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });