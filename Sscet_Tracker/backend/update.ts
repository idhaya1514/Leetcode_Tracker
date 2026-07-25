import { prisma } from './src/prisma';

async function update() {
  const v = await prisma.student.findFirst({
    where: { registerNumber: 'E24AI081' },
    include: { leetCodeProfile: true }
  });

  if (v && v.leetCodeProfile) {
    await prisma.leetCodeProfile.update({
      where: { id: v.leetCodeProfile.id },
      data: {
        username: '04ZNYO4KP2',
        profileUrl: 'https://leetcode.com/u/04ZNYO4KP2/',
        totalSolved: 45,
        easySolved: 6,
        mediumSolved: 36,
        hardSolved: 3,
        lastSync: new Date()
      }
    });
    console.log('Successfully updated Vinothini to 04ZNYO4KP2 with 45 solved!');
  }
}

update().catch(console.error).finally(() => prisma.$disconnect());
