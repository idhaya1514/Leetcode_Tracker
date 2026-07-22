import { Request, Response } from 'express';
import { prisma } from '../index';
import { sendReminderEmail, sendCongratulationEmail } from '../services/emailService';

/**
 * Helper to get tasks due today and categorize students
 */
const getTasksAndCategorizeStudents = async () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // Fetch tasks due today
  const tasksDueToday = await prisma.task.findMany({
    where: {
      dueDate: {
        gte: startOfDay,
        lte: endOfDay,
      }
    },
    include: {
      assignments: {
        include: {
          student: true,
        }
      },
      submissions: true
    }
  });

  const incomplete: any[] = [];
  const completed: any[] = [];

  for (const task of tasksDueToday) {
    for (const assignment of task.assignments) {
      const student = assignment.student;
      if (!student.email) continue; // Skip if no email

      const submission = task.submissions.find(sub => sub.studentId === student.id);
      
      const isCompleted = submission && (submission.status === 'SUBMITTED' || submission.status === 'GRADED');

      if (isCompleted) {
        completed.push({ student, task, submission });
      } else {
        incomplete.push({ student, task });
      }
    }
  }

  return { incomplete, completed };
};

export const processReminders = async () => {
  const { incomplete } = await getTasksAndCategorizeStudents();
  
  let successCount = 0;
  let failedCount = 0;

  for (const item of incomplete) {
    const result = await sendReminderEmail(
      item.student.email,
      item.student.name,
      item.task.title,
      item.task.dueDate || new Date()
    );
    
    if (result.success) successCount++;
    else failedCount++;
  }

  return { totalEmailsAttempted: incomplete.length, successCount, failedCount };
};

export const processCongratulations = async () => {
  const { completed } = await getTasksAndCategorizeStudents();
  
  let successCount = 0;
  let failedCount = 0;

  for (const item of completed) {
    const result = await sendCongratulationEmail(
      item.student.email,
      item.student.name,
      item.task.title,
      item.submission.submittedAt
    );
    
    if (result.success) successCount++;
    else failedCount++;
  }

  return { totalEmailsAttempted: completed.length, successCount, failedCount };
};

export const triggerReminders = async (req: Request, res: Response): Promise<any> => {
  try {
    const result = await processReminders();
    return res.status(200).json({
      message: 'Reminder emails process finished',
      ...result
    });
  } catch (error: any) {
    console.error('Error in triggerReminders:', error);
    return res.status(500).json({ error: error.message });
  }
};

export const triggerCongratulations = async (req: Request, res: Response): Promise<any> => {
  try {
    const result = await processCongratulations();
    return res.status(200).json({
      message: 'Congratulation emails process finished',
      ...result
    });
  } catch (error: any) {
    console.error('Error in triggerCongratulations:', error);
    return res.status(500).json({ error: error.message });
  }
};
