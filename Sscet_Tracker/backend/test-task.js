const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 
async function run() { 
  const tasks = await prisma.task.findMany({ take: 1 }); 
  console.log(tasks[0]?.id); 
} 
run().catch(console.error).finally(() => prisma.$disconnect());
