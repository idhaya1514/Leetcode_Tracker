import { useState } from "react";
import { User, Lock, Eye, EyeOff, Loader2, Shield } from "lucide-react";

const inputCls = "w-full px-4 py-3 pl-11 bg-white border border-slate-200 rounded-lg text-slate-800 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400";
const iconCls = "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-blue-600";
const labelCls = "block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider";

function Field({ label, icon: Icon, children, className = "" }: { label: string; icon: any; children: React.ReactNode; className?: string }) {
  return (
    <div className={`group ${className}`}>
      <label className={labelCls}>{label}</label>
      <div className="relative">
        <Icon className={iconCls} />
        {children}
      </div>
    </div>
  );
}

interface AdminLoginProps {
  onLogin: () => void;
  onBack: () => void;
}

const ADMIN_USERNAME = "sscet";
const ADMIN_PASSWORD = "adminsscet@2026";

export default function AdminLogin({ onLogin, onBack }: AdminLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setIsLoading(true);
    if (username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      onLogin();
    } else {
      setError("Invalid admin credentials.");
    }
    setIsLoading(false);
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Admin Portal</h2>
          <p className="text-sm text-slate-500 mt-1">Secure administrator access</p>
        </div>
        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
          <Shield className="w-5 h-5" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-sm font-medium rounded-r-lg mb-4">
            {error}
          </div>
        )}

        <Field label="Admin Username" icon={User}>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className={inputCls} placeholder="Enter username" />
        </Field>
        
        <Field label="Admin Password" icon={Lock}>
          <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} placeholder="Enter password" />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-indigo-600 transition-colors">
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </Field>

        <button type="submit" disabled={isLoading} className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-lg shadow-sm transition-all flex justify-center mt-6">
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Authenticate as Admin"}
        </button>
      </form>
    </div>
  );
}
