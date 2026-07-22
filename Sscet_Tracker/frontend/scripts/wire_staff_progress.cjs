const fs = require('fs');
const path = 'c:/Users/idhay/Downloads/Leetcode_Tracker/Sscet_Tracker/frontend/src/app/App.tsx';

let content = fs.readFileSync(path, 'utf8');

if (!content.includes("import StaffProgress")) {
  content = content.replace(
    /import StaffAttendance from "\.\/components\/StaffAttendance";/,
    'import StaffAttendance from "./components/StaffAttendance";\nimport StaffProgress from "./components/StaffProgress";'
  );
}

content = content.replace(
  /<Route path="progress" element=\{<div className="p-8 text-slate-500 text-lg font-semibold animate-in fade-in">Daily Progress \(Coming Soon\)<\/div>\} \/>/,
  '<Route path="progress" element={<StaffProgress />} />'
);

fs.writeFileSync(path, content);
console.log("Wired StaffProgress to App.tsx");
