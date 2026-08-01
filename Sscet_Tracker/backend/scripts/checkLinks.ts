import { prisma } from '../src/prisma';

async function main() {
  const students = await prisma.student.findMany({
    include: { leetCodeProfile: true }
  });

  const linked = students.filter(s => s.leetCodeProfile);
  const notLinked = students.filter(s => !s.leetCodeProfile);
  
  console.log(`Total Linked: ${linked.length}`);
  console.log(`Total Not Linked: ${notLinked.length}`);

  if (notLinked.length > 0) {
    console.log('\nSample of Not Linked students:');
    for (const s of notLinked.slice(0, 10)) {
      console.log(`- ${s.name} (${s.registerNumber})`);
    }
  }
}

main().finally(() => prisma.$disconnect());
