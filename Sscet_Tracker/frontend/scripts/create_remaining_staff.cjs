const fs = require('fs');

// 1. StaffNotifications.tsx
const notifContent = `import { useState, useEffect } from "react";
import { Bell, CheckCircle2, MessageSquare, AlertCircle } from "lucide-react";
import { getStudents } from "../services/api";

export default function StaffNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await getStudents();
      // Generate some mock notifications (task completion messages)
      const notifs = data.slice(0, 15).map((s: any, i: number) => {
        const isIssue = i % 7 === 0;
        return {
          id: i,
          type: isIssue ? 'issue' : 'completion',
          message: isIssue 
            ? \`\${s.name} raised an issue regarding LeetCode sync.\`
            : \`\${s.name} successfully completed Today's Task!\`,
          time: \`\${Math.floor(Math.random() * 5) + 1} hours ago\`,
          student: s
        };
      });
      setNotifications(notifs);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-indigo-500" /> Notifications & Messages
          </h1>
          <p className="text-slate-500 text-sm mt-1">Live updates on student task completions and raised issues.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/60 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] overflow-hidden">
        <div className="divide-y divide-slate-100">
          {notifications.map((notif) => (
            <div key={notif.id} className="p-4 hover:bg-slate-50/50 transition-colors flex items-start gap-4">
              <div className={\`mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0 \${notif.type === 'completion' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}\`}>
                {notif.type === 'completion' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">{notif.message}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-500">{notif.time}</span>
                  <span className="text-xs text-slate-300">•</span>
                  <span className="text-xs font-medium text-slate-500">{notif.student.registerNumber}</span>
                </div>
              </div>
              {notif.type === 'issue' && (
                <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded">
                  <MessageSquare className="w-3 h-3" /> Reply
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync('c:/Users/idhay/Downloads/Leetcode_Tracker/Sscet_Tracker/frontend/src/app/components/StaffNotifications.tsx', notifContent);


// 2. StaffProfile.tsx
const profileContent = `import { User, Shield, Briefcase, Hash, LogOut } from "lucide-react";
import { useNavigate } from "react-router";

export default function StaffProfile({ staff, onLogout }: any) {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <User className="w-6 h-6 text-indigo-500" /> Staff Profile
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage your staff account details.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/60 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-blue-600"></div>
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="w-24 h-24 bg-white rounded-2xl p-1 shadow-lg">
              <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center text-white text-3xl font-bold">
                {staff?.name?.charAt(0) || "S"}
              </div>
            </div>
            <button 
              onClick={() => { onLogout(); navigate('/'); }}
              className="px-4 py-2 bg-rose-50 text-rose-600 font-semibold text-sm rounded-lg hover:bg-rose-100 transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Full Name</p>
                <div className="flex items-center gap-2 text-slate-800 font-medium">
                  <User className="w-4 h-4 text-slate-400" /> {staff?.name || "Staff Member"}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Staff ID</p>
                <div className="flex items-center gap-2 text-slate-800 font-medium">
                  <Hash className="w-4 h-4 text-slate-400" /> {staff?.id || "STF-2023-041"}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Department</p>
                <div className="flex items-center gap-2 text-slate-800 font-medium">
                  <Briefcase className="w-4 h-4 text-slate-400" /> {staff?.department || "Computer Science and Engineering"}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Assigned Students</p>
                <div className="flex items-center gap-2 text-slate-800 font-medium">
                  <Shield className="w-4 h-4 text-slate-400" /> 35 Students
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync('c:/Users/idhay/Downloads/Leetcode_Tracker/Sscet_Tracker/frontend/src/app/components/StaffProfile.tsx', profileContent);

// 3. StaffSettings.tsx
const settingsContent = `import { Settings, Lock, BellRing, Monitor, ShieldCheck } from "lucide-react";

export default function StaffSettings() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-500" /> Enhanced Settings
          </h1>
          <p className="text-slate-500 text-sm mt-1">Configure your portal preferences and security.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/60 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] divide-y divide-slate-100">
        
        {/* Security Feature */}
        <div className="p-6 flex items-start gap-4 hover:bg-slate-50/50 transition-colors">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-800">Two-Factor Authentication (2FA)</h3>
            <p className="text-xs text-slate-500 mt-1">Add an extra layer of security to your staff account.</p>
          </div>
          <button className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors">Enable 2FA</button>
        </div>

        {/* Notifications */}
        <div className="p-6 flex items-start gap-4 hover:bg-slate-50/50 transition-colors">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg shrink-0">
            <BellRing className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-800">Automated Email Alerts</h3>
            <p className="text-xs text-slate-500 mt-1">Automatically notify students at 8 PM if their task is pending.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer mt-1">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {/* Theme */}
        <div className="p-6 flex items-start gap-4 hover:bg-slate-50/50 transition-colors">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
            <Monitor className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-800">Display Theme</h3>
            <p className="text-xs text-slate-500 mt-1">Switch between light mode and dark mode aesthetics.</p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button className="px-3 py-1 bg-white text-slate-800 text-xs font-semibold rounded shadow-sm">Light</button>
            <button className="px-3 py-1 text-slate-500 text-xs font-semibold hover:text-slate-700">Dark</button>
          </div>
        </div>

      </div>
    </div>
  );
}
`;
fs.writeFileSync('c:/Users/idhay/Downloads/Leetcode_Tracker/Sscet_Tracker/frontend/src/app/components/StaffSettings.tsx', settingsContent);

console.log("Created Notifications, Profile, and Settings components!");
