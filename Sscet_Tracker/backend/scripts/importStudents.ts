import { prisma } from '../src/prisma';
import bcrypt from 'bcrypt';
import csvParser from 'csv-parser';
import { Readable } from 'stream';

async function main() {
  const url = 'https://docs.google.com/spreadsheets/d/1kO1-1fd3OV6Ca6bIWMffQjUNyXY86uTuRoRfCxpInCw/export?format=csv&gid=222577608';
  
  console.log(`Fetching CSV from ${url}...`);
  const response = await fetch(url);
  const text = await response.text();
  
  const results: any[] = [];
  const stream = Readable.from([text]);

  // Read CSV
  await new Promise((resolve, reject) => {
    stream
      .pipe(csvParser({ headers: false }))
      .on('data', (data) => results.push(data))
      .on('end', resolve)
      .on('error', reject);
  });

  const studentsToAdd = [];
  const seenRegisters = new Set();
  const seenEmails = new Set();
  const defaultPassword = await bcrypt.hash('Test@123', 10);

  let skippedMissing = 0;
  let skippedDuplicates = 0;

  for (const row of results) {
    const nameStr = row['0'] || '';
    
    // Skip empty lines or header rows
    if (!nameStr || nameStr.trim().toLowerCase() === 'name' || nameStr.includes('YEAR')) {
      continue;
    }

    const name = row['0']?.trim();
    const registerNumber = row['1']?.trim().toUpperCase();
    const email = row['2']?.trim().toLowerCase();
    let deptName = row['3']?.trim();
    let yearName = row['4']?.trim();
    const leetcodeLink = row['5']?.trim();

    // Automatically determine department and year if missing
    if (!deptName || !yearName) {
      let parsedDeptCode = null;
      let parsedYearCode = null;
      
      const match = registerNumber ? registerNumber.match(/^(E\d{2})([A-Z]+)\d*$/i) : null;
      if (match) {
        parsedYearCode = match[1].toUpperCase();
        parsedDeptCode = match[2].toUpperCase();
      }

      if (!deptName) {
        if (parsedDeptCode) {
          const deptMap: Record<string, string> = {
            'CS': 'Computer Science and Engineering',
            'IT': 'Information Technology',
            'AI': 'Artificial Intelligence and Data Science',
            'CY': 'Cyber Security',
            'EC': 'Electronics and Communication Engineering',
            'BM': 'Biomedical Engineering',
            'ME': 'Mechanical Engineering',
            'AG': 'Agricultural Engineering'
          };
          deptName = 'Others';
          for (const [key, value] of Object.entries(deptMap)) {
            if (parsedDeptCode.startsWith(key)) {
              deptName = value;
              break;
            }
          }
        } else {
          deptName = 'Others';
        }
      }

      if (!yearName) {
        if (parsedYearCode) {
          const yearMap: Record<string, string> = {
            'E23': 'Final Year',
            'E24': 'Third Year',
            'E25': 'Second Year',
            'E26': 'First Year'
          };
          yearName = yearMap[parsedYearCode] || 'Others';
        } else {
          yearName = 'Others';
        }
      }
    }

    // 1. Check if any field is missing (deptName and yearName are guaranteed to have a value now)
    if (!name || !registerNumber || !email || !leetcodeLink) {
      if (name || registerNumber || email) { // only count actual attempts, not blank lines
        skippedMissing++;
        console.log(`Skipping (missing fields): ${name || 'Unknown'} - ${registerNumber || 'Unknown'}`);
      }
      continue;
    }

    // 2. Check for duplicates in current sheet
    if (seenRegisters.has(registerNumber) || seenEmails.has(email)) {
      skippedDuplicates++;
      console.log(`Skipping (duplicate in sheet): ${name} - ${registerNumber}`);
      continue;
    }

    // Check for duplicates in current sheet
    if (seenRegisters.has(registerNumber) || seenEmails.has(email)) {
      skippedDuplicates++;
      console.log(`Skipping (duplicate in sheet): ${name} - ${registerNumber}`);
      continue;
    }

    seenRegisters.add(registerNumber);
    seenEmails.add(email);

    // Ensure Department exists
    let department = await prisma.department.findUnique({ where: { code: deptName } });
    if (!department) {
      department = await prisma.department.create({ data: { code: deptName, name: deptName } });
    }

    // Ensure AcademicYear exists
    let academicYear = await prisma.academicYear.findUnique({ where: { year: yearName } });
    if (!academicYear) {
      academicYear = await prisma.academicYear.create({ data: { year: yearName } });
    }

    // Extract LeetCode username
    let lcUsername = leetcodeLink;
    if (leetcodeLink.includes('leetcode.com/u/')) {
        lcUsername = leetcodeLink.split('leetcode.com/u/')[1].split('/')[0];
    } else if (leetcodeLink.includes('leetcode.com/')) {
        lcUsername = leetcodeLink.split('leetcode.com/')[1].split('/')[0];
    }
    
    studentsToAdd.push({
      name,
      registerNumber,
      email,
      departmentId: department.id,
      academicYearId: academicYear.id,
      password: defaultPassword,
      leetcodeLink,
      lcUsername
    });
  }

  console.log(`\nFound ${studentsToAdd.length} valid students to add/update.`);
  console.log(`Skipped ${skippedMissing} due to missing fields.`);
  console.log(`Skipped ${skippedDuplicates} duplicates in sheet.`);

  for (const st of studentsToAdd) {
    try {
      await prisma.student.upsert({
        where: { registerNumber: st.registerNumber },
        update: {
          name: st.name,
          email: st.email,
          departmentId: st.departmentId,
          academicYearId: st.academicYearId,
          leetCodeProfile: {
            upsert: {
              create: { username: st.lcUsername, profileUrl: st.leetcodeLink },
              update: { username: st.lcUsername, profileUrl: st.leetcodeLink }
            }
          }
        },
        create: {
          name: st.name,
          registerNumber: st.registerNumber,
          email: st.email,
          password: st.password,
          departmentId: st.departmentId,
          academicYearId: st.academicYearId,
          leetCodeProfile: {
            create: {
              username: st.lcUsername,
              profileUrl: st.leetcodeLink
            }
          }
        }
      });
      console.log(`Upserted: ${st.name} (${st.registerNumber})`);
    } catch (e: any) {
      console.error(`Error adding ${st.name}:`, e.message);
    }
  }

  console.log('\nImport finished successfully.');
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
