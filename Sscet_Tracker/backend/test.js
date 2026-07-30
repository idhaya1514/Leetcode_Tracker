const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const s = await prisma.student.findFirst({
    where: { 
      email: 'e23ai025@shanmugha.edu.in' 
    }
  });
  console.log('Student found:', s);
}

main().catch(console.error).finally(() => prisma.$disconnect());
