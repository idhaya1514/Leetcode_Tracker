import * as XLSX from 'xlsx';

async function main() {
  const wb = XLSX.readFile('../students.xlsx');
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rawData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  
  const students = rawData.map((row: any, idx: number) => {
    let mapped: any = {};
    for (const key of Object.keys(row)) {
      const lower = key.toLowerCase();
      if (lower.includes('name')) mapped.name = row[key];
      if (lower.includes('reg') || lower.includes('roll')) mapped.registerNumber = row[key];
      if (lower.includes('cin')) mapped.cin = row[key];
      if (lower.includes('email')) mapped.email = row[key];
      if (lower.includes('dept') || lower.includes('branch')) mapped.department = row[key];
      if (lower.includes('year')) mapped.year = row[key];
      if (lower.includes('leetcode') || lower.includes('lc')) mapped.leetcodeUrl = row[key];
    }
    
    // Add fallbacks just like frontend
    if (!mapped.name) mapped.name = "Unknown Student";
    if (!mapped.registerNumber && !mapped.cin) mapped.registerNumber = `UNKNOWN_REG_${idx}`;
    return mapped;
  }).filter((row: any) => row.name !== "Unknown Student" || !row.registerNumber?.startsWith('UNKNOWN_REG_'));

  console.log(`Prepared ${students.length} students to import...`);

  const res = await fetch('http://localhost:3000/api/students/import-v2', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ students })
  });

  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Response:', text);
}

main().catch(console.error);
