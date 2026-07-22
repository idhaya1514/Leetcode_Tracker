const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const students = await prisma.student.findMany({
    where: { name: { contains: 'idhaya', mode: 'insensitive' } }
  });
  console.log('Students found:', students);

  if (students.length > 0) {
    const deletedStudents = await prisma.student.deleteMany({
      where: { name: { contains: 'idhaya', mode: 'insensitive' } }
    });
    console.log('Deleted students:', deletedStudents);
  }

  const staffs = await prisma.staff.findMany({
    where: { name: { contains: 'arun', mode: 'insensitive' } }
  });
  console.log('Staffs found:', staffs);

  if (staffs.length > 0) {
    const deletedStaffs = await prisma.staff.deleteMany({
      where: { name: { contains: 'arun', mode: 'insensitive' } }
    });
    console.log('Deleted staffs:', deletedStaffs);
  }
}

main().finally(() => prisma.$disconnect());
