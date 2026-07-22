import { Settings, Lock, BellRing, Monitor, ShieldCheck } from "lucide-react";

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
