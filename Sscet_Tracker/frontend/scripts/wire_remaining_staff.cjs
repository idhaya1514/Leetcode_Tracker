const fs = require('fs');
const path = 'c:/Users/idhay/Downloads/Leetcode_Tracker/Sscet_Tracker/frontend/src/app/App.tsx';

let content = fs.readFileSync(path, 'utf8');

if (!content.includes("import StaffNotifications")) {
  content = content.replace(
    /import StaffReports from "\.\/components\/StaffReports";/,
    'import StaffReports from "./components/StaffReports";\nimport StaffNotifications from "./components/StaffNotifications";\nimport StaffProfile from "./components/StaffProfile";\nimport StaffSettings from "./components/StaffSettings";'
  );
}

content = content.replace(
  /<Route path="notifications" element=\{<div className="p-8 text-slate-500 text-lg font-semibold animate-in fade-in">Notifications \(Coming Soon\)<\/div>\} \/>/,
  '<Route path="notifications" element={<StaffNotifications />} />'
);

content = content.replace(
  /<Route path="profile" element=\{<div className="p-8 text-slate-500 text-lg font-semibold animate-in fade-in">Profile \(Coming Soon\)<\/div>\} \/>/,
  '<Route path="profile" element={<StaffProfile staff={staff} onLogout={handleStaffLogout} />} />'
);

content = content.replace(
  /<Route path="settings" element=\{<div className="p-8 text-slate-500 text-lg font-semibold animate-in fade-in">Settings \(Coming Soon\)<\/div>\} \/>/,
  '<Route path="settings" element={<StaffSettings />} />'
);

fs.writeFileSync(path, content);
console.log("Wired remaining components to App.tsx");
