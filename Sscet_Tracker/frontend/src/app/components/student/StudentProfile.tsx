import { useState, useEffect } from "react";
import {
  ArrowLeft,
  User,
  Mail,
  Hash,
  BookOpen,
  Code2,
  Trophy,
  Loader2,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
  Flame,
  Activity,
  Target,
  Globe2,
  Zap
} from "lucide-react";
import {
  fetchLeetCodeStats,
  LeetCodeStats,
  getLeetCodeProfileUrl,
} from "../../services/api";
import { Lock, Key, Save, Shield, Bell } from "lucide-react";
import { toast } from "sonner";

interface StudentProfileProps {
  student: {
    name: string;
    registerNumber: string;
    department: string;
    email?: string;
    leetCodeUsername?: string;
  };
  onBack: () => void;
}

export default function StudentProfile({
  student,
  onBack,
}: StudentProfileProps) {
  const [leetStats, setLeetStats] = useState<LeetCodeStats | null>(null);
  const [leetLoading, setLeetLoading] = useState(false);
  const [leetError, setLeetError] = useState("");
  
  // Settings state
  const [activeTab, setActiveTab] = useState<'security' | 'notifications'>('security');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdatePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    setIsUpdating(true);
    // Simulate API call
    setTimeout(() => {
      setIsUpdating(false);
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 1000);
  };

  useEffect(() => {
    if (student.leetCodeUsername) {
      loadLeetCode(student.leetCodeUsername);
    }
  }, [student.leetCodeUsername]);

  const loadLeetCode = async (username: string) => {
    setLeetLoading(true);
    setLeetError("");
    setLeetStats(null);
    try {
      const stats = await fetchLeetCodeStats(username);
      setLeetStats(stats);
    } catch (err: any) {
      setLeetError(err.message || "Failed to load LeetCode stats.");
    } finally {
      setLeetLoading(false);
    }
  };

  const initials = student.name
    ? student.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* ── Header Area ── */}
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-800 text-sm mb-6 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-24 h-24 rounded-full flex-shrink-0 overflow-hidden border border-stone-200 shadow-sm bg-white relative">
            {leetStats?.avatar ? (
              <img
                src={leetStats.avatar}
                alt={student.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sapphire-700 font-bold text-2xl bg-sapphire-50">
                {initials}
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 border-2 border-white rounded-full"></div>
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-black text-ink-900 tracking-tight">
              {student.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-stone-500 font-medium">
              <span className="flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-stone-400" />
                {student.registerNumber}
              </span>
              <span className="w-1 h-1 rounded-full bg-stone-300"></span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-stone-400" />
                {typeof student.department === 'string' ? student.department : (student as any).department?.name || 'Department'}
              </span>
            </div>
          </div>
          
          {student.leetCodeUsername && (
            <div className="shrink-0 mt-4 md:mt-0">
               <a 
                href={getLeetCodeProfileUrl(student.leetCodeUsername)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink-900 hover:bg-ink-800 text-white text-sm font-semibold rounded-xl transition-all shadow-sm"
               >
                 <ExternalLink className="w-4 h-4" />
                 View LeetCode
               </a>
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* ── Student Details ── */}
        <div className="md:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-stone-200/60 shadow-sm">
            <h2 className="text-xs font-bold flex items-center gap-2 uppercase tracking-widest text-stone-400 mb-5">
              <User className="w-4 h-4 text-sapphire-500" />
              Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                 <div className="w-8 h-8 rounded-lg bg-stone-50 flex items-center justify-center shrink-0 border border-stone-100">
                    <Mail className="w-4 h-4 text-stone-500" />
                 </div>
                 <div>
                    <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Email Address</p>
                    <p className="text-sm font-medium text-ink-900 mt-0.5">{student.email || "Not provided"}</p>
                 </div>
              </div>
              <div className="flex items-start gap-3">
                 <div className="w-8 h-8 rounded-lg bg-stone-50 flex items-center justify-center shrink-0 border border-stone-100">
                    <Code2 className="w-4 h-4 text-stone-500" />
                 </div>
                 <div>
                    <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">LeetCode ID</p>
                    <p className="text-sm font-medium text-ink-900 mt-0.5">{student.leetCodeUsername || "Not linked"}</p>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── LeetCode Statistics ── */}
        <div className="md:col-span-2">
          {!student.leetCodeUsername ? (
            <div className="glass-panel p-8 rounded-2xl border border-stone-200/60 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-4">
                <Code2 className="w-8 h-8 text-stone-400" />
              </div>
              <h3 className="text-lg font-bold text-ink-900">No LeetCode Account Linked</h3>
              <p className="text-stone-500 text-sm mt-2 max-w-sm">
                You haven't linked your LeetCode account yet. Ask your Administrator to update your profile.
              </p>
            </div>
          ) : leetLoading ? (
            <div className="glass-panel p-8 rounded-2xl border border-stone-200/60 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
              <Loader2 className="w-8 h-8 animate-spin text-sapphire-600 mb-4" />
              <p className="text-stone-500 font-medium">Syncing LeetCode stats...</p>
            </div>
          ) : leetError ? (
            <div className="glass-panel p-8 rounded-2xl border border-rose-200/60 flex flex-col items-center justify-center text-center h-full min-h-[300px] bg-rose-50/30">
              <AlertCircle className="w-10 h-10 text-rose-500 mb-4" />
              <h3 className="text-lg font-bold text-rose-900">Sync Failed</h3>
              <p className="text-rose-600/80 text-sm mt-2">{leetError}</p>
              <button 
                onClick={() => loadLeetCode(student.leetCodeUsername!)}
                className="mt-4 px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 text-sm font-bold rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : leetStats ? (
            <div className="space-y-6">
              {/* Top Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-panel p-5 rounded-2xl border border-stone-200/60">
                  <h3 className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-sapphire-500" /> Solved
                  </h3>
                  <div className="text-2xl font-black text-ink-900">{leetStats.totalSolved}</div>
                </div>
                <div className="glass-panel p-5 rounded-2xl border border-stone-200/60">
                  <h3 className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    <Globe2 className="w-3.5 h-3.5 text-gold-500" /> Ranking
                  </h3>
                  <div className="text-xl font-black text-ink-900 break-all">{leetStats.ranking.toLocaleString()}</div>
                </div>
                <div className="glass-panel p-5 rounded-2xl border border-stone-200/60">
                  <h3 className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-rose-500" /> Streak
                  </h3>
                  <div className="text-2xl font-black text-ink-900">{leetStats.streak}</div>
                </div>
                <div className="glass-panel p-5 rounded-2xl border border-stone-200/60">
                  <h3 className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-emerald-500" /> Reputation
                  </h3>
                  <span className="text-3xl font-black text-ink-900">{(leetStats as any).reputation || 0}</span>
                </div>
              </div>

              {/* Difficulties */}
              <div className="glass-panel p-6 rounded-2xl border border-stone-200/60">
                 <h2 className="text-xs font-bold flex items-center gap-2 uppercase tracking-widest text-stone-400 mb-5">
                    <Activity className="w-4 h-4 text-sapphire-500" />
                    Problem Solving Distribution
                 </h2>
                 <div className="space-y-4">
                    <div className="flex items-center gap-4">
                       <div className="w-24 shrink-0 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                          <span className="text-sm font-medium text-emerald-700">Easy</span>
                       </div>
                       <div className="flex-1 h-3 bg-stone-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(leetStats.easySolved / Math.max(1, leetStats.totalSolved)) * 100}%` }}></div>
                       </div>
                       <div className="w-12 text-right text-sm font-bold text-ink-900">{leetStats.easySolved}</div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="w-24 shrink-0 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                          <span className="text-sm font-medium text-amber-700">Medium</span>
                       </div>
                       <div className="flex-1 h-3 bg-stone-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(leetStats.mediumSolved / Math.max(1, leetStats.totalSolved)) * 100}%` }}></div>
                       </div>
                       <div className="w-12 text-right text-sm font-bold text-ink-900">{leetStats.mediumSolved}</div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="w-24 shrink-0 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                          <span className="text-sm font-medium text-rose-700">Hard</span>
                       </div>
                       <div className="flex-1 h-3 bg-stone-100 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(leetStats.hardSolved / Math.max(1, leetStats.totalSolved)) * 100}%` }}></div>
                       </div>
                       <div className="w-12 text-right text-sm font-bold text-ink-900">{leetStats.hardSolved}</div>
                    </div>
                 </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* ── Settings Area ── */}
      <div className="mt-8 pt-8 border-t border-stone-200">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h2>
          <p className="text-slate-500 mt-1 text-sm">Manage your account preferences and security.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 space-y-1">
            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'security' 
                  ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Shield className={`w-5 h-5 ${activeTab === 'security' ? 'text-indigo-600' : 'text-slate-400'}`} />
              Security
            </button>
            
            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'notifications' 
                  ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Bell className={`w-5 h-5 ${activeTab === 'notifications' ? 'text-indigo-600' : 'text-slate-400'}`} />
              Notifications
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            {activeTab === 'security' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                  <h2 className="text-lg font-semibold text-slate-800">Change Password</h2>
                  <p className="text-sm text-slate-500 mt-1">Update your password to keep your account secure.</p>
                </div>
                <div className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <input 
                        type="password" 
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors sm:text-sm text-slate-900"
                        placeholder="Enter current password"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Key className="h-5 w-5 text-slate-400" />
                      </div>
                      <input 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors sm:text-sm text-slate-900"
                        placeholder="Enter new password"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Key className="h-5 w-5 text-slate-400" />
                      </div>
                      <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors sm:text-sm text-slate-900"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button 
                      onClick={handleUpdatePassword}
                      disabled={isUpdating}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 disabled:hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-indigo-200"
                    >
                      {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {isUpdating ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                  <h2 className="text-lg font-semibold text-slate-800">Notification Preferences</h2>
                  <p className="text-sm text-slate-500 mt-1">Choose what updates you want to receive.</p>
                </div>
                <div className="p-6 space-y-6">
                  {[
                    { title: 'Email Notifications', desc: 'Receive daily performance summaries via email.' },
                    { title: 'Task Reminders', desc: 'Get notified when you have pending daily tasks.' },
                    { title: 'LeetCode Sync Alerts', desc: 'Alert me when LeetCode stats are successfully synced.' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-slate-900">{item.title}</h3>
                        <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked={i !== 2} />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-indigo-200">
                      <Save className="w-4 h-4" /> Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

