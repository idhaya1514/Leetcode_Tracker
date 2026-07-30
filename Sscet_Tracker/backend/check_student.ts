import { prisma } from './src/prisma';

async function checkStudent() {
  const v = await prisma.student.findMany({
    where: { 
      OR: [
        { email: 'e23ai025@shanmugha.edu.in' },
        { registerNumber: 'e23ai025@shanmugha.edu.in' } // check if they put email in registerNumber
      ]
    }
  });
  console.log(JSON.stringify(v, null, 2));
}

checkStudent().catch(console.error).finally(() => prisma.$disconnect());
