import express from 'express';
import { prisma } from '../prisma';
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { department, year, section } = req.query;

    const whereClause: any = {};
    if (department && department !== 'All') {
      whereClause.department = { code: department };
    }
    if (year && year !== 'All') {
      whereClause.academicYear = { year: year };
    }

    // 1. Department-wise Statistics
    const studentsByDept = await prisma.student.groupBy({
      by: ['departmentId'],
      _count: { id: true },
      where: whereClause
    });
    
    // Fetch department names to map
    const departments = await prisma.department.findMany();
    const deptMap = new Map(departments.map(d => [d.id, d.code]));

    const deptStats = studentsByDept.map(s => ({
      name: s.departmentId ? deptMap.get(s.departmentId) || 'Unknown' : 'Unknown',
      total: s._count.id,
      linked: 0, // Placeholder, will calculate below
      unlinked: s._count.id
    }));

    // Calculate linked by department
    const linkedByDept = await prisma.student.groupBy({
      by: ['departmentId'],
      _count: { id: true },
      where: { ...whereClause, leetCodeProfile: { isNot: null } }
    });

    linkedByDept.forEach(l => {
      const name = l.departmentId ? deptMap.get(l.departmentId) : undefined;
      const stat = deptStats.find(d => d.name === name);
      if (stat) {
        stat.linked = l._count.id;
        stat.unlinked = stat.total - stat.linked;
      }
    });

    // 2. Year-wise Statistics
    const studentsByYear = await prisma.student.groupBy({
      by: ['academicYearId'],
      _count: { id: true },
      where: whereClause
    });

    const academicYears = await prisma.academicYear.findMany();
    const yearMap = new Map(academicYears.map(y => [y.id, y.year]));

    const yearStats = studentsByYear.map(s => ({
      name: s.academicYearId ? yearMap.get(s.academicYearId) || 'Unknown' : 'Unknown',
      total: s._count.id
    }));

    // 3. Section-wise Statistics (Not fully modeled in schema, returning mock for now if section doesn't exist)
    const sectionStats = [
      { name: 'A', total: 0 },
      { name: 'B', total: 0 }
    ];

    res.json({
      departmentStats: deptStats,
      yearStats: yearStats,
      sectionStats: sectionStats
    });
  } catch (error) {
    console.error("Analytics fetch error:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

export default router;
