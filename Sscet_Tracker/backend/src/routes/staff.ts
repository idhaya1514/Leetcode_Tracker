import express from 'express';
import { prisma } from '../prisma';

const router = express.Router();

router.get('/dashboard/:staffId', async (req, res) => {
  try {
    const { staffId } = req.params;
    
    // 1. Get total assigned students
    const assignments = await prisma.staffStudentAssignment.findMany({
      where: { staffId },
      include: { student: true }
    });
    const totalStudents = assignments.length;
    
    // 2. Get attendance for today for these students
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const studentIds = assignments.map(a => a.student.id);
    
    const presentStudents = await prisma.attendance.count({
      where: {
        studentId: { in: studentIds },
        date: { gte: today },
        status: 'PRESENT'
      }
    });
    const absentStudents = totalStudents - presentStudents;
    
    // 3. Get tasks assigned by this staff
    const staffTasks = await prisma.task.findMany({
      where: { createdById: staffId }
    });
    
    const taskIds = staffTasks.map(t => t.id);
    
    // 4. Get completions for these tasks today
    const completedTasks = await prisma.taskAssignment.count({
      where: {
        taskId: { in: taskIds },
        completedAt: { gte: today },
        status: 'COMPLETED'
      }
    });
    
    // 5. Get pending tasks (assigned by this staff, not completed by assigned students)
    const totalPossibleCompletions = studentIds.length * taskIds.length; // rough estimate if all assigned to all
    const allCompletions = await prisma.taskAssignment.count({
      where: { taskId: { in: taskIds }, status: 'COMPLETED' }
    });
    const pendingTasks = Math.max(0, totalPossibleCompletions - allCompletions);
    
    // Calculate simple percentages
    const avgAttendance = totalStudents > 0 ? Math.round((presentStudents / totalStudents) * 100) : 0;
    const avgPerformance = totalPossibleCompletions > 0 ? Math.round((allCompletions / totalPossibleCompletions) * 100) : 0;
    
    res.json({
      totalStudents,
      presentToday: presentStudents,
      absentToday: absentStudents,
      completedTarget: completedTasks,
      pendingTarget: pendingTasks,
      avgAttendance,
      avgPerformance
    });
  } catch (error) {
    console.error("Staff dashboard error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

router.get('/students/:staffId', async (req, res) => {
  try {
    const { staffId } = req.params;
    const assignments = await prisma.staffStudentAssignment.findMany({
      where: { staffId },
      include: {
        student: {
          include: {
            department: true,
            academicYear: true,
            attendanceRecords: {
              where: { date: { gte: new Date(new Date().setHours(0,0,0,0)) } },
              take: 1
            },
            taskAssignments: {
              where: { 
                completedAt: { gte: new Date(new Date().setHours(0,0,0,0)) },
                status: 'COMPLETED'
              }
            },
            leetCodeProfile: true
          }
        }
      }
    });

    const students = assignments.map(a => {
      const s = a.student;
      const isPresent = s.attendanceRecords.length > 0 && s.attendanceRecords[0].status === 'PRESENT';
      const todaySolved = s.taskAssignments.length;
      const totalSolved = s.leetCodeProfile?.totalSolved || 0;
      const performance = Math.min(100, Math.round((totalSolved / 500) * 100));

      return {
        id: s.id,
        name: s.name,
        registerNumber: s.registerNumber,
        department: s.department?.name || s.departmentId || 'Unknown',
        academicYear: s.academicYear?.year || s.academicYearId || 'I',
        isPresent,
        todaySolved,
        performance
      };
    });

    res.json(students);
  } catch (error) {
    console.error("Staff students error:", error);
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

export default router;
