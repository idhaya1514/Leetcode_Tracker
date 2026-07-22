const fs = require('fs');

// 1. Topbar.tsx - Remove search, update Department text for Admin
const topbarPath = 'c:/Users/idhay/Downloads/Leetcode_Tracker/Sscet_Tracker/frontend/src/app/components/layouts/Topbar.tsx';
let topbar = fs.readFileSync(topbarPath, 'utf8');

// Remove search input
topbar = topbar.replace(
  /<div className="hidden md:flex items-center gap-2 px-3 py-1\.5 bg-slate-100 rounded-lg text-slate-500 focus-within:ring-2 focus-within:ring-blue-500\/20 focus-within:bg-white transition-all">[\s\S]*?<\/div>/,
  ''
);

// Add dynamic text for admin profile
topbar = topbar.replace(
  /<div className="flex justify-between items-center text-sm">\s*<span className="text-slate-500">Department<\/span>\s*<span className="font-semibold text-slate-700">Computer Science<\/span>\s*<\/div>\s*<div className="flex justify-between items-center text-sm">\s*<span className="text-slate-500">Assigned Students<\/span>\s*<span className="font-semibold text-slate-700 bg-blue-50 text-blue-700 px-2 py-0\.5 rounded-md">35<\/span>\s*<\/div>/,
  `{userRole === "Administrator" ? (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Department</span>
                      <span className="font-semibold text-slate-700">All</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Total Students</span>
                      <span className="font-semibold text-slate-700 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md">1,240</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Department</span>
                      <span className="font-semibold text-slate-700">Computer Science</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Assigned Students</span>
                      <span className="font-semibold text-slate-700 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md">35</span>
                    </div>
                  </>
                )}`
);
fs.writeFileSync(topbarPath, topbar);


// 2. AdminPanel.tsx - Remove Add Student button, fix analytics/export buttons
const adminPanelPath = 'c:/Users/idhay/Downloads/Leetcode_Tracker/Sscet_Tracker/frontend/src/app/components/AdminPanel.tsx';
let adminPanel = fs.readFileSync(adminPanelPath, 'utf8');

if (!adminPanel.includes('import { toast }')) {
  adminPanel = adminPanel.replace(/import \{([^}]+)\} from "lucide-react";/, 'import { $1 } from "lucide-react";\nimport { toast } from "sonner";');
}

adminPanel = adminPanel.replace(
  /<button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm shadow-indigo-200 flex items-center gap-2">\s*<Plus className="w-4 h-4" \/>\s*Add Student\s*<\/button>/g,
  ''
);

adminPanel = adminPanel.replace(
  /<button className="px-3 py-1\.5 bg-white border border-slate-200 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-1\.5">\s*<Download className="w-3\.5 h-3\.5" \/> Export Report\s*<\/button>/g,
  `<button onClick={() => toast.success("Report export started...")} className="px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-1.5"><Download className="w-3.5 h-3.5" /> Export Report</button>`
);

adminPanel = adminPanel.replace(
  /<button className="w-full mt-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">\s*View Detailed Analytics <ChevronRight className="w-4 h-4" \/>\s*<\/button>/g,
  `<button onClick={() => toast.success("Opening detailed analytics view...")} className="w-full mt-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">View Detailed Analytics <ChevronRight className="w-4 h-4" /></button>`
);

fs.writeFileSync(adminPanelPath, adminPanel);


// 3. StaffManagement.tsx - Make Manage button work
const staffManagementPath = 'c:/Users/idhay/Downloads/Leetcode_Tracker/Sscet_Tracker/frontend/src/app/components/StaffManagement.tsx';
let staffManagement = fs.readFileSync(staffManagementPath, 'utf8');

staffManagement = staffManagement.replace(
  /<button className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors">\s*Manage\s*<\/button>/g,
  `<button onClick={() => toast.info("Staff management options opened")} className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors">Manage</button>`
);
fs.writeFileSync(staffManagementPath, staffManagement);


// 4. App.tsx - Add AdminSettings Route and AdminNotifications mock route
const appPath = 'c:/Users/idhay/Downloads/Leetcode_Tracker/Sscet_Tracker/frontend/src/app/App.tsx';
let appStr = fs.readFileSync(appPath, 'utf8');

if (!appStr.includes('AdminSettings')) {
  appStr = appStr.replace(
    /import AdminLayout from "\.\/components\/layouts\/AdminLayout";/,
    `import AdminSettings from "./components/AdminSettings";\nimport AdminLayout from "./components/layouts/AdminLayout";`
  );
  
  appStr = appStr.replace(
    /<Route path="settings" element=\{<div className="p-8 text-slate-500">Settings \(Coming Soon\)<\/div>\} \/>/,
    `<Route path="settings" element={<AdminSettings />} />\n          <Route path="notifications" element={<div className="p-8 text-slate-500 animate-in fade-in">Admin Notifications Center</div>} />`
  );
  fs.writeFileSync(appPath, appStr);
}

// 5. Create AdminSettings.tsx
const adminSettingsPath = 'c:/Users/idhay/Downloads/Leetcode_Tracker/Sscet_Tracker/frontend/src/app/components/AdminSettings.tsx';
const adminSettingsContent = `import React, { useState } from 'react';
import { Settings, Shield, Bell, Key, Database, Save, Loader2, Link } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettings() {
  const [loading, setLoading] = useState(false);
  
  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Admin settings successfully updated!");
    }, 1000);
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">System Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Configure global application settings and integrations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4"><Shield className="w-5 h-5 text-indigo-500" /> Security Policies</h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                <div>
                  <div className="text-sm font-semibold text-slate-800">Require 2FA for Staff Login</div>
                  <div className="text-xs text-slate-500">Enforce two-factor authentication for all staff members.</div>
                </div>
                <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded" />
              </label>
              <label className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                <div>
                  <div className="text-sm font-semibold text-slate-800">Automatic Session Timeout</div>
                  <div className="text-xs text-slate-500">Log users out after 30 minutes of inactivity.</div>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded" />
              </label>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4"><Link className="w-5 h-5 text-emerald-500" /> API Integrations</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">LeetCode API Key</label>
                <input type="password" defaultValue="************************" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Email SMTP Server</label>
                <input type="text" defaultValue="smtp.college.edu" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4"><Database className="w-5 h-5 text-orange-500" /> Data Management</h2>
            <p className="text-xs text-slate-500 mb-4">Export all system data or clear old records.</p>
            <div className="space-y-3">
              <button className="w-full py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors">Export Full Backup</button>
              <button className="w-full py-2 bg-rose-50 border border-rose-200 rounded-lg text-sm font-semibold text-rose-700 hover:bg-rose-100 transition-colors">Purge Inactive Users</button>
            </div>
          </div>

          <button onClick={handleSave} disabled={loading} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm shadow-indigo-200 transition-all flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync(adminSettingsPath, adminSettingsContent);

console.log("Applied all requested Admin Portal tweaks.");
