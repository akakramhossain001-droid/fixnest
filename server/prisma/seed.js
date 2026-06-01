require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const providers = [
  {
    name: 'Sarah Johnson',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop',
    category: 'cleaning',
    rating: 4.8,
    reviews: 124,
    price: 499,
    description: 'Professional home cleaner with 5 years of experience. Expert in deep cleaning and organization.',
    isTopRated: true,
  },
  {
    name: 'Michael Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
    category: 'plumbing',
    rating: 4.9,
    reviews: 89,
    price: 799,
    description: 'Licensed plumber specializing in leak repairs, pipe installations, and bathroom fixtures.',
    isTopRated: true,
  },
  {
    name: 'David Smith',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop',
    category: 'electrical',
    rating: 4.7,
    reviews: 56,
    price: 599,
    description: 'Certified electrician for all residential wiring, lighting, and electrical repairs.',
    isTopRated: false,
  }
];

async function main() {
  console.log('Seeding database...');
  // Clear existing to avoid duplicates if run multiple times
  await prisma.provider.deleteMany();
  for (const provider of providers) {
    await prisma.provider.create({
      data: provider
    });
  }
  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
