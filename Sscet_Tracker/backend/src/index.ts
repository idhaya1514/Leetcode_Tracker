import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import * as xlsx from 'xlsx';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

dotenv.config();

const app = express();

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
export const prisma = new PrismaClient({ adapter });

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

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
    else if (role === 'staff') user = await prisma.staff.findUnique({ where: { email } });
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
        department,
        leetCodeUsername
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
    for (const student of students) {
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
    let dept = department ? await prisma.department.upsert({ where: { code: department.substring(0,5).toUpperCase() }, update: {}, create: { code: department.substring(0,5).toUpperCase(), name: department } }) : null;
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

    let dept = department ? await prisma.department.upsert({ where: { code: department.substring(0,5).toUpperCase() }, update: {}, create: { code: department.substring(0,5).toUpperCase(), name: department } }) : null;
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

    let successCount = 0; let failedCount = 0; const errors = [];

    for (const row of data as any[]) {
      try {
        const email = row['Email']?.toString().toLowerCase().trim();
        const registerNumber = row['Register Number']?.toString().trim();
        const name = row['Student Name']?.toString().trim();
        const deptName = row['Department']?.toString().trim();
        const yearName = row['Academic Year']?.toString().trim();

        if (!email || !registerNumber || !name) {
          failedCount++; errors.push({ row, error: 'Missing required fields' }); continue;
        }

        let dept = deptName ? await prisma.department.upsert({ where: { code: deptName.substring(0,5).toUpperCase() }, update: {}, create: { code: deptName.substring(0,5).toUpperCase(), name: deptName } }) : null;
        let year = yearName ? await prisma.academicYear.upsert({ where: { year: yearName }, update: {}, create: { year: yearName } }) : null;

        await prisma.student.upsert({
          where: { registerNumber },
          update: { name, email, departmentId: dept?.id, academicYearId: year?.id },
          create: { name, email, registerNumber, password: registerNumber, departmentId: dept?.id, academicYearId: year?.id }
        });
        successCount++;
      } catch (err: any) {
        failedCount++; errors.push({ row, error: err.message });
      }
    }
    res.json({ message: 'Import complete', summary: { total: data.length, success: successCount, failed: failedCount }, errors });
  } catch (error) {
    res.status(500).json({ error: 'Server error during import' });
  }
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
    let dept = department ? await prisma.department.upsert({ where: { code: department.substring(0,5).toUpperCase() }, update: {}, create: { code: department.substring(0,5).toUpperCase(), name: department } }) : null;
    
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
        taskSubmissions: {
          include: { task: true }
        },
        assignments: {
          include: { task: true }
        },
        attendanceRecords: true
      }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(student);
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

// Start background cron jobs
startCronJobs();

app.listen(PORT, () => console.log("Backend API running on http://localhost:" + PORT));
