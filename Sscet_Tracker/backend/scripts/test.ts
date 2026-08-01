import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const students = await prisma.student.findMany({
    include: { leetCodeProfile: true }
  });
  console.log('Profiles:', students.filter(x => x.leetCodeProfile).length);
  console.log('No profiles:', students.filter(x => !x.leetCodeProfile).length);
}

main().finally(() => prisma.$disconnect());
