const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  try {
    const users = await prisma.user.findMany();
    for (const user of users) {
      await prisma.notification.createMany({
        data: [
          {
            userId: user.id,
            title: 'Welcome to FixNest!',
            message: 'Enjoy seamless home services at your fingertips.',
            type: 'system',
            isRead: false
          },
          {
            userId: user.id,
            title: 'Cashback Received 🎁',
            message: '₹50 has been added to your FixNest Wallet for signing up.',
            type: 'wallet',
            isRead: false
          },
          {
            userId: user.id,
            title: 'Security Alert',
            message: 'New login detected from a Windows device.',
            type: 'security',
            isRead: true
          }
        ]
      });
    }
    console.log('Seeded notifications');
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}
seed();
