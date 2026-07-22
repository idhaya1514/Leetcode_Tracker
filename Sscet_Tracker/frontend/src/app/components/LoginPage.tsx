import { useState, useEffect } from "react";
import {
  GraduationCap, Loader2, AlertCircle, ArrowRight, ArrowLeft,
  CheckCircle2, Globe, Code2, Building2, User, Hash, Mail, BookOpen, Calendar, Lock, Eye, EyeOff, ShieldCheck, Github
} from "lucide-react";
import {
  checkServerHealth, createStudent, loginStudent, requestPasswordResetOTP, verifyPasswordResetOTP, updatePasswordSecurely,
} from "../services/api";
import { toast } from "sonner";
import { DEPARTMENTS, ACADEMIC_YEARS } from "../constants";
import AdminLogin from "./AdminLogin";
import StaffLogin from "./StaffLogin";





// Standard Institutional Input Component
const inputCls = "w-full px-4 py-3 pl-11 bg-white border border-slate-200 rounded-lg text-slate-800 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-500";
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

// Password Strength Calculator
function getPasswordStrength(pass: string): { score: number; label: string; color: string } {
  if (!pass) return { score: 0, label: "None", color: "bg-slate-200" };
  let score = 0;
  if (pass.length > 5) score += 1;
  if (pass.length > 8) score += 1;
  if (/[A-Z]/.test(pass)) score += 1;
  if (/[0-9]/.test(pass)) score += 1;
  if (/[^A-Za-z0-9]/.test(pass)) score += 1;

  if (score < 2) return { score: 1, label: "Weak", color: "bg-rose-500" };
  if (score < 4) return { score: 2, label: "Medium", color: "bg-amber-500" };
  return { score: 3, label: "Strong", color: "bg-emerald-500" };
}

type TabType = "student" | "admin" | "staff";

export default function LoginPage({ onStudentLogin, onAdminLogin, onStaffLogin }: any) {
  const [activeTab, setActiveTab] = useState<TabType>("student");
  const [mode, setMode] = useState<"login" | "register" | "forgot-password" | "otp-verification" | "reset-password">("login");
  
  // Registration State
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [registerNumber, setRegisterNumber] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [leetCodeUrl, setLeetCodeUrl] = useState("");
  const [leetCodeUsername, setLeetCodeUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Login State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [countdown, setCountdown] = useState(0);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [extracted, setExtracted] = useState(false);

  const pwdStrength = getPasswordStrength(password);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0 && mode === "otp-verification") {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown, mode]);

  const validatePasswordStrength = (pwd: string) => {
    if (pwd.length < 8) return false;
    if (!/[A-Z]/.test(pwd)) return false;
    if (!/[a-z]/.test(pwd)) return false;
    if (!/[0-9]/.test(pwd)) return false;
    if (!/[^A-Za-z0-9]/.test(pwd)) return false;
    return true;
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return setError("Please enter your registered email address.");
    setIsLoading(true);
    setError("");
    try {
      await requestPasswordResetOTP(resetEmail, "student");
      setMode("otp-verification");
      setCountdown(60);
      toast.success("Verification code sent to your email!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) return setError("Please enter the verification code.");
    setIsLoading(true);
    setError("");
    try {
      await verifyPasswordResetOTP(resetEmail, otp, "student");
      setMode("reset-password");
      toast.success("Code verified successfully!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmNewPassword) {
      return setError("Passwords do not match.");
    }
    if (!validatePasswordStrength(newPassword)) {
      return setError("Please create a stronger password that meets all security requirements.");
    }
    setIsLoading(true);
    try {
      await updatePasswordSecurely(resetEmail, newPassword, "student");
      setMode("login");
      setResetEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmNewPassword("");
      toast.success("Your password has been reset successfully. Please log in using your new password.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    checkServerHealth().catch(() => {});
  }, []);

  useEffect(() => {
    if (leetCodeUrl.includes("leetcode.com/")) {
      const parts = leetCodeUrl.split("leetcode.com/");
      const path = parts[1] || "";
      const segments = path.split("/").filter(Boolean);
      let extractedUser = "";
      if (segments[0] === "u" && segments[1]) {
        extractedUser = segments[1];
      } else if (segments[0]) {
        extractedUser = segments[0];
      }
      setLeetCodeUsername(extractedUser);
      setExtracted(!!extractedUser);
    } else {
      setLeetCodeUsername("");
      setExtracted(false);
    }
  }, [leetCodeUrl]);

  const handleNextStep = () => {
    setError("");
    if (step === 1) {
      if (!name.trim()) return setError("Please enter your full name.");
      if (!registerNumber.trim()) return setError("Please enter your register number.");
      if (!email.trim()) return setError("Please enter your email.");
      setStep(2);
    } else if (step === 2) {
      if (!department) return setError("Please select a department.");
      if (!academicYear) return setError("Please select an academic year.");
      setStep(3);
    } else if (step === 3) {
      if (!leetCodeUrl.trim()) return setError("Please enter your LeetCode profile URL.");
      if (!leetCodeUsername.trim()) return setError("Invalid URL. Username could not be extracted.");
      setStep(4);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");

    setIsLoading(true);
    try {
      await createStudent({
        name: name.trim(), email: email.trim(), registerNumber: registerNumber.trim().toUpperCase(),
        department, academicYear, password, leetCodeUrl: leetCodeUrl.trim(), leetCodeUsername: leetCodeUsername.trim(),
      });
      toast.success("Account created successfully!");
      setMode("login");
      setLoginEmail(email.trim());
      setStep(1);
      // Reset
      setName(""); setRegisterNumber(""); setEmail(""); setDepartment(""); setAcademicYear("");
      setLeetCodeUrl(""); setLeetCodeUsername(""); setPassword(""); setConfirmPassword("");
    } catch (err: any) {
      setError(err.message || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!loginEmail.trim() || !loginPassword) return setError("Please fill in all fields.");

    setIsLoading(true);
    try {
      const response = await loginStudent(loginEmail.trim(), loginPassword);
      if (!response.success || !response.data) throw new Error(response.error || "Login failed");
      
      const student = response.data;
      toast.success(`Welcome back, ${student.name}!`);
      onStudentLogin(student);
    } catch (err: any) {
      setError(err.message || "Invalid credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative flex flex-col items-center justify-center font-sans p-4 sm:p-8">
      
      {/* Top Header / Branding */}
      <div className="absolute top-8 left-0 w-full flex justify-center z-0 animate-in slide-in-from-top-6 duration-700">
        <div className="flex flex-col items-center text-slate-800">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mb-3 shadow-md shadow-blue-600/20">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">SSCET Portal</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">LeetCode Analytics System</p>
        </div>
      </div>

      <div className="w-full max-w-md relative z-10 mt-24">
        
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          
          {/* Tab Switcher */}
          <div className="flex border-b border-slate-100 bg-slate-50/50">
            {(["student", "admin", "staff"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setError(""); setMode("login"); setStep(1); }}
                className={`flex-1 py-3.5 text-sm font-bold capitalize transition-all duration-300 relative ${
                  activeTab === tab ? "text-blue-700 bg-white" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
                )}
              </button>
            ))}
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-sm font-medium rounded-r-lg flex items-start gap-3 animate-in slide-in-from-bottom-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {activeTab === "student" && mode === "login" && (
              <div className="animate-in fade-in zoom-in-95 duration-300">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-800">Student Sign In</h2>
                  <p className="text-sm text-slate-500 mt-1">Access your performance dashboard</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                  <Field label="Email Address" icon={Mail}>
                    <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className={inputCls} placeholder="Enter your college email" />
                  </Field>
                  <Field label="Password" icon={Lock}>
                    <input type={showPassword ? "text" : "password"} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className={inputCls} placeholder="Enter your password" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-blue-600 transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </Field>

                  {/* Feature: Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between text-xs font-bold mt-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30 transition-colors" />
                      <span className="text-slate-500 group-hover:text-slate-800 transition-colors">Remember Me</span>
                    </label>
                    <button type="button" onClick={() => { setMode("forgot-password"); setError(""); setResetEmail(""); }} className="text-blue-600 hover:text-blue-800 transition-colors">Forgot Password?</button>
                  </div>
                  
                  <button type="submit" disabled={isLoading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all flex justify-center mt-6">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
                  </button>
                </form>


                <div className="mt-8 text-center">
                  <p className="text-sm text-slate-500">
                    New student?{' '}
                    <button onClick={() => setMode("register")} className="text-blue-600 font-bold hover:underline">Register Here</button>
                  </p>
                </div>
              </div>
            )}

            {activeTab === "student" && mode === "register" && (
              <div className="animate-in slide-in-from-right-4 duration-300">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-800">Registration</h2>
                  
                  {/* Progress Bar */}
                  <div className="mt-4 flex items-center justify-between relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 -z-10 rounded-full" />
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 -z-10 rounded-full transition-all duration-500" style={{ width: `${((step - 1) / 3) * 100}%` }} />
                    
                    {[1,2,3,4].map(num => (
                      <div key={num} className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${step >= num ? 'bg-blue-600 text-white' : 'bg-white border-2 border-slate-200 text-slate-400'}`}>
                        {step > num ? <CheckCircle2 className="w-3.5 h-3.5" /> : num}
                      </div>
                    ))}
                  </div>
                </div>

                <form onSubmit={step === 4 ? handleRegister : (e) => { e.preventDefault(); handleNextStep(); }}>
                  
                  {step === 1 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Step 1: Personal Info</h3>
                      <Field label="Full Name" icon={User}><input type="text" value={name} onChange={e => setName(e.target.value)} className={inputCls} placeholder="John Doe" /></Field>
                      <Field label="Register Number" icon={Hash}><input type="text" value={registerNumber} onChange={e => setRegisterNumber(e.target.value)} className={inputCls} placeholder="E23AI011" /></Field>
                      <Field label="College Email" icon={Mail}><input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} placeholder="john@example.com" /></Field>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Step 2: Academic Info</h3>
                      <Field label="Department" icon={BookOpen}>
                        <select value={department} onChange={e => setDepartment(e.target.value)} className={inputCls + " appearance-none cursor-pointer"}>
                          <option value="" disabled hidden>Select Department</option>
                          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </Field>
                      <Field label="Academic Year" icon={Calendar}>
                        <select value={academicYear} onChange={e => setAcademicYear(e.target.value)} className={inputCls + " appearance-none cursor-pointer"}>
                          <option value="" disabled hidden>Select Year</option>
                          {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </Field>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Step 3: LeetCode</h3>
                      <div className="p-3 bg-blue-50/50 rounded-lg mb-2 border border-blue-100 flex gap-2">
                        <Globe className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <p className="text-[11px] text-blue-900/80 leading-relaxed">Paste your full LeetCode profile URL to auto-extract your username.</p>
                      </div>
                      <Field label="Profile URL" icon={Globe}><input type="text" value={leetCodeUrl} onChange={e => setLeetCodeUrl(e.target.value)} className={inputCls} placeholder="https://leetcode.com/u/john/" /></Field>
                      <div className="relative">
                        <Field label="Auto-detected Username" icon={Code2}><input type="text" value={leetCodeUsername} disabled className={inputCls} placeholder="Waiting for URL..." /></Field>
                        {extracted && <CheckCircle2 className="absolute right-3 top-[34px] w-4 h-4 text-emerald-500" />}
                      </div>
                    </div>
                  )}

                  {step === 4 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Step 4: Security</h3>
                      
                      <div className="space-y-1">
                        <Field label="Create Password" icon={Lock}>
                          <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className={inputCls} placeholder="Create password" />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-blue-600 transition-colors"><EyeOff className="w-4 h-4" /></button>
                        </Field>
                        {/* Feature: Password Strength Indicator */}
                        {password && (
                          <div className="flex items-center gap-2 mt-2 animate-in fade-in">
                            <div className="flex-1 flex gap-1 h-1.5">
                              <div className={`flex-1 rounded-full ${pwdStrength.score >= 1 ? pwdStrength.color : 'bg-slate-100'}`} />
                              <div className={`flex-1 rounded-full ${pwdStrength.score >= 2 ? pwdStrength.color : 'bg-slate-100'}`} />
                              <div className={`flex-1 rounded-full ${pwdStrength.score >= 3 ? pwdStrength.color : 'bg-slate-100'}`} />
                            </div>
                            <span className={`text-[10px] font-bold uppercase ${pwdStrength.color.replace('bg-', 'text-')}`}>{pwdStrength.label}</span>
                          </div>
                        )}
                      </div>

                      <Field label="Confirm Password" icon={Lock}>
                        <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputCls} placeholder="Confirm password" />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-blue-600 transition-colors"><EyeOff className="w-4 h-4" /></button>
                      </Field>
                    </div>
                  )}

                  <div className="flex gap-3 mt-8">
                    {step > 1 && (
                      <button type="button" onClick={() => { setError(""); setStep(step - 1); }} className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5">
                        <ArrowLeft className="w-4 h-4" /> Back
                      </button>
                    )}
                    <button type="submit" disabled={isLoading} className={`${step > 1 ? 'w-2/3' : 'w-full'} py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm shadow-blue-200 transition-all flex items-center justify-center gap-1.5`}>
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : step === 4 ? "Complete Setup" : <>Continue <ArrowRight className="w-4 h-4" /></>}
                    </button>
                  </div>
                </form>

                <div className="mt-6 text-center">
                  <button onClick={() => setMode("login")} className="text-[11px] text-slate-400 hover:text-slate-600 font-bold uppercase tracking-wider hover:underline">Cancel Registration</button>
                </div>
              </div>
            )}

            {activeTab === "admin" && (
              <div className="animate-in fade-in zoom-in-95 duration-300">
                <AdminLogin onLogin={onAdminLogin} onBack={() => setActiveTab("student")} />
              </div>
            )}

            {activeTab === "staff" && (
              <div className="animate-in fade-in zoom-in-95 duration-300">
                <StaffLogin onLogin={onStaffLogin} onBack={() => setActiveTab("student")} />
              </div>
            )}
          </div>
        </div>

        {/* Feature: Trusted Badge */}
        <div className="mt-8 flex justify-center pb-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Trusted by 500+ SSCET Students</span>
          </div>
        </div>

      </div>
    </div>
  );
}
