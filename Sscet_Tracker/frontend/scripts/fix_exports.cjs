const fs = require('fs');
const path = require('path');

const constantsContent = `export const DEPARTMENTS = [
  "Artificial Intelligence and Data Science (AI&DS)",
  "Computer Science and Engineering (CSE)",
  "Cyber Security (CS)",
  "Information Technology (IT)",
  "Biomedical Engineering (BME)",
  "Electrical and Electronics Engineering (EEE)",
  "Electronics and Communication Engineering (ECE)",
  "Mechanical Engineering (MECH)",
  "Agricultural Engineering (AGRI)",
];

export const ACADEMIC_YEARS = [
  "First Year",
  "Second Year",
  "Third Year",
  "Final Year"
];
`;

fs.writeFileSync('c:/Users/idhay/Downloads/Leetcode_Tracker/Sscet_Tracker/frontend/src/app/constants.ts', constantsContent);

function replaceInFile(filePath, search, replace) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(search, replace);
  fs.writeFileSync(filePath, content);
}

// 1. StudentManagement.tsx
let smContent = fs.readFileSync('c:/Users/idhay/Downloads/Leetcode_Tracker/Sscet_Tracker/frontend/src/app/components/StudentManagement.tsx', 'utf8');
smContent = smContent.replace(/const DEPARTMENTS = \[[\s\S]*?\];/, '');
smContent = smContent.replace(/const ACADEMIC_YEARS = \[[\s\S]*?\];/, '');
if (!smContent.includes('import { DEPARTMENTS, ACADEMIC_YEARS }')) {
  smContent = smContent.replace(
    /import \{ toast \} from "sonner";/,
    `import { toast } from "sonner";\nimport { DEPARTMENTS, ACADEMIC_YEARS } from "../constants";`
  );
}
fs.writeFileSync('c:/Users/idhay/Downloads/Leetcode_Tracker/Sscet_Tracker/frontend/src/app/components/StudentManagement.tsx', smContent);

// 2. DailyTracker.tsx
replaceInFile(
  'c:/Users/idhay/Downloads/Leetcode_Tracker/Sscet_Tracker/frontend/src/app/components/DailyTracker.tsx',
  /import \{ DEPARTMENTS \} from "\.\/StudentManagement";/g,
  `import { DEPARTMENTS } from "../constants";`
);

// 3. StudentPerformance.tsx
replaceInFile(
  'c:/Users/idhay/Downloads/Leetcode_Tracker/Sscet_Tracker/frontend/src/app/components/StudentPerformance.tsx',
  /import \{ DEPARTMENTS \} from "\.\/StudentManagement";/g,
  `import { DEPARTMENTS } from "../constants";`
);

// 4. LoginPage.tsx
let lpContent = fs.readFileSync('c:/Users/idhay/Downloads/Leetcode_Tracker/Sscet_Tracker/frontend/src/app/components/LoginPage.tsx', 'utf8');
lpContent = lpContent.replace(/const DEPARTMENTS = \[[\s\S]*?\];/, '');
lpContent = lpContent.replace(/const ACADEMIC_YEARS = \[[\s\S]*?\];/, '');
if (!lpContent.includes('import { DEPARTMENTS, ACADEMIC_YEARS }')) {
  lpContent = lpContent.replace(
    /import \{ toast \} from "sonner";/,
    `import { toast } from "sonner";\nimport { DEPARTMENTS, ACADEMIC_YEARS } from "../constants";`
  );
}
fs.writeFileSync('c:/Users/idhay/Downloads/Leetcode_Tracker/Sscet_Tracker/frontend/src/app/components/LoginPage.tsx', lpContent);

console.log("Fixed DEPARTMENTS missing export error");
