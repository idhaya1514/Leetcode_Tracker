import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import * as xlsx from 'xlsx';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';
import ws from 'ws';
import emailRoutes from './routes/emailRoutes';
import dashboardOverviewRouter from './routes/dashboard-overview';
import analyticsRouter from './routes/analytics';
import staffRouter from './routes/staff';
import { initializeCronJobs } from './services/cronService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// --- Email Routes ---
app.use('/api/email', emailRoutes);

// --- Dashboard Routes ---
app.use('/api/dashboard', dashboardOverviewRouter);

// --- Analytics Routes ---
app.use('/api/analytics', analyticsRouter);

// --- Staff Routes ---
app.use('/api/staff', staffRouter);

// --- Initialize Cron Jobs ---
initializeCronJobs();

// --- Health Check ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// --- Auth Routes ---
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    let user = null;
    let leetCodeUsername = undefined;
    let department = undefined;

    if (role === 'student') {
      // Find by email or registerNumber
      user = await prisma.student.findFirst({
        where: { OR: [{ email }, { registerNumber: email }] },
        include: { department: true, leetCodeProfile: true }
      });
      if (user) {
        leetCodeUsername = user.leetCodeProfile?.username;
        department = user.department?.name || user.department?.code;
      }
    }
    else if (role === 'staff') user = await prisma.staff.findUnique({
      where: { email },
      include: { department: true }
    });
    else if (role === 'admin') user = await prisma.admin.findUnique({ where: { email } });

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    // For demonstration if passwords aren't hashed in the DB yet, we can do a direct check or bcrypt check
    const isValid = user.password && (user.password === password || await bcrypt.compare(password, user.password).catch(() => false));

    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role,
        registerNumber: (user as any).registerNumber,
        department: (user as any).department?.name || (user as any).department?.code || department,
        leetCodeUsername,
        staffId: (user as any).staffId
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during login' });
  }
});

// --- Students CRUD ---
app.get('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Find by registerNumber (since the frontend passes registerNumber here)
    const student = await prisma.student.findUnique({
      where: { registerNumber: id },
      include: { department: true, academicYear: true, leetCodeProfile: true }
    });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    res.json({
      id: student.id,
      name: student.name,
      registerNumber: student.registerNumber,
      department: student.department?.name || student.department?.code || '',
      academicYear: student.academicYear?.year || '',
      email: student.email,
      leetCodeUrl: student.leetCodeProfile?.profileUrl,
      leetCodeUsername: student.leetCodeProfile?.username,
      totalSolved: student.leetCodeProfile?.totalSolved || 0,
      createdAt: student.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/students', async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      include: { department: true, academicYear: true, leetCodeProfile: true }
    });
    // Transform to frontend format
    const formatted = students.map(s => ({
      id: s.id,
      name: s.name,
      registerNumber: s.registerNumber,
      department: s.department?.name || '',
      academicYear: s.academicYear?.year || '',
      email: s.email,
      leetCodeUrl: s.leetCodeProfile?.profileUrl,
      leetCodeUsername: s.leetCodeProfile?.username,
      totalSolved: s.leetCodeProfile?.totalSolved || 0,
      createdAt: s.createdAt
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/students/sync-leetcode', async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      include: { leetCodeProfile: true }
    });

    let syncCount = 0;
    const chunkSize = 10;
    for (let i = 0; i < students.length; i += chunkSize) {
      const chunk = students.slice(i, i + chunkSize);
      await Promise.all(chunk.map(async (student) => {
        if (student.leetCodeProfile?.username) {
          try {
            const apiRes = await fetch(`https://leetcode-api-faisalshohag.vercel.app/${student.leetCodeProfile.username}`);
            if (apiRes.ok) {
              const data = await apiRes.json();
              if (data && data.totalSolved !== undefined) {
                await prisma.leetCodeProfile.update({
                  where: { id: student.leetCodeProfile.id },
                  data: {
                    totalSolved: data.totalSolved,
                    easySolved: data.easySolved || 0,
                    mediumSolved: data.mediumSolved || 0,
                    hardSolved: data.hardSolved || 0
                  }
                });
                syncCount++;
              }
            }
          } catch (e) {
            console.error(`Failed to sync ${student.leetCodeProfile.username}`);
          }
        }
      }));
    }
    res.json({ message: 'Sync complete', synced: syncCount });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/students', async (req, res) => {
  try {
    const { name, registerNumber, department, academicYear, email, password, leetCodeUrl, leetCodeUsername } = req.body;

    // Find or create relations
    let dept = department ? await prisma.department.upsert({ where: { code: department.substring(0, 5).toUpperCase() }, update: {}, create: { code: department.substring(0, 5).toUpperCase(), name: department } }) : null;
    let year = academicYear ? await prisma.academicYear.upsert({ where: { year: academicYear }, update: {}, create: { year: academicYear } }) : null;

    const student = await prisma.student.create({
      data: {
        name,
        registerNumber,
        email,
        password, // Ideally hash this
        departmentId: dept?.id,
        academicYearId: year?.id,
      }
    });

    if (leetCodeUsername) {
      let totalSolved = 0, easySolved = 0, mediumSolved = 0, hardSolved = 0;
      try {
        const apiRes = await fetch(`https://leetcode-api-faisalshohag.vercel.app/${leetCodeUsername}`);
        if (apiRes.ok) {
          const data = await apiRes.json();
          if (data && data.totalSolved !== undefined) {
            totalSolved = data.totalSolved;
            easySolved = data.easySolved || 0;
            mediumSolved = data.mediumSolved || 0;
            hardSolved = data.hardSolved || 0;
          }
        }
      } catch (e) {
        console.error("Failed to fetch initial leetcode stats");
      }

      await prisma.leetCodeProfile.create({
        data: {
          studentId: student.id,
          username: leetCodeUsername,
          profileUrl: leetCodeUrl,
          totalSolved,
          easySolved,
          mediumSolved,
          hardSolved
        }
      });
    }
    res.status(201).json(student);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to create student (possibly duplicate Register Number or Email)' });
  }
});

app.put('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, department, academicYear, email, leetCodeUrl, leetCodeUsername } = req.body;

    let dept = department ? await prisma.department.upsert({ where: { code: department.substring(0, 5).toUpperCase() }, update: {}, create: { code: department.substring(0, 5).toUpperCase(), name: department } }) : null;
    let year = academicYear ? await prisma.academicYear.upsert({ where: { year: academicYear }, update: {}, create: { year: academicYear } }) : null;

    const student = await prisma.student.update({
      where: { id },
      data: { name, email, departmentId: dept?.id, academicYearId: year?.id }
    });

    if (leetCodeUsername) {
      await prisma.leetCodeProfile.upsert({
        where: { studentId: id },
        update: { username: leetCodeUsername, profileUrl: leetCodeUrl },
        create: { studentId: id, username: leetCodeUsername, profileUrl: leetCodeUrl }
      });
    }
    res.json(student);
  } catch (error) {
    res.status(400).json({ error: 'Update failed' });
  }
});

app.delete('/api/students/:id', async (req, res) => {
  try {
    await prisma.student.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: 'Delete failed' });
  }
});

// --- Import Route ---
app.post('/api/import/students', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    let successCount = 0; 
    let skippedDuplicates = 0; 
    let emptyRows = 0;

    for (const row of data as any[]) {
      try {
        const keys = Object.keys(row);
        if (keys.length === 0) {
          emptyRows++;
          continue;
        }
        
        // Flexibly find the correct column based on common keywords
        const emailKey = keys.find(k => k.toLowerCase().includes('email') || k.toLowerCase().includes('mail'));
        const regKey = keys.find(k => k.toLowerCase().includes('reg') || k.toLowerCase().includes('sin') || k.toLowerCase() === 'id');
        const nameKey = keys.find(k => k.toLowerCase().includes('name') || k.toLowerCase() === 'student');
        const deptKey = keys.find(k => k.toLowerCase().includes('dept') || k.toLowerCase().includes('department'));
        const yearKey = keys.find(k => k.toLowerCase().includes('year') || k.toLowerCase().includes('batch'));
        const admissionKey = keys.find(k => k.toLowerCase().includes('admission') || k.toLowerCase().includes('admin no'));
        const leetcodeKey = keys.find(k => {
          const lower = k.toLowerCase();
          return lower.includes('leetcode') || lower.includes('link') || lower.includes('url') || lower.includes('profile');
        });

        // We skip rows that have absolutely no Register Number
        if (!regKey || !row[regKey]) {
          emptyRows++;
          continue;
        }

        const registerNumber = row[regKey].toString().trim().toUpperCase();
        
        // Build dynamic update payload
        const studentData: any = {};
        
        if (nameKey && row[nameKey]) {
          studentData.name = row[nameKey].toString().trim();
        }
        
        if (emailKey && row[emailKey]) {
          studentData.email = row[emailKey].toString().toLowerCase().trim();
        }
        if (admissionKey && row[admissionKey]) {
          studentData.admissionNumber = row[admissionKey].toString().trim();
        }

        if (deptKey && row[deptKey]) {
          const deptName = row[deptKey].toString().trim();
          const dept = await prisma.department.upsert({ 
            where: { code: deptName.substring(0, 5).toUpperCase() }, 
            update: {}, 
            create: { code: deptName.substring(0, 5).toUpperCase(), name: deptName } 
          });
          studentData.departmentId = dept.id;
        }

        if (yearKey && row[yearKey]) {
          const yearName = row[yearKey].toString().trim();
          const year = await prisma.academicYear.upsert({ 
            where: { year: yearName }, 
            update: {}, 
            create: { year: yearName } 
          });
          studentData.academicYearId = year.id;
        }

        let leetCodeProfileData = undefined;
        if (leetcodeKey && row[leetcodeKey]) {
          const leetcodeLink = row[leetcodeKey].toString().trim();
          let lcUsername = leetcodeLink;
          if (leetcodeLink.includes('leetcode.com/u/')) {
            lcUsername = leetcodeLink.split('leetcode.com/u/')[1].split('/')[0];
          } else if (leetcodeLink.includes('leetcode.com/')) {
            lcUsername = leetcodeLink.split('leetcode.com/')[1].split('/')[0];
          }
          if (lcUsername) {
            leetCodeProfileData = {
              upsert: {
                create: { username: lcUsername, profileUrl: leetcodeLink },
                update: { username: lcUsername, profileUrl: leetcodeLink }
              }
            };
            studentData.leetCodeProfile = leetCodeProfileData;
          }
        }

        // Upsert student with ONLY the provided fields
        const existingStudent = await prisma.student.findUnique({ where: { registerNumber } });
        
        if (existingStudent) {
          // If the student already exists, update only the provided fields
          await prisma.student.update({
            where: { registerNumber },
            data: studentData
          });
          successCount++;
        } else {
          // New student: Name is strictly required to create a new one!
          if (!studentData.name) {
            emptyRows++;
            continue; // Skip creating if no name provided
          }
          
          await prisma.student.create({
            data: {
              ...studentData,
              registerNumber,
              password: registerNumber // Default password
            }
          });
          successCount++;
        }
      } catch (rowError) {
        // Silently skip completely invalid rows that cause DB errors
        console.error("Row import error:", rowError);
        emptyRows++; 
      }
    }

    res.json({
      message: `${successCount} students imported successfully.`,
      summary: {
        success: successCount,
        skipped: skippedDuplicates,
        empty: emptyRows
      }
    });

  } catch (error: any) {
    console.error("Import Error:", error);
    res.status(500).json({ error: error.message || 'Failed to import students' });
  }
});

// --- TEMPORARY SERVER UPDATE ROUTE ---
app.get('/api/update-server-db', (req, res) => {
  const { exec } = require('child_process');
  
  // This will force the server to update its database schema and regenerate the Prisma client remotely
  exec('npx prisma db push --accept-data-loss && npx prisma generate', { cwd: process.cwd() }, (error: any, stdout: any, stderr: any) => {
    if (error) {
      return res.status(500).json({ error: error.message, stderr });
    }
    res.json({ 
      message: "Server Database successfully updated remotely! Please restart your server if needed.", 
      stdout 
    });
  });
});

// --- Settings ---
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await prisma.settings.findMany();
    const settingsMap = settings.reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);
    res.json(settingsMap);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    const updates = req.body; // Expects an object { key: value, ... }
    const promises = Object.entries(updates).map(([key, value]) => {
      return prisma.settings.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) }
      });
    });
    await Promise.all(promises);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

import { sendPasswordResetOTP } from './email';
import { startCronJobs } from './cron';

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    // Look up the user
    const student = await prisma.student.findUnique({ where: { email } });
    if (!student) return res.status(404).json({ error: 'User not found' });

    // Generate a 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // In a real app, store OTP in DB with an expiration time.
    await prisma.passwordResetOTP.create({
      data: { email, otp, expiresAt: new Date(Date.now() + 5 * 60000) }
    });

    const emailSent = await sendPasswordResetOTP(email, otp);
    if (emailSent) {
      res.json({ success: true, message: 'OTP sent to your email.' });
    } else {
      res.json({ success: true, message: 'Mock OTP generated (SMTP not configured). OTP: ' + otp });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// --- Staff Management ---
app.get('/api/staff/all', async (req, res) => {
  try {
    const staffs = await prisma.staff.findMany({ include: { department: true } });
    res.json(staffs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

app.get('/api/staff/assignments', async (req, res) => {
  try {
    const assignments = await prisma.staffStudentAssignment.findMany();
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

app.post('/api/staff/create', async (req, res) => {
  try {
    const { staffId, name, email, department, password } = req.body;
    let dept = department ? await prisma.department.upsert({ where: { code: department.substring(0, 5).toUpperCase() }, update: {}, create: { code: department.substring(0, 5).toUpperCase(), name: department } }) : null;

    const staff = await prisma.staff.create({
      data: { staffId, name, email, password, departmentId: dept?.id }
    });
    res.json({ success: true, staff });
  } catch (err) {
    res.status(400).json({ success: false, error: 'Failed to create staff' });
  }
});

app.post('/api/staff/assign', async (req, res) => {
  try {
    const { staffId, studentRegisterNumbers } = req.body;
    if (!staffId || !Array.isArray(studentRegisterNumbers)) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const promises = studentRegisterNumbers.map(regNo => {
      return prisma.staffStudentAssignment.upsert({
        where: {
          staffId_studentRegisterNumber: { staffId, studentRegisterNumber: regNo }
        },
        update: {},
        create: { staffId, studentRegisterNumber: regNo }
      });
    });
    await Promise.all(promises);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to assign' });
  }
});

app.get('/api/staff/assignment_history', async (req, res) => {
  // Mock history as there is no schema support yet
  res.json([]);
});

app.delete('/api/staff/assignments/:registerNumber', async (req, res) => {
  try {
    await prisma.staffStudentAssignment.deleteMany({
      where: { studentRegisterNumber: req.params.registerNumber }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove assignment' });
  }
});

// --- Tasks ---
app.post('/api/tasks', async (req, res) => {
  try {
    const {
      taskType = "PROBLEM",
      title,
      description,
      difficulty,
      leetcodeUrl,
      leetcodeProblem,
      topic,
      targetEasy,
      targetMedium,
      targetHard,
      dueDate,
      createdByRole,
      createdById,
      createdByName,
      studentIds
    } = req.body;

    // Create the task
    const task = await prisma.task.create({
      data: {
        taskType,
        title,
        description,
        difficulty,
        leetcodeUrl,
        leetcodeProblem,
        topic,
        targetEasy: targetEasy ? Number(targetEasy) : 0,
        targetMedium: targetMedium ? Number(targetMedium) : 0,
        targetHard: targetHard ? Number(targetHard) : 0,
        dueDate: dueDate ? new Date(dueDate) : null,
        createdByRole,
        createdById,
        createdByName
      }
    });

    // Assign to students
    if (studentIds && Array.isArray(studentIds)) {
      const assignments = studentIds.map((studentRegisterNumber: string) => ({
        studentRegisterNumber,
        taskId: task.id,
        status: "PENDING"
      }));
      await prisma.taskAssignment.createMany({ data: assignments });
    }

    res.json(task);
  } catch (err: any) {
    console.error("Create task error:", err);
    res.status(500).json({ error: 'Failed to create task: ' + err.message });
  }
});

app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        assignments: {
          include: { student: true }
        }
      }
    });
    res.json(tasks);
  } catch (err) {
    console.error("Get tasks error:", err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.get('/api/tasks/student/:registerNumber', async (req, res) => {
  try {
    const { registerNumber } = req.params;
    const assignments = await prisma.taskAssignment.findMany({
      where: { studentRegisterNumber: registerNumber },
      include: { task: true },
      orderBy: { assignedAt: 'desc' }
    });
    res.json(assignments);
  } catch (err) {
    console.error("Get student tasks error:", err);
    res.status(500).json({ error: 'Failed to fetch student tasks' });
  }
});

app.get('/api/tasks/staff/:staffId', async (req, res) => {
  try {
    const { staffId } = req.params;
    const tasks = await prisma.task.findMany({
      where: { createdById: staffId },
      orderBy: { createdAt: 'desc' },
      include: {
        assignments: {
          include: { student: true }
        }
      }
    });
    res.json(tasks);
  } catch (err) {
    console.error("Get staff tasks error:", err);
    res.status(500).json({ error: 'Failed to fetch staff tasks' });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, difficulty, leetcodeUrl, leetcodeProblem, topic, targetEasy, targetMedium, targetHard, dueDate } = req.body;

    const task = await prisma.task.update({
      where: { id },
      data: {
        title, description, difficulty, leetcodeUrl, leetcodeProblem, topic,
        targetEasy: targetEasy ? Number(targetEasy) : 0,
        targetMedium: targetMedium ? Number(targetMedium) : 0,
        targetHard: targetHard ? Number(targetHard) : 0,
        dueDate: dueDate ? new Date(dueDate) : null,
      }
    });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.task.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

import { syncLeetCodeTasks } from './services/leetcodeSync';

app.post('/api/tasks/sync/:registerNumber', async (req, res) => {
  try {
    const { registerNumber } = req.params;
    const result = await syncLeetCodeTasks(registerNumber);
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json({ error: result.message });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to sync tasks' });
  }
});

// --- Student Dashboard ---
app.get('/api/student/dashboard/:registerNumber', async (req, res) => {
  try {
    const { registerNumber } = req.params;
    const student = await prisma.student.findUnique({
      where: { registerNumber },
      include: {
        department: true,
        academicYear: true,
        leetCodeProfile: true,
        taskAssignments: {
          include: { task: true }
        },
        attendanceRecords: true
      }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const history = await prisma.leetCodeDailyProgress.findMany({
      where: {
        studentId: student.id,
        date: { in: [yesterday, today] }
      }
    });

    res.json({
      ...student,
      dailyProgressHistory: history
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

app.put('/api/student/profile/:registerNumber', async (req, res) => {
  try {
    const { registerNumber } = req.params;
    const { mobileNumber } = req.body;
    const student = await prisma.student.update({
      where: { registerNumber },
      data: { mobileNumber }
    });
    res.json(student);
  } catch (err) {
    res.status(400).json({ error: 'Update failed' });
  }
});

// --- Notifications & Messaging ---

app.post('/api/notifications', async (req, res) => {
  try {
    const { userId, title, message } = req.body;
    if (!userId || !title || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const notif = await prisma.notification.create({
      data: { userId, title, message, isRead: false }
    });
    res.json(notif);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

app.get('/api/notifications/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const notifs = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(notifs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

app.put('/api/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const notif = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
    res.json(notif);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

app.get('/api/students/:registerNumber/staff', async (req, res) => {
  try {
    const { registerNumber } = req.params;
    const assignment = await prisma.staffStudentAssignment.findFirst({
      where: { studentRegisterNumber: registerNumber },
      include: { staff: true }
    });
    if (!assignment) {
      return res.status(404).json({ error: 'No staff assigned' });
    }
    res.json(assignment.staff);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch assigned staff' });
  }
});

// Start background cron jobs
startCronJobs();

app.listen(PORT as number, '0.0.0.0', () => console.log("Backend API running on http://localhost:" + PORT));

// Trigger restart
