import { prisma } from '../index';

export async function syncLeetCodeTasks(registerNumber: string) {
  try {
    const student = await prisma.student.findUnique({
      where: { registerNumber },
      include: {
        leetCodeProfile: true,
        taskAssignments: {
          where: { status: { not: "COMPLETED" } },
          include: { task: true }
        }
      }
    });

    if (!student || !student.leetCodeProfile || !student.leetCodeProfile.username) {
      return { success: false, message: "Student has no LeetCode profile linked" };
    }

    if (student.taskAssignments.length === 0) {
      return { success: true, message: "No pending tasks to sync", completed: 0 };
    }

    const username = student.leetCodeProfile.username;
    
    // Fetch recent accepted submissions
    const res = await fetch(`https://alfa-leetcode-api.onrender.com/${username}/acSubmission`);
    
    if (!res.ok) {
      return { success: false, message: "Failed to fetch LeetCode data" };
    }

    const data = await res.json();
    if (!data.submission || !Array.isArray(data.submission)) {
      return { success: false, message: "Invalid data from LeetCode API" };
    }

    // Submissions usually contain { title, titleSlug, timestamp, statusDisplay }
    const solvedSlugs = new Set(data.submission.map((sub: any) => sub.titleSlug));

    let newlyCompleted = 0;

    for (const assignment of student.taskAssignments) {
      const taskSlug = assignment.task.leetcodeProblem;
      
      if (taskSlug && solvedSlugs.has(taskSlug)) {
        await prisma.taskAssignment.update({
          where: { id: assignment.id },
          data: {
            status: "COMPLETED",
            completedAt: new Date()
          }
        });
        
        // Notify student and assigner
        await prisma.notification.create({
          data: {
            userId: student.id,
            title: "Task Completed",
            message: `Congratulations! Your LeetCode sync verified that you solved "${assignment.task.title}".`
          }
        });
        
        if (assignment.task.createdById && assignment.task.createdByRole) {
          // You could notify the staff/admin here if desired
          await prisma.notification.create({
             data: {
               userId: assignment.task.createdById,
               title: "Student Completed Task",
               message: `${student.name} has completed the task: "${assignment.task.title}".`
             }
          });
        }
        
        newlyCompleted++;
      }
    }

    return { success: true, message: "Sync successful", completed: newlyCompleted };
  } catch (err: any) {
    console.error("Sync error:", err);
    return { success: false, message: err.message };
  }
}
