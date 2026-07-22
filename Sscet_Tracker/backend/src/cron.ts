import cron from 'node-cron';
import { prisma } from './index';
import { sendInactivityWarning } from './email';

// This runs every day at 9:00 AM
export function startCronJobs() {
  console.log("🕒 Initializing Background Cron Jobs...");
  
  cron.schedule('0 9 * * *', async () => {
    console.log("🚀 Running Daily LeetCode Inactivity Check...");
    try {
      const students = await prisma.student.findMany({
        include: { leetCodeProfile: true }
      });

      let inactiveCount = 0;

      for (const student of students) {
        if (!student.leetCodeProfile?.username || !student.email) continue;
        
        try {
          // Fetch from public LeetCode API
          const res = await fetch(`https://leetcode-api-faisalshohag.vercel.app/${student.leetCodeProfile.username}`);
          if (!res.ok) continue;
          
          const data = await res.json();
          // The API doesn't always provide "last active" easily, so a better check in real-world 
          // is fetching the recent submissions
          const subRes = await fetch(`https://leetcode-api-faisalshohag.vercel.app/${student.leetCodeProfile.username}/submission`);
          if (!subRes.ok) continue;
          
          const submissions = await subRes.json();
          
          if (submissions && submissions.submission && submissions.submission.length > 0) {
            const lastSubmissionTime = parseInt(submissions.submission[0].timestamp) * 1000;
            const daysInactive = Math.floor((Date.now() - lastSubmissionTime) / (1000 * 60 * 60 * 24));
            
            // If inactive for more than 3 days
            if (daysInactive >= 3) {
              inactiveCount++;
              console.log(`⚠️ Sending inactivity warning to ${student.name} (${daysInactive} days inactive)`);
              await sendInactivityWarning(student.email, student.name, daysInactive);
            }
          }
        } catch (err) {
          console.error(`Failed to check LeetCode for ${student.name}`, err);
        }
      }
      console.log(`✅ Daily check complete. ${inactiveCount} warnings sent.`);
    } catch (error) {
      console.error("Cron Job Error:", error);
    }
  });
}
