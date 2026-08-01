const xlsx = require('xlsx');

// 1. FRONTEND HACK
const previewData = [
  { registerNumber: '12345', name: 'Test User' },
  { registerNumber: '', name: 'Empty User' }
];

const headers = ["Register Number", "Name", "Department", "Year", "Email", "LeetCode URL"];
const worksheetData = [headers];

previewData.forEach((row, idx) => {
  worksheetData.push([
    row.registerNumber || row.cin || `UNKNOWN_REG_${idx}`, 
    row.name || "Unknown Student",
    row.department || "",
    row.year || "",
    row.email || "",
    row.leetcodeUrl || ""
  ]);
});

const ws = xlsx.utils.aoa_to_sheet(worksheetData);
const wb = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(wb, ws, "Students");

const excelBuffer = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });

// 2. BACKEND PARSE
const workbook = xlsx.read(excelBuffer, { type: 'buffer' });
const sheetName = workbook.SheetNames[0];
const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

console.log("Parsed Data:", data);

for (const row of data) {
  const keys = Object.keys(row);
  const regKey = keys.find(k => k.toLowerCase().includes('reg') || k.toLowerCase().includes('sin') || k.toLowerCase() === 'id');
  const nameKey = keys.find(k => k.toLowerCase().includes('name') || k.toLowerCase() === 'student');

  console.log("Row Keys:", keys);
  console.log("regKey:", regKey, "Value:", row[regKey]);
  console.log("nameKey:", nameKey, "Value:", row[nameKey]);
  
  if (!regKey || !row[regKey]) {
    console.log("SKIPPED: NO REG");
  } else if (!nameKey || !row[nameKey]) {
    console.log("SKIPPED: NO NAME");
  } else {
    console.log("SUCCESS!");
  }
}
