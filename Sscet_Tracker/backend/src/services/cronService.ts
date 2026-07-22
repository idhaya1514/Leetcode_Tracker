import cron from 'node-cron';
import { processReminders, processCongratulations } from '../controllers/emailController';

/**
 * Initializes all cron jobs for the email system
 */
export const initializeCronJobs = () => {
  // Schedule a task to run every day at 18:00 (6:00 PM) server time.
  cron.schedule('0 18 * * *', async () => {
    console.log('[Cron] Starting automated daily email dispatch...');

    try {
      console.log('[Cron] Processing reminder emails...');
      const reminderResult = await processReminders();
      console.log(`[Cron] Reminders - Attempted: ${reminderResult.totalEmailsAttempted}, Success: ${reminderResult.successCount}, Failed: ${reminderResult.failedCount}`);

      console.log('[Cron] Processing congratulation emails...');
      const congratsResult = await processCongratulations();
      console.log(`[Cron] Congratulations - Attempted: ${congratsResult.totalEmailsAttempted}, Success: ${congratsResult.successCount}, Failed: ${congratsResult.failedCount}`);

    } catch (error) {
      console.error('[Cron] Error during automated email dispatch:', error);
    }
  });

  console.log('[Cron] Scheduled automated email dispatch at 18:00 daily.');
};
