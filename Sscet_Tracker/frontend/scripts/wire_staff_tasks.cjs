const fs = require('fs');
const path = 'c:/Users/idhay/Downloads/Leetcode_Tracker/Sscet_Tracker/frontend/src/app/App.tsx';

let content = fs.readFileSync(path, 'utf8');

if (!content.includes("import StaffTasks")) {
  content = content.replace(
    /import StaffProgress from "\.\/components\/StaffProgress";/,
    'import StaffProgress from "./components/StaffProgress";\nimport StaffTasks from "./components/StaffTasks";'
  );
}

content = content.replace(
  /<Route path="tasks" element=\{<div className="p-8 text-slate-500 text-lg font-semibold animate-in fade-in">Task Management \(Coming Soon\)<\/div>\} \/>/,
  '<Route path="tasks" element={<StaffTasks />} />'
);

fs.writeFileSync(path, content);
console.log("Wired StaffTasks to App.tsx");
