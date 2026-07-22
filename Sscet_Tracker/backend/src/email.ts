import nodemailer from 'nodemailer';
import { prisma } from './index';

// Create a reusable transporter using dynamic DB settings or ENV fallback
async function getTransporter() {
  // Ideally, you'd fetch the smtp setting from DB if stored there:
  const smtpSetting = await prisma.settings.findUnique({ where: { key: 'smtpServer' } });
  const smtpHost = smtpSetting?.value || process.env.SMTP_HOST || 'smtp.gmail.com';
  
  // Note: For a real production app, the password/user should be in .env and NOT the DB for security.
  return nodemailer.createTransport({
    host: smtpHost,
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER, // e.g. "your_college_email@gmail.com"
      pass: process.env.SMTP_PASS, // e.g. "gmail_app_password"
    },
  });
}

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("⚠️ SMTP credentials not set in .env. Email would have been sent to:", to);
      console.warn("Subject:", subject);
      return false;
    }
    
    const transporter = await getTransporter();
    const info = await transporter.sendMail({
      from: `"LeetCode Tracker" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log("Email sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

export async function sendPasswordResetOTP(email: string, otp: string) {
  const subject = "Your Password Reset OTP - LeetCode Tracker";
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #4f46e5;">Password Reset Request</h2>
      <p>Hello,</p>
      <p>We received a request to reset your password. Here is your One-Time Password (OTP):</p>
      <h1 style="letter-spacing: 5px; color: #333; background: #f3f4f6; padding: 10px 20px; border-radius: 5px; display: inline-block;">${otp}</h1>
      <p>This OTP is valid for 5 minutes. If you did not request a password reset, please ignore this email.</p>
      <br>
      <p>Best regards,<br>SSCET Admin Team</p>
    </div>
  `;
  return sendEmail(email, subject, html);
}

export async function sendInactivityWarning(email: string, name: string, daysInactive: number) {
  const subject = "LeetCode Performance Alert - Action Required";
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #e11d48;">Inactivity Alert</h2>
      <p>Hello ${name},</p>
      <p>We noticed that you haven't solved any LeetCode problems in the last <strong>${daysInactive} days</strong>.</p>
      <p>Consistent practice is critical for your placement preparation. Please log in to LeetCode and solve at least one problem today to maintain your streak.</p>
      <br>
      <a href="https://leetcode.com/" style="background: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to LeetCode</a>
      <br><br>
      <p>Best regards,<br>SSCET Placement Cell</p>
    </div>
  `;
  return sendEmail(email, subject, html);
}
