import { prisma } from '../src/prisma';

async function cleanup() {
  const students = await prisma.student.findMany({
    include: { leetCodeProfile: true }
  });

  const regMap = new Map();
  for (const s of students) {
    const upperReg = s.registerNumber.toUpperCase();
    if (!regMap.has(upperReg)) {
      regMap.set(upperReg, []);
    }
    regMap.get(upperReg).push(s);
  }

  for (const [upperReg, group] of regMap.entries()) {
    if (group.length > 1) {
      console.log(`Found duplicates for ${upperReg}:`, group.map((x: any) => x.registerNumber));
      // Sort to prefer the one with a leetcode profile, or the one with uppercase register number
      group.sort((a: any, b: any) => {
        if (a.leetCodeProfile && !b.leetCodeProfile) return -1;
        if (!a.leetCodeProfile && b.leetCodeProfile) return 1;
        if (a.registerNumber === upperReg && b.registerNumber !== upperReg) return -1;
        if (b.registerNumber === upperReg && a.registerNumber !== upperReg) return 1;
        return 0;
      });

      const keep = group[0];
      const remove = group.slice(1);

      // Make sure the one we keep is uppercase
      if (keep.registerNumber !== upperReg) {
        await prisma.student.update({
          where: { id: keep.id },
          data: { registerNumber: upperReg }
        });
        console.log(`Updated to uppercase: ${keep.registerNumber} -> ${upperReg}`);
      }

      for (const r of remove) {
        await prisma.student.delete({ where: { id: r.id } });
        console.log(`Deleted duplicate: ${r.registerNumber} (ID: ${r.id})`);
      }
    } else {
      const s = group[0];
      if (s.registerNumber !== upperReg) {
        await prisma.student.update({
          where: { id: s.id },
          data: { registerNumber: upperReg }
        });
        console.log(`Updated to uppercase: ${s.registerNumber} -> ${upperReg}`);
      }
    }
  }
}

cleanup().then(() => console.log('Cleanup done')).finally(() => prisma.$disconnect());
