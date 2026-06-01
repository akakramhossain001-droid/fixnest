const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const providers = [
  {
    id: '1',
    name: 'Rohan Mehra',
    avatar: '/images/avatar_01.jpg',
    category: 'plumber',
    rating: 4.8,
    reviews: 127,
    price: 299,
    description: 'Certified plumber with 8+ years experience in residential repairs. Specializes in bathroom fittings, pipe installations, and emergency leak repairs. Punctual and tidy workmanship guaranteed.',
    isTopRated: true,
  },
  {
    id: '2',
    name: 'Priya Sharma',
    avatar: '/images/avatar_02.jpg',
    category: 'plumber',
    rating: 4.7,
    reviews: 89,
    price: 349,
    description: 'Reliable, punctual, and tidy. 5+ years serving Bangalore homes with expertise in modern bathroom fixtures and drain systems.',
    isTopRated: false,
  },
  {
    id: '3',
    name: 'Amit Desai',
    avatar: '/images/avatar_03.jpg',
    category: 'plumber',
    rating: 4.9,
    reviews: 203,
    price: 320,
    description: 'Expert in bathroom remodeling and pump installations. 12 years of experience with both residential and commercial plumbing projects.',
    isTopRated: true,
  },
  {
    id: '4',
    name: 'Sunita Patel',
    avatar: '/images/avatar_04.jpg',
    category: 'electrician',
    rating: 4.8,
    reviews: 156,
    price: 280,
    description: 'Licensed electrician with expertise in home wiring, appliance repair, and electrical safety audits. 9 years of trusted service.',
    isTopRated: true,
  },
  {
    id: '5',
    name: 'Karthik Iyer',
    avatar: '/images/avatar_05.jpg',
    category: 'electrician',
    rating: 4.6,
    reviews: 78,
    price: 250,
    description: 'Young and energetic technician specializing in AC repairs, inverter installations, and home automation setups.',
    isTopRated: false,
  },
  {
    id: '6',
    name: 'Meera Krishnan',
    avatar: '/images/avatar_06.jpg',
    category: 'tutor',
    rating: 4.9,
    reviews: 234,
    price: 450,
    description: 'Experienced STEM tutor with a passion for making complex concepts simple. M.Sc. in Physics from IISc. 7 years of tutoring experience.',
    isTopRated: true,
  },
  {
    id: '7',
    name: 'Vikram Joshi',
    avatar: '/images/avatar_07.jpg',
    category: 'tutor',
    rating: 4.7,
    reviews: 112,
    price: 500,
    description: 'Software engineer turned educator. Helps students master Python, data science, and machine learning with practical projects.',
    isTopRated: false,
  },
  {
    id: '8',
    name: 'Ananya Reddy',
    avatar: '/images/avatar_08.jpg',
    category: 'cleaner',
    rating: 4.8,
    reviews: 178,
    price: 199,
    description: 'Meticulous and thorough cleaning professional. Uses eco-friendly products. Specializes in deep cleaning and move-in/move-out cleaning.',
    isTopRated: true,
  },
];

async function main() {
  console.log('Seeding providers...');
  for (const p of providers) {
    await prisma.provider.upsert({
      where: { id: p.id },
      update: p,
      create: p,
    });
  }
  console.log('Done seeding providers!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
