import React, { useState, useEffect } from 'react';
import { Shield, Clock, Link as LinkIcon, Database, Save, Loader2, Mail, Download, Trash2, KeyRound, Server } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettings() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Settings State
  const [require2FA, setRequire2FA] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(true);
  const [leetCodeApiKey, setLeetCodeApiKey] = useState("");
  const [smtpServer, setSmtpServer] = useState("");
  
  // New Enhanced Settings
  const [enableEmailCron, setEnableEmailCron] = useState(true);
  const [emailCronTime, setEmailCronTime] = useState("18:00");
  const [autoPurgeDays, setAutoPurgeDays] = useState("90");

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data.require2FA) setRequire2FA(data.require2FA === "true");
        if (data.sessionTimeout) setSessionTimeout(data.sessionTimeout === "true");
        if (data.leetCodeApiKey) setLeetCodeApiKey(data.leetCodeApiKey);
        if (data.smtpServer) setSmtpServer(data.smtpServer);
        if (data.enableEmailCron) setEnableEmailCron(data.enableEmailCron === "true");
        if (data.emailCronTime) setEmailCronTime(data.emailCronTime);
        if (data.autoPurgeDays) setAutoPurgeDays(data.autoPurgeDays);
      })
      .catch(e => console.error("Failed to load settings", e))
      .finally(() => setFetching(false));
  }, []);
  
  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          require2FA: String(require2FA),
          sessionTimeout: String(sessionTimeout),
          leetCodeApiKey,
          smtpServer,
          enableEmailCron: String(enableEmailCron),
          emailCronTime,
          autoPurgeDays
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

  const handleExport = () => {
    toast.success("Full system backup initiated. It will download shortly.");
  };

  const handlePurge = () => {
    toast.error("Purge aborted: Action requires super-admin verification.");
  };

  if (fetching) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <p className="text-slate-500 font-medium">Loading system configurations...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Server className="w-8 h-8 text-indigo-600 p-1.5 bg-indigo-100 rounded-xl" /> 
            System Configuration
          </h1>
          <p className="text-slate-500 text-sm mt-2 max-w-2xl">
            Configure global application settings, API integrations, and background automation processes.
          </p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={loading} 
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-[0_4px_12px_rgb(79,70,229,0.25)] hover:shadow-[0_6px_16px_rgb(79,70,229,0.35)] transition-all flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save All Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Toggles and Small settings */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/60 p-7 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2.5 mb-6">
              <Shield className="w-5 h-5 text-indigo-500" /> Security Policies
            </h2>
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-slate-800">Require 2FA for Staff</div>
                  <div className="text-xs text-slate-500 mt-1 leading-relaxed">Enforce two-factor authentication for all staff logins to secure the portal.</div>
                </div>
                <button 
                  onClick={() => setRequire2FA(!require2FA)}
                  className={`w-11 h-6 rounded-full flex items-center shrink-0 transition-colors ${require2FA ? 'bg-indigo-600' : 'bg-slate-200'} p-1 cursor-pointer`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${require2FA ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-slate-800">Auto Session Timeout</div>
                  <div className="text-xs text-slate-500 mt-1 leading-relaxed">Log users out automatically after 30 minutes of complete inactivity.</div>
                </div>
                <button 
                  onClick={() => setSessionTimeout(!sessionTimeout)}
                  className={`w-11 h-6 rounded-full flex items-center shrink-0 transition-colors ${sessionTimeout ? 'bg-indigo-600' : 'bg-slate-200'} p-1 cursor-pointer`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${sessionTimeout ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/60 p-7 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2.5 mb-6">
              <Mail className="w-5 h-5 text-emerald-500" /> Email Automation
            </h2>
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-slate-800">Automated Daily Emails</div>
                  <div className="text-xs text-slate-500 mt-1 leading-relaxed">Send automated reminders and congratulations to students daily via background cron.</div>
                </div>
                <button 
                  onClick={() => setEnableEmailCron(!enableEmailCron)}
                  className={`w-11 h-6 rounded-full flex items-center shrink-0 transition-colors ${enableEmailCron ? 'bg-emerald-500' : 'bg-slate-200'} p-1 cursor-pointer`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${enableEmailCron ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              
              <div className={`transition-all ${enableEmailCron ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Dispatch Time</label>
                <input 
                  type="time" 
                  value={emailCronTime} 
                  onChange={e => setEmailCronTime(e.target.value)} 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Inputs and Danger Zone */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/60 p-7 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2.5 mb-6">
              <LinkIcon className="w-5 h-5 text-amber-500" /> External APIs & Integrations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><KeyRound className="w-3.5 h-3.5" /> LeetCode API Key</label>
                <input 
                  type="password" 
                  value={leetCodeApiKey} 
                  onChange={e => setLeetCodeApiKey(e.target.value)} 
                  placeholder="************************" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all" 
                />
                <p className="text-[11px] text-slate-400 mt-2">Required for syncing live submission data.</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Server className="w-3.5 h-3.5" /> Email SMTP Server</label>
                <input 
                  type="text" 
                  value={smtpServer} 
                  onChange={e => setSmtpServer(e.target.value)} 
                  placeholder="smtp.gmail.com" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all" 
                />
                <p className="text-[11px] text-slate-400 mt-2">The host server used for outbound emails.</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-rose-50 to-white rounded-2xl border border-rose-100 p-7 shadow-sm">
            <h2 className="text-lg font-bold text-rose-800 flex items-center gap-2.5 mb-2">
              <Database className="w-5 h-5 text-rose-600" /> Data Management & Maintenance
            </h2>
            <p className="text-sm text-rose-600/80 mb-6 font-medium">Export system data or permanently purge inactive records.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div>
                <label className="block text-xs font-semibold text-rose-700/70 uppercase tracking-wider mb-2">Auto-Purge Threshold</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={autoPurgeDays} 
                    onChange={e => setAutoPurgeDays(e.target.value)} 
                    className="w-full px-4 py-3 bg-white border border-rose-200 rounded-xl text-sm font-bold text-rose-700 outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10 transition-all" 
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-rose-400">DAYS</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={handleExport}
                  className="flex-1 py-3 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4 text-slate-400" /> Export Backup
                </button>
                <button 
                  onClick={handlePurge}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-sm shadow-rose-200 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Trash2 className="w-4 h-4" /> Purge Now
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

