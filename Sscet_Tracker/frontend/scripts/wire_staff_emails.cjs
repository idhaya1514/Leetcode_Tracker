const fs = require('fs');
const path = 'c:/Users/idhay/Downloads/Leetcode_Tracker/Sscet_Tracker/frontend/src/app/App.tsx';

let content = fs.readFileSync(path, 'utf8');

if (!content.includes("import StaffEmails")) {
  content = content.replace(
    /import StaffTasks from "\.\/components\/StaffTasks";/,
    'import StaffTasks from "./components/StaffTasks";\nimport StaffEmails from "./components/StaffEmails";'
  );
}

content = content.replace(
  /<Route path="emails" element=\{<div className="p-8 text-slate-500 text-lg font-semibold animate-in fade-in">Email Center \(Coming Soon\)<\/div>\} \/>/,
  '<Route path="emails" element={<StaffEmails />} />'
);

fs.writeFileSync(path, content);
console.log("Wired StaffEmails to App.tsx");
