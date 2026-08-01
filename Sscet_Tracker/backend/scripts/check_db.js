const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const students = await prisma.student.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log(students);
}

main().catch(console.error).finally(() => prisma.$disconnect());
