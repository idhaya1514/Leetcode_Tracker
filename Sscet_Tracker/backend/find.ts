import { prisma } from './src/prisma';

async function find() {
  const v = await prisma.leetCodeProfile.findUnique({
    where: { username: '04ZNYO4KP2' },
    include: { student: true }
  });
  console.log(JSON.stringify(v, null, 2));
}

find().catch(console.error).finally(() => prisma.$disconnect());
