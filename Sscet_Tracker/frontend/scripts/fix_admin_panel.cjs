const fs = require('fs');
const path = 'c:/Users/idhay/Downloads/Leetcode_Tracker/Sscet_Tracker/frontend/src/app/components/AdminPanel.tsx';

let content = fs.readFileSync(path, 'utf8');

// 1. Import useNavigate if missing
if (!content.includes('useNavigate')) {
  content = content.replace(
    /import \{ useState, useEffect \} from "react";/,
    `import { useState, useEffect } from "react";\nimport { useNavigate } from "react-router";`
  );
}

// 2. Add navigate hook and export function
const exportFunc = `
  const navigate = useNavigate();

  const handleExportReport = () => {
    try {
      const csvContent = "data:text/csv;charset=utf-8,Student Name,Department,Year,Status\\nJohn Doe,CSE,3,Active\\nJane Smith,IT,2,Active\\n";
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "system_report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Report downloaded successfully");
    } catch (e) {
      toast.error("Failed to export report");
    }
  };
`;

content = content.replace(
  /const \[isLoading, setIsLoading\] = useState\(false\);/,
  `const [isLoading, setIsLoading] = useState(false);\n${exportFunc}`
);

// 3. Replace Export button and remove Add Student button
const headerButtonsRegex = /<div className="flex items-center gap-3">[\s\S]*?<\/div>/;
content = content.replace(
  headerButtonsRegex,
  `<div className="flex items-center gap-3">
          <button onClick={handleExportReport} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            Export Report
          </button>
        </div>`
);

// 4. Update View Detailed Analytics button
content = content.replace(
  /<button onClick=\{[^}]+\} className="mt-6 w-full py-2\.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2">[\s\S]*?<\/button>/,
  `<button onClick={() => navigate('/admin/performance')} className="mt-6 w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
              View Detailed Analytics <ChevronRight className="w-4 h-4" />
            </button>`
);

fs.writeFileSync(path, content);
console.log("Updated AdminPanel successfully.");
