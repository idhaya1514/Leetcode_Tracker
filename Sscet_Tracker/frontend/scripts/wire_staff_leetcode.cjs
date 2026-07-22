const fs = require('fs');
const path = 'c:/Users/idhay/Downloads/Leetcode_Tracker/Sscet_Tracker/frontend/src/app/App.tsx';

let content = fs.readFileSync(path, 'utf8');

// Add import
if (!content.includes("import StaffLeetCode")) {
  content = content.replace(
    /import StaffStudents from "\.\/components\/StaffStudents";/,
    'import StaffStudents from "./components/StaffStudents";\nimport StaffLeetCode from "./components/StaffLeetCode";'
  );
}

// Replace route
content = content.replace(
  /<Route path="leetcode" element=\{<div className="p-8 text-slate-500 text-lg font-semibold animate-in fade-in">LeetCode Tracker \(Coming Soon\)<\/div>\} \/>/,
  '<Route path="leetcode" element={<StaffLeetCode />} />'
);

fs.writeFileSync(path, content);
console.log("Wired StaffLeetCode to App.tsx");
