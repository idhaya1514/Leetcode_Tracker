const fs = require('fs');
const path = 'c:/Users/idhay/Downloads/Leetcode_Tracker/Sscet_Tracker/frontend/src/app/App.tsx';

let content = fs.readFileSync(path, 'utf8');

if (!content.includes("import StaffReports")) {
  content = content.replace(
    /import StaffEmails from "\.\/components\/StaffEmails";/,
    'import StaffEmails from "./components/StaffEmails";\nimport StaffReports from "./components/StaffReports";'
  );
}

content = content.replace(
  /<Route path="reports" element=\{<div className="p-8 text-slate-500 text-lg font-semibold animate-in fade-in">Reports \(Coming Soon\)<\/div>\} \/>/,
  '<Route path="reports" element={<StaffReports />} />'
);

fs.writeFileSync(path, content);
console.log("Wired StaffReports to App.tsx");
