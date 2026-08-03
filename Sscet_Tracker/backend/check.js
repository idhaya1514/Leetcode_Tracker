require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTasks() {
  const tasks = await prisma.task.findMany({
    where: { taskType: 'TARGET' },
    include: { assignments: true }
  });
  console.log(JSON.stringify(tasks, null, 2));
}

checkTasks().catch(console.error).finally(() => prisma.$disconnect());
