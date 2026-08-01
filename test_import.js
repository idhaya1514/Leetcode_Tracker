const XLSX = require('xlsx');

function test() {
  const headers = ["Register Number", "Name", "Department", "Year", "Email", "LeetCode URL"];
  const worksheetData = [
    headers,
    ["", "", "", "", "", ""] // Test what happens if values are empty strings
  ];
  
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);
  const json = XLSX.utils.sheet_to_json(ws);
  console.log("JSON RESULT FOR EMPTY STRINGS:", json);

  const worksheetData2 = [
    headers,
    ["   ", "Unknown Student", "", "", "", ""] 
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(worksheetData2);
  const json2 = XLSX.utils.sheet_to_json(ws2);
  console.log("JSON RESULT FOR SPACES:", json2);
}

test();
