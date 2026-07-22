const fs = require('fs');
const path = 'c:/Users/idhay/Downloads/Leetcode_Tracker/Sscet_Tracker/frontend/src/app/components/StaffLogin.tsx';

const content = `import React, { useState } from "react";
import { IdCard, Lock, Eye, EyeOff, Loader2, BookOpen, User, Briefcase, ArrowLeft } from "lucide-react";

const inputCls = "w-full px-4 py-3 pl-11 bg-white border border-slate-200 rounded-lg text-slate-800 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400";
const iconCls = "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-blue-600";
const labelCls = "block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider";

function Field({ label, icon: Icon, children, className = "" }: { label: string; icon: any; children: React.ReactNode; className?: string }) {
  return (
    <div className={\`group \${className}\`}>
      <label className={labelCls}>{label}</label>
      <div className="relative">
        {Icon && <Icon className={iconCls} />}
        {children}
      </div>
    </div>
  );
}

export default function StaffLogin({
  onLogin,
  onBack,
}: {
  onLogin: (staff: any) => void;
  onBack: () => void;
}) {
  const [staffName, setStaffName] = useState("");
  const [department, setDepartment] = useState("");
  const [staffId, setStaffId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!staffName.trim() || !department || !staffId.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("https://lab-exam-backend.onrender.com/api/staff/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId, password, staffName, department }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onLogin(data.staff);
      } else {
        setError(data.error || "Login failed - Invalid credentials or unapproved account.");
      }
    } catch (err) {
      setError("Server connection error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300">
      <button 
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Staff Portal</h2>
          <p className="text-sm text-slate-500 mt-1">Instructor dashboard access</p>
        </div>
        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
          <BookOpen className="w-5 h-5" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-sm font-medium rounded-r-lg mb-4">
            {error}
          </div>
        )}

        <Field label="Staff Name" icon={User}>
          <input type="text" value={staffName} onChange={(e) => setStaffName(e.target.value)} className={inputCls} placeholder="Enter your full name" />
        </Field>

        <Field label="Department" icon={Briefcase}>
          <select 
            value={department} 
            onChange={(e) => setDepartment(e.target.value)} 
            className={\`\${inputCls} appearance-none\`}
          >
            <option value="" disabled>Select your department</option>
            <option value="Computer Science">Computer Science & Engineering</option>
            <option value="Information Technology">Information Technology</option>
            <option value="AI & Data Science">AI & Data Science</option>
            <option value="Electronics">Electronics & Communication</option>
          </select>
        </Field>

        <Field label="Staff ID" icon={IdCard}>
          <input type="text" value={staffId} onChange={(e) => setStaffId(e.target.value)} className={inputCls} placeholder="e.g. STF-001" />
        </Field>
        
        <Field label="Password" icon={Lock}>
          <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} placeholder="Enter password" />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-blue-600 transition-colors">
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </Field>

        <div className="flex items-center justify-between mt-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={rememberMe} 
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-slate-600 select-none">Remember me</span>
          </label>
          <button type="button" onClick={() => alert("Forgot Password link clicked! (Feature coming soon)")} className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors hover:underline">
            Forgot Password?
          </button>
        </div>

        <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm shadow-blue-200 transition-all flex justify-center mt-6">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In to Dashboard"}
        </button>
      </form>
    </div>
  );
}
`;

fs.writeFileSync(path, content);
console.log("Updated StaffLogin.tsx to include all required fields");
