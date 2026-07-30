import { useState, useEffect } from "react";
import {
  GraduationCap, Loader2, AlertCircle, ArrowRight, ArrowLeft,
  CheckCircle2, Globe, Code2, Building2, User, Hash, Mail, BookOpen, Calendar, Lock, Eye, EyeOff, ShieldCheck, Github
} from "lucide-react";
import {
  checkServerHealth, createStudent, loginStudent, requestPasswordResetOTP, verifyPasswordResetOTP, updatePasswordSecurely,
} from "../../services/api";
import { toast } from "sonner";
import { DEPARTMENTS, ACADEMIC_YEARS } from "../../constants";
import AdminLogin from "../admin/AdminLogin";
import StaffLogin from "../staff/StaffLogin";





// Standard Institutional Input Component
const inputCls = "w-full px-4 py-3 pl-11 bg-cream-100 border border-stone-200 rounded-lg text-ink-900 text-sm font-medium outline-none transition-all focus:border-sapphire-800 focus:ring-4 focus:ring-sapphire-800/10 placeholder:text-stone-400 disabled:bg-cream-200 disabled:text-stone-400";
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
      if (!email.trim().toLowerCase().endsWith("@shanmugha.edu.in")) return setError("Please use your @shanmugha.edu.in institutional email.");
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
    <div className="min-h-screen flex font-sans bg-mesh">
      
      {/* Left Column (Brand & Value Prop) */}
      <div className="hidden lg:flex w-1/2 relative flex-col items-start justify-center p-16 xl:p-24 bg-slate-950 overflow-hidden">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative z-10 max-w-[500px] w-full">
          <h1 className="text-white text-5xl xl:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1]">
            Welcome to<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">LeetCode Tracker</span>
          </h1>
          
          <p className="text-slate-300/90 text-lg leading-relaxed mb-12 font-medium">
            Your coding journey starts here. Track your LeetCode programs progress, compete with peers, and achieve your coding goals at SSCET.
          </p>

          <div className="space-y-8">
            <div className="flex items-start gap-5 group">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-white text-[15px] font-bold mb-1 tracking-wide">Sri Shanmugha Educational Institutions</p>
                <p className="text-slate-400/80 text-sm font-medium leading-relaxed">Trusted by leading faculty and students.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-5 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <p className="text-white text-[15px] font-bold mb-1 tracking-wide">Empowering Excellence</p>
                <p className="text-slate-400/80 text-sm font-medium leading-relaxed">Master competitive programming today.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column (Login Panel) */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        
        <div className="w-full max-w-[440px] glass-panel p-6 sm:p-8 rounded-2xl relative animate-stagger">
          
          {/* Dynamic Header based on active tab */}
          <div className="mb-6 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
            {activeTab === "student" && (
              <>
                <h2 className="text-3xl font-black text-ink-900 mb-1 tracking-tight">Student Portal</h2>
                <p className="text-[14px] text-ink-500 font-medium">Student dashboard access</p>
              </>
            )}
            {activeTab === "admin" && (
              <>
                <h2 className="text-3xl font-black text-ink-900 mb-1 tracking-tight">Admin Portal</h2>
                <p className="text-[14px] text-ink-500 font-medium">Secure administrator access</p>
              </>
            )}
            {activeTab === "staff" && (
              <>
                <h2 className="text-3xl font-black text-ink-900 mb-1 tracking-tight">Staff Portal</h2>
                <p className="text-[14px] text-ink-500 font-medium">Instructor dashboard access</p>
              </>
            )}
          </div>

          {/* Tab Switcher */}
          <div className="flex mb-5 border border-stone-200 rounded-lg p-1 bg-cream-200">
            {(["student", "admin", "staff"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setError(""); setMode("login"); setStep(1); }}
                className={`flex-1 py-2 text-sm font-bold capitalize transition-all duration-300 rounded-md border ${
                  activeTab === tab ? "text-sapphire-800 bg-cream-100 shadow-sm border-stone-200" : "border-transparent text-ink-600 hover:text-ink-900 hover:bg-cream-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-100/50 border border-rose-200 text-rose-800 text-sm rounded-lg animate-in slide-in-from-top-2">
              <p className="font-bold mb-0.5 text-rose-900">Unable to log in</p>
              <p>{error}</p>
            </div>
          )}

          {activeTab === "student" && mode === "login" && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <form onSubmit={handleLogin} className="space-y-3">
                <Field label="Username or email" icon={User}>
                  <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className={inputCls} placeholder="Enter your username or email" />
                </Field>
                <Field label="Password" icon={Lock}>
                  <input type={showPassword ? "text" : "password"} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className={inputCls} placeholder="Enter your password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-sapphire-800 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </Field>

                <div className="flex items-center justify-end text-xs font-bold mt-2">
                  <button type="button" onClick={() => { setMode("forgot-password"); setError(""); setResetEmail(""); }} className="text-sapphire-800 hover:text-sapphire-900 transition-colors">Forgot password?</button>
                </div>
                
                <div className="glow-accent mt-5">
                  <button type="submit" disabled={isLoading} className="w-full py-3 bg-sapphire-900 hover:bg-sapphire-800 text-cream-100 text-[15px] font-semibold rounded-lg shadow-sm transition-all flex justify-center hover:-translate-y-0.5 active:translate-y-0">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Log in"}
                  </button>
                </div>
              </form>

              <div className="mt-5 text-center border-t border-stone-200/50 pt-5">
                <p className="text-sm text-ink-600 mb-1.5">Don't have an account?</p>
                <button onClick={() => setMode("register")} className="text-sapphire-800 font-bold hover:underline">Register as Student</button>
              </div>
            </div>
          )}

          {activeTab === "student" && mode === "register" && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-ink-900">Registration</h2>
                
                {/* Progress Bar */}
                <div className="mt-4 flex items-center justify-between relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-stone-200 -z-10 rounded-full" />
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-sapphire-800 -z-10 rounded-full transition-all duration-500" style={{ width: `${((step - 1) / 3) * 100}%` }} />
                  
                  {[1,2,3,4].map(num => (
                    <div key={num} className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${step >= num ? 'bg-sapphire-800 text-cream-100' : 'bg-cream-100 border-2 border-stone-200 text-stone-400'}`}>
                      {step > num ? <CheckCircle2 className="w-3.5 h-3.5" /> : num}
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={step === 4 ? handleRegister : (e) => { e.preventDefault(); handleNextStep(); }}>
                
                {step === 1 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
                    <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Step 1: Personal Info</h3>
                    <Field label="Full Name" icon={User}><input type="text" value={name} onChange={e => setName(e.target.value)} className={inputCls} placeholder="John Doe" /></Field>
                    <Field label="Register Number" icon={Hash}><input type="text" value={registerNumber} onChange={e => setRegisterNumber(e.target.value)} className={inputCls} placeholder="E23AI011" /></Field>
                    <Field label="College Email" icon={Mail}><input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} placeholder="student@shanmugha.edu.in" /></Field>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
                    <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Step 2: Academic Info</h3>
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
                    <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Step 3: LeetCode</h3>
                    <div className="p-3 bg-cream-200/50 rounded-lg mb-2 border border-stone-200 flex gap-2">
                      <Globe className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <p className="text-[11px] text-ink-900 leading-relaxed">Paste your full LeetCode profile URL to auto-extract your username.</p>
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
                    <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Step 4: Security</h3>
                    
                    <div className="space-y-1">
                      <Field label="Create Password" icon={Lock}>
                        <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className={inputCls} placeholder="Create password" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-sapphire-800 transition-colors"><EyeOff className="w-4 h-4" /></button>
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
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-sapphire-800 transition-colors"><EyeOff className="w-4 h-4" /></button>
                    </Field>
                  </div>
                )}

                <div className="flex gap-3 mt-8">
                  {step > 1 && (
                    <button type="button" onClick={() => { setError(""); setStep(step - 1); }} className="w-1/3 py-3 bg-cream-200 hover:bg-cream-300 text-ink-900 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                  )}
                  <button type="submit" disabled={isLoading} className={`${step > 1 ? 'w-2/3' : 'w-full'} py-3 bg-sapphire-800 hover:bg-sapphire-900 text-cream-100 text-sm font-bold rounded-lg shadow-sm hover:shadow-blue transition-all flex items-center justify-center gap-1.5`}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : step === 4 ? "Complete Setup" : <>Continue <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <button onClick={() => setMode("login")} className="text-[11px] text-stone-400 hover:text-ink-600 font-bold uppercase tracking-wider hover:underline">Cancel Registration</button>
              </div>
            </div>
          )}

          {activeTab === "student" && mode === "forgot-password" && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <button onClick={() => { setMode("login"); setError(""); }} className="mb-6 flex items-center gap-2 text-sm font-semibold text-ink-600 hover:text-ink-900 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </button>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-ink-900">Forgot Password</h2>
                <p className="text-sm text-ink-600 mt-1">Enter your registered email address to receive a verification code.</p>
              </div>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <Field label="Registered Email" icon={Mail}>
                  <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} className={inputCls} placeholder="e.g. student@shanmugha.edu.in" />
                </Field>
                <div className="glow-accent mt-6">
                  <button type="submit" disabled={isLoading} className="w-full py-3 bg-sapphire-900 hover:bg-sapphire-800 text-cream-100 text-sm font-bold rounded-lg shadow-sm transition-all flex justify-center hover:-translate-y-0.5 active:translate-y-0">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Verification Code"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "student" && mode === "otp-verification" && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <button onClick={() => { setMode("login"); setError(""); }} className="mb-6 flex items-center gap-2 text-sm font-semibold text-ink-600 hover:text-ink-900 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </button>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-ink-900">Enter Code</h2>
                <p className="text-sm text-ink-600 mt-1">We've sent a 6-digit verification code to <strong>{resetEmail}</strong></p>
              </div>
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <Field label="6-Digit Verification Code" icon={ShieldCheck}>
                  <input type="text" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} className={inputCls + " text-center tracking-widest font-mono text-lg"} placeholder="000000" />
                </Field>
                <div className="glow-accent mt-6">
                  <button type="submit" disabled={isLoading || otp.length !== 6} className="w-full py-3 bg-sapphire-900 hover:bg-sapphire-800 text-cream-100 text-sm font-bold rounded-lg shadow-sm transition-all flex justify-center hover:-translate-y-0.5 active:translate-y-0">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Code"}
                  </button>
                </div>
              </form>
              <div className="mt-6 text-center text-sm">
                {countdown > 0 ? (
                  <span className="text-ink-600 font-medium">Resend code in {countdown}s</span>
                ) : (
                  <button onClick={handleForgotPassword} disabled={isLoading} className="text-sapphire-800 font-bold hover:text-sapphire-900 transition-colors">
                    Resend Verification Code
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === "student" && mode === "reset-password" && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-ink-900">Set New Password</h2>
                <p className="text-sm text-ink-600 mt-1">Create a strong password for your account.</p>
              </div>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <Field label="New Password" icon={Lock}>
                  <input type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputCls} placeholder="Minimum 8 characters" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-sapphire-800 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </Field>
                <Field label="Confirm New Password" icon={Lock}>
                  <input type={showConfirmPassword ? "text" : "password"} value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className={inputCls} placeholder="Re-enter password" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-sapphire-800 transition-colors">
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </Field>
                
                <div className="bg-cream-200 p-4 rounded-lg border border-stone-100 text-xs text-ink-600 space-y-2 mt-4">
                  <p className="font-semibold text-ink-900">Password Requirements:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li className={newPassword.length >= 8 ? "text-emerald-600" : ""}>Minimum 8 characters</li>
                    <li className={/[A-Z]/.test(newPassword) ? "text-emerald-600" : ""}>At least one uppercase letter</li>
                    <li className={/[a-z]/.test(newPassword) ? "text-emerald-600" : ""}>At least one lowercase letter</li>
                    <li className={/[0-9]/.test(newPassword) ? "text-emerald-600" : ""}>At least one number</li>
                    <li className={/[^A-Za-z0-9]/.test(newPassword) ? "text-emerald-600" : ""}>At least one special character</li>
                  </ul>
                </div>

                <div className="glow-accent mt-6">
                  <button type="submit" disabled={isLoading} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-cream-100 text-sm font-bold rounded-lg shadow-sm transition-all flex justify-center hover:-translate-y-0.5 active:translate-y-0">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Reset Password"}
                  </button>
                </div>
              </form>
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
    </div>
  );
}


