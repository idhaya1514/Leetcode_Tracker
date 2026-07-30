import { prisma } from './src/prisma';

async function run() {
  const user = await prisma.student.findUnique({
    where: { email: 'e23ai025@shanmugha.edu.in' },
    include: { leetCodeProfile: true }
  });
  console.log('Username:', user?.leetCodeProfile?.username);
}

run().finally(() => prisma.$disconnect());
