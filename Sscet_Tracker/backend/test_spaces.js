const xlsx = require('xlsx');

const headers = ["Register Number", "Name", "Department", "Year", "Email", "LeetCode URL"];
const worksheetData = [
  headers,
  ["   ", "Test Name", undefined, undefined, undefined, undefined],
  ["ValidReg", "   ", undefined, undefined, undefined, undefined]
];

const ws = xlsx.utils.aoa_to_sheet(worksheetData);
const wb = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(wb, ws, "Students");
const excelBuffer = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });

const workbook = xlsx.read(excelBuffer, { type: 'buffer' });
const sheetName = workbook.SheetNames[0];
const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

for (const row of data) {
  let email, registerNumber, name;
  for (const key of Object.keys(row)) {
    const lowerKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (lowerKey.includes('email')) email = row[key]?.toString().toLowerCase().trim();
    else if (lowerKey.includes('registernumber') || lowerKey === 'sin') registerNumber = row[key]?.toString().trim();
    else if (lowerKey.includes('studentname') || lowerKey === 'name') name = row[key]?.toString().trim();
  }
  
  if (!registerNumber || !name) {
    console.log("FAILED: Missing required fields (Register Number, Student Name)");
  } else {
    console.log("SUCCESS:", registerNumber, name);
  }
}
