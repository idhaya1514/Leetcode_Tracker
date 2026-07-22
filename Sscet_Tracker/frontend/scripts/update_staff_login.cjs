const fs = require('fs');

const path = 'c:/Users/idhay/Downloads/Leetcode_Tracker/Sscet_Tracker/frontend/src/app/components/StaffLogin.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add API imports
if (!content.includes('requestPasswordResetOTP')) {
  content = content.replace(
    /import \{ IdCard, Lock, Eye, EyeOff, Loader2, BookOpen, User, Briefcase, ArrowLeft \} from "lucide-react";/,
    `import { IdCard, Lock, Eye, EyeOff, Loader2, BookOpen, User, Briefcase, ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import { requestPasswordResetOTP, verifyPasswordResetOTP, updatePasswordSecurely } from "../services/api";
import { toast } from "sonner";`
  );

  // 2. Add State variables
  content = content.replace(
    /const \[view, setView\] = useState<'login' \| 'forgot-password' \| 'reset-password'>\('login'\);/,
    `const [view, setView] = useState<'login' | 'forgot-password' | 'otp-verification' | 'reset-password'>('login');
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [countdown, setCountdown] = useState(0);`
  );
  
  content = content.replace(
    /const \[showPassword, setShowPassword\] = useState\(false\);/,
    `const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);`
  );

  // 3. Add effect for countdown
  content = content.replace(
    /const handleSubmit = async /,
    `
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0 && view === "otp-verification") {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown, view]);

  const validatePasswordStrength = (pwd: string) => {
    if (pwd.length < 8) return false;
    if (!/[A-Z]/.test(pwd)) return false;
    if (!/[a-z]/.test(pwd)) return false;
    if (!/[0-9]/.test(pwd)) return false;
    if (!/[^A-Za-z0-9]/.test(pwd)) return false;
    return true;
  };

  const handleSubmit = async `
  );

  // 4. Update handlers
  content = content.replace(
    /const handleForgotPassword = \(e: React.FormEvent\) => \{[\s\S]*?^  \};/m,
    `const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setError("Please enter your registered email address.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await requestPasswordResetOTP(resetEmail, "staff");
      setView('otp-verification');
      setCountdown(60);
      toast.success("Verification code sent to your email!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };`
  );

  const handleVerifyOtp = `
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) return setError("Please enter the verification code.");
    setLoading(true);
    setError("");
    try {
      await verifyPasswordResetOTP(resetEmail, otp, "staff");
      setView("reset-password");
      toast.success("Code verified successfully!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
`;

  content = content.replace(
    /const handleResetPassword = \(e: React.FormEvent\) => \{[\s\S]*?^  \};/m,
    handleVerifyOtp + `
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmNewPassword) {
      return setError("Passwords do not match.");
    }
    if (!validatePasswordStrength(newPassword)) {
      return setError("Please create a stronger password that meets all security requirements.");
    }
    setLoading(true);
    try {
      await updatePasswordSecurely(resetEmail, newPassword, "staff");
      setView('login');
      setResetEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmNewPassword("");
      setSuccessMsg("Your password has been reset successfully. Please log in using your new password.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };`
  );

  // 5. Update UI for Forgot Password
  content = content.replace(
    /if \(view === 'forgot-password'\) \{[\s\S]*?^  \}/m,
    `if (view === 'forgot-password') {
    return (
      <div className="animate-in fade-in zoom-in-95 duration-300">
        <button onClick={() => setView('login')} className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </button>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Forgot Password</h2>
          <p className="text-sm text-slate-500 mt-1">Enter your registered email address to receive a verification code.</p>
        </div>
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-sm font-medium rounded-r-lg">
            <p>{error}</p>
          </div>
        )}
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <Field label="Registered Email" icon={Mail}>
            <input 
              type="email" 
              value={resetEmail} 
              onChange={(e) => setResetEmail(e.target.value)} 
              className={inputCls} 
              placeholder="e.g. staff@college.edu" 
            />
          </Field>
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all flex justify-center mt-6"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Verification Code"}
          </button>
        </form>
      </div>
    );
  }`
  );

  // 6. Update UI for Reset Password and Add OTP
  content = content.replace(
    /if \(view === 'reset-password'\) \{[\s\S]*?^  \}/m,
    `if (view === 'otp-verification') {
    return (
      <div className="animate-in fade-in zoom-in-95 duration-300">
        <button onClick={() => setView('login')} className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </button>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Enter Code</h2>
          <p className="text-sm text-slate-500 mt-1">We've sent a 6-digit verification code to <strong>{resetEmail}</strong></p>
        </div>
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-sm font-medium rounded-r-lg">
            <p>{error}</p>
          </div>
        )}
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <Field label="6-Digit Verification Code" icon={ShieldCheck}>
            <input 
              type="text" 
              maxLength={6} 
              value={otp} 
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} 
              className={inputCls + " text-center tracking-widest font-mono text-lg"} 
              placeholder="000000" 
            />
          </Field>
          <button 
            type="submit" 
            disabled={loading || otp.length !== 6} 
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all flex justify-center mt-6"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Code"}
          </button>
        </form>
        <div className="mt-6 text-center text-sm">
          {countdown > 0 ? (
            <span className="text-slate-500 font-medium">Resend code in {countdown}s</span>
          ) : (
            <button onClick={handleForgotPassword} disabled={loading} className="text-blue-600 font-bold hover:text-blue-800 transition-colors">
              Resend Verification Code
            </button>
          )}
        </div>
      </div>
    );
  }

  if (view === 'reset-password') {
    return (
      <div className="animate-in fade-in zoom-in-95 duration-300">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Set New Password</h2>
          <p className="text-sm text-slate-500 mt-1">Create a strong password for your staff account.</p>
        </div>
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-sm font-medium rounded-r-lg">
            <p>{error}</p>
          </div>
        )}
        <form onSubmit={handleResetPassword} className="space-y-4">
          <Field label="New Password" icon={Lock}>
            <input type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputCls} placeholder="Minimum 8 characters" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-blue-600 transition-colors">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </Field>
          <Field label="Confirm New Password" icon={Lock}>
            <input type={showConfirmPassword ? "text" : "password"} value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className={inputCls} placeholder="Re-enter password" />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-blue-600 transition-colors">
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </Field>
          
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-xs text-slate-500 space-y-2 mt-4">
            <p className="font-semibold text-slate-700">Password Requirements:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li className={newPassword.length >= 8 ? "text-emerald-600" : ""}>Minimum 8 characters</li>
              <li className={/[A-Z]/.test(newPassword) ? "text-emerald-600" : ""}>At least one uppercase letter</li>
              <li className={/[a-z]/.test(newPassword) ? "text-emerald-600" : ""}>At least one lowercase letter</li>
              <li className={/[0-9]/.test(newPassword) ? "text-emerald-600" : ""}>At least one number</li>
              <li className={/[^A-Za-z0-9]/.test(newPassword) ? "text-emerald-600" : ""}>At least one special character</li>
            </ul>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-all flex justify-center mt-6"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Reset Password"}
          </button>
        </form>
      </div>
    );
  }`
  );

  fs.writeFileSync(path, content);
  console.log("Updated StaffLogin with OTP flows.");
} else {
  console.log("Already updated StaffLogin.");
}
