const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const p = await prisma.provider.findMany();
  console.log('Providers in DB:', p);
}
main().catch(console.dir).finally(() => prisma.$disconnect());
