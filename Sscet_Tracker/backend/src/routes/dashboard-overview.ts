import express from 'express';
import { prisma } from '../prisma';
const router = express.Router();

router.get('/overview', async (req, res) => {
  try {
    const totalStudents = await prisma.student.count();
    const totalStaff = await prisma.staff.count();
    const activeStaff = totalStaff;
    
    // Get present/absent students for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const presentStudents = await prisma.attendance.count({
      where: { date: { gte: today } } // Simplified attendance check
    });
    const absentStudents = totalStudents - presentStudents;

    // Assigned vs unassigned students
    const assignedCount = await prisma.staffStudentAssignment.count();
    const unassignedCount = totalStudents - assignedCount;

    // Tasks overview
    const totalTasks = await prisma.task.count();
    const completedTasks = await prisma.taskAssignment.count({ where: { status: 'COMPLETED' } });
    const pendingTasks = await prisma.taskAssignment.count({ where: { status: 'PENDING' } });

    res.json({
      totalStudents,
      totalStaff,
      activeStaff,
      presentStudents,
      absentStudents,
      assignedStudents: assignedCount,
      unassignedStudents: unassignedCount,
      totalTasks,
      completedTasks,
      pendingTasks
    });
  } catch (error) {
    console.error("Dashboard overview error:", error);
    res.status(500).json({ error: "Failed to fetch overview stats" });
  }
});

export default router;
