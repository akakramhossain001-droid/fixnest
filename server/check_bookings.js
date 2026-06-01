const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const b = await prisma.booking.findMany({ include: { provider: true } });
  console.log('Bookings:', JSON.stringify(b, null, 2));
}
main().catch(console.dir).finally(() => prisma.$disconnect());
