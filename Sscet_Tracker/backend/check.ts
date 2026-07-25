import { prisma } from './src/prisma';

async function check() {
  const v = await prisma.student.findFirst({
    where: { name: { contains: 'Vinothini', mode: 'insensitive' } },
    include: { leetCodeProfile: true }
  });
  console.log(JSON.stringify(v, null, 2));
}

check().catch(console.error).finally(() => prisma.$disconnect());
