import React, { useState, useEffect } from 'react';
import { Settings, Shield, Bell, Key, Database, Save, Loader2, Link } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettings() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Settings State
  const [require2FA, setRequire2FA] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(true);
  const [leetCodeApiKey, setLeetCodeApiKey] = useState("");
  const [smtpServer, setSmtpServer] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data.require2FA) setRequire2FA(data.require2FA === "true");
        if (data.sessionTimeout) setSessionTimeout(data.sessionTimeout === "true");
        if (data.leetCodeApiKey) setLeetCodeApiKey(data.leetCodeApiKey);
        if (data.smtpServer) setSmtpServer(data.smtpServer);
      })
      .catch(e => console.error("Failed to load settings", e))
      .finally(() => setFetching(false));
  }, []);
  
  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          require2FA: String(require2FA),
          sessionTimeout: String(sessionTimeout),
          leetCodeApiKey,
          smtpServer
        })
      });
      if (!res.ok) throw new Error("Failed to save settings");
      toast.success("Admin settings successfully updated!");
    } catch (e) {
      toast.error("Error saving settings.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;

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
                <input type="checkbox" checked={require2FA} onChange={e => setRequire2FA(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded" />
              </label>
              <label className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                <div>
                  <div className="text-sm font-semibold text-slate-800">Automatic Session Timeout</div>
                  <div className="text-xs text-slate-500">Log users out after 30 minutes of inactivity.</div>
                </div>
                <input type="checkbox" checked={sessionTimeout} onChange={e => setSessionTimeout(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded" />
              </label>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4"><Link className="w-5 h-5 text-emerald-500" /> API Integrations</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">LeetCode API Key</label>
                <input type="password" value={leetCodeApiKey} onChange={e => setLeetCodeApiKey(e.target.value)} placeholder="************************" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Email SMTP Server</label>
                <input type="text" value={smtpServer} onChange={e => setSmtpServer(e.target.value)} placeholder="smtp.college.edu" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" />
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
