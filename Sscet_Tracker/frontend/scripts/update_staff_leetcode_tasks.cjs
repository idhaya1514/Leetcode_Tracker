const fs = require('fs');
const path = 'c:/Users/idhay/Downloads/Leetcode_Tracker/Sscet_Tracker/frontend/src/app/components/StaffLeetCode.tsx';

let content = fs.readFileSync(path, 'utf8');

// Remove Target configuration state and UI
content = content.replace(
  /const \[target, setTarget\] = useState\(\{[\s\S]*?\}\);\s*const \[isConfiguring, setIsConfiguring\] = useState\(false\);\s*const \[tempTarget, setTempTarget\] = useState\(\{ \.\.\.target \}\);/,
  `// Target fetched from Task Management (mocked for now)
  const target = { easy: 3, medium: 2, hard: 1 };`
);

content = content.replace(
  /const saveTarget = \(\) => \{[\s\S]*?\};/,
  ''
);

// Replace header button
content = content.replace(
  /<button onClick=\{\(\) => setIsConfiguring\(!isConfiguring\)\}[\s\S]*?<\/button>/,
  `<div className="px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-semibold rounded-lg shadow-sm flex items-center gap-2">
          <Target className="w-4 h-4" /> Active Task
        </div>`
);

// Remove the configuring panel completely
content = content.replace(
  /\{\/\* Target Configuration Panel \*\/\}[\s\S]*?\{\/\* Overview Cards \*\/\}/,
  `{/* Overview Cards */}`
);

fs.writeFileSync(path, content);
console.log("Updated StaffLeetCode.tsx to rely on assigned tasks");
