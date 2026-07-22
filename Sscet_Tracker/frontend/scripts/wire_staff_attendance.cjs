const fs = require('fs');
const path = 'c:/Users/idhay/Downloads/Leetcode_Tracker/Sscet_Tracker/frontend/src/app/App.tsx';

let content = fs.readFileSync(path, 'utf8');

if (!content.includes("import StaffAttendance")) {
  content = content.replace(
    /import StaffLeetCode from "\.\/components\/StaffLeetCode";/,
    'import StaffLeetCode from "./components/StaffLeetCode";\nimport StaffAttendance from "./components/StaffAttendance";'
  );
}

content = content.replace(
  /<Route path="attendance" element=\{<div className="p-8 text-slate-500 text-lg font-semibold animate-in fade-in">Daily Attendance \(Coming Soon\)<\/div>\} \/>/,
  '<Route path="attendance" element={<StaffAttendance />} />'
);

fs.writeFileSync(path, content);
console.log("Wired StaffAttendance to App.tsx");
