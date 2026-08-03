import { useState } from "react";
import { User, Lock, Eye, EyeOff, Loader2, Shield } from "lucide-react";
import { API_BASE_URL } from "../../services/api";

const inputCls = "w-full px-4 py-3 pl-11 bg-cream-100 border border-stone-200 rounded-lg text-ink-900 text-sm font-medium outline-none transition-all focus:border-sapphire-800 focus:ring-4 focus:ring-sapphire-800/10 placeholder:text-stone-400";
const iconCls = "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 transition-colors group-focus-within:text-sapphire-800";
const labelCls = "block text-[11px] font-bold text-ink-600 mb-1.5 uppercase tracking-wider";

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
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username.trim().toLowerCase(), password, role: 'admin' })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }
      onLogin();
    } catch (err: any) {
      setError(err.message || "Server connection error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-sm font-medium rounded-r-lg mb-4">
            {error}
          </div>
        )}

        <Field label="Admin Username" icon={User}>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className={inputCls} placeholder="Enter admin username" />
        </Field>
        
        <Field label="Admin Password" icon={Lock}>
          <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} placeholder="Enter password" />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-sapphire-800 transition-colors">
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </Field>

        <div className="glow-accent mt-6">
          <button type="submit" disabled={isLoading} className="w-full py-3 bg-sapphire-900 hover:bg-sapphire-800 text-cream-100 text-[15px] font-semibold rounded-lg shadow-sm transition-all flex justify-center hover:-translate-y-0.5 active:translate-y-0">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Authenticate as Admin"}
          </button>
        </div>
      </form>
    </div>
  );
}

