const fs = require('fs');
const path = 'c:/Users/idhay/Downloads/Leetcode_Tracker/Sscet_Tracker/frontend/src/app/App.tsx';

let content = fs.readFileSync(path, 'utf8');

// Add import
if (!content.includes("import StaffStudents")) {
  content = content.replace(
    /import StaffDashboard from "\.\/components\/StaffDashboard";/,
    'import StaffDashboard from "./components/StaffDashboard";\nimport StaffStudents from "./components/StaffStudents";'
  );
}

// Replace route
content = content.replace(
  /<Route path="students" element=\{<div className="p-8 text-slate-500 text-lg font-semibold animate-in fade-in">Students Module \(Coming Soon\)<\/div>\} \/>/,
  '<Route path="students" element={<StaffStudents />} />'
);

fs.writeFileSync(path, content);
console.log("Wired StaffStudents to App.tsx");
