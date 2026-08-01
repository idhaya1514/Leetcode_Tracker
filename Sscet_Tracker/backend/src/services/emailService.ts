import nodemailer from 'nodemailer';
import { prisma } from '../prisma';

/**
 * Configure Transporter
 * Using process.env.EMAIL_USER and process.env.EMAIL_PASS
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendReminderEmail = async (studentEmail: string, studentName: string, taskTitle: string, dueDate: Date) => {
  const subject = `Reminder: Please complete today's assigned LeetCode problem`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #eaeaea; border-radius: 8px;">
      <h2 style="color: #e11d48;">Incomplete Task Reminder</h2>
      <p>Hello <strong>${studentName}</strong>,</p>
      <p>This is a gentle reminder that you have not yet completed the following assigned LeetCode task:</p>
      <div style="background: #f8fafc; padding: 15px; border-left: 4px solid #e11d48; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0;">${taskTitle}</h3>
        <p style="margin: 0; color: #64748b;">Due Date: ${dueDate.toDateString()}</p>
      </div>
      <p>Please log in to your LeetCode Tracker and complete the task as soon as possible to maintain your progress.</p>
      <br>
      <p>Best regards,<br>SSCET Admin Team</p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"SSCET Task Tracker" <${process.env.EMAIL_USER}>`,
      to: studentEmail,
      subject,
      html,
    });
    
    await prisma.emailLog.create({
      data: {
        recipient: studentEmail,
        subject,
        status: 'SUCCESS'
      }
    });

    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('Failed to send reminder email to', studentEmail, error);
    await prisma.emailLog.create({
      data: {
        recipient: studentEmail,
        subject,
        status: 'FAILED'
      }
    });
    return { success: false, error: error.message };
  }
};

export const sendCongratulationEmail = async (studentEmail: string, studentName: string, taskTitle: string, completionDate: Date) => {
  const subject = `Congratulations! You completed today's LeetCode task.`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #eaeaea; border-radius: 8px;">
      <h2 style="color: #10b981;">Task Completed! 🎉</h2>
      <p>Hello <strong>${studentName}</strong>,</p>
      <p>Congratulations on successfully completing your assigned LeetCode task:</p>
      <div style="background: #f8fafc; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0;">${taskTitle}</h3>
        <p style="margin: 0; color: #64748b;">Completed On: ${completionDate.toDateString()}</p>
      </div>
      <p>Great job! Consistency is the key to mastering data structures and algorithms. Keep up the excellent work!</p>
      <br>
      <p>Best regards,<br>SSCET Admin Team</p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"SSCET Task Tracker" <${process.env.EMAIL_USER}>`,
      to: studentEmail,
      subject,
      html,
    });
    
    await prisma.emailLog.create({
      data: {
        recipient: studentEmail,
        subject,
        status: 'SUCCESS'
      }
    });

    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('Failed to send congratulation email to', studentEmail, error);
    await prisma.emailLog.create({
      data: {
        recipient: studentEmail,
        subject,
        status: 'FAILED'
      }
    });
    return { success: false, error: error.message };
  }
};
