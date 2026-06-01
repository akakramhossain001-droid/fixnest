const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const providers = [
  {
    id: '1',
    name: 'Rohan Mehra',
    avatar: '/images/avatar_01.jpg',
    category: 'plumber',
    rating: 4.8,
    reviewCount: 120,
    price: 299,
    description: 'Certified plumber with 8+ years experience in residential repairs.',
    isTopRated: true,
  },
  {
    id: '2',
    name: 'Priya Sharma',
    avatar: '/images/avatar_02.jpg',
    category: 'plumber',
    rating: 4.7,
    reviewCount: 95,
    price: 349,
    description: 'Reliable, punctual, and tidy. 5+ years serving Bangalore homes.',
    isTopRated: false,
  },
  {
    id: '3',
    name: 'Amit Desai',
    avatar: '/images/avatar_03.jpg',
    category: 'plumber',
    rating: 4.9,
    reviewCount: 210,
    price: 320,
    description: 'Expert in bathroom remodeling and pump installations.',
    isTopRated: true,
  },
  {
    id: '4',
    name: 'Sunita Patel',
    avatar: '/images/avatar_04.jpg',
    category: 'electrician',
    rating: 4.8,
    reviewCount: 150,
    price: 280,
    description: 'Licensed electrician with expertise in home wiring.',
    isTopRated: true,
  },
  {
    id: '5',
    name: 'Karthik Iyer',
    avatar: '/images/avatar_05.jpg',
    category: 'electrician',
    rating: 4.6,
    reviewCount: 75,
    price: 250,
    description: 'Young and energetic technician specializing in AC repairs.',
    isTopRated: false,
  },
  {
    id: '6',
    name: 'Meera Krishnan',
    avatar: '/images/avatar_06.jpg',
    category: 'tutor',
    rating: 4.9,
    reviewCount: 320,
    price: 450,
    description: 'Experienced STEM tutor with a passion for making complex concepts simple.',
    isTopRated: true,
  },
  {
    id: '7',
    name: 'Vikram Joshi',
    avatar: '/images/avatar_07.jpg',
    category: 'tutor',
    rating: 4.7,
    reviewCount: 110,
    price: 500,
    description: 'Software engineer turned educator. Helps students master Python.',
    isTopRated: false,
  },
  {
    id: '8',
    name: 'Ananya Reddy',
    avatar: '/images/avatar_08.jpg',
    category: 'cleaner',
    rating: 4.8,
    reviewCount: 185,
    price: 199,
    description: 'Meticulous and thorough cleaning professional.',
    isTopRated: true,
  }
];

async function main() {
  console.log('Seeding database with demo providers...');
  for (const provider of providers) {
    await prisma.provider.upsert({
      where: { id: provider.id },
      update: provider,
      create: provider,
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
