const XLSX = require('xlsx');
const FormData = require('form-data');

async function test() {
  const headers = ["Register Number", "Name", "Department", "Year", "Email", "LeetCode URL"];
  const worksheetData = [
    headers,
    ["TEST1234", "Test Student", "CSE", "2024", "test@test.com", "leetcode.com/test"]
  ];
  
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Students");
  
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
  
  const formData = new FormData();
  formData.append('file', excelBuffer, { filename: 'import.xlsx', contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  const res = await fetch("http://127.0.0.1:3000/api/import/students", {
    method: "POST",
    body: formData
  });

  const text = await res.text();
  console.log("STATUS:", res.status);
  console.log("RESPONSE:", text);
}

test().catch(console.error);
