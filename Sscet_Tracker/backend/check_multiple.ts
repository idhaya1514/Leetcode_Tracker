import { prisma } from './src/prisma';

async function run() {
  const users = await prisma.student.findMany({ where: { email: 'e23ai025@shanmugha.edu.in' } });
  console.log(users.length);
  console.log(users.map(u => u.password));
}

run().catch(console.error).finally(() => prisma.$disconnect());
