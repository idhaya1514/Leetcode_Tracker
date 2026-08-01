import { prisma } from '../src/prisma';

async function check() {
  const students = await prisma.student.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log('Total students in DB:', await prisma.student.count());
  console.log('Latest 5 students:');
  console.table(students.map(s => ({ name: s.name, reg: s.registerNumber, admin: s.admissionNumber })));
}

check().finally(() => prisma.$disconnect());
