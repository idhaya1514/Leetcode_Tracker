const fs = require('fs');
const path = 'c:/Users/idhay/Downloads/Leetcode_Tracker/Sscet_Tracker/frontend/src/app/services/api.ts';
let content = fs.readFileSync(path, 'utf8');

const otpLogic = `
// ─── Forgot Password / OTP Implementation ───────────────────────────────────────

// In-memory store for local fallback OTPs (for development without Supabase SMTP)
const mockOtpStore: Record<string, { otp: string, expiresAt: number }> = {};

export async function requestPasswordResetOTP(email: string, role: "student" | "staff"): Promise<void> {
  if (!email) throw new Error("Email is required");
  const normalizedEmail = email.trim().toLowerCase();

  return run(
    async () => {
      // 1. Verify if user exists in the correct table
      const { data, error } = await supabase!
        .from(role === "student" ? "students" : "staff")
        .select("id")
        .eq("email", normalizedEmail)
        .single();
        
      if (error || !data) {
        throw new Error("The email address does not match our records. Please enter the email address used during registration.");
      }

      // 2. Request OTP from Supabase Auth
      const { error: authError } = await supabase!.auth.resetPasswordForEmail(normalizedEmail);
      if (authError) throw new Error(authError.message);
    },
    () => Promise.reject("Not implemented via REST"),
    () => {
      // Fallback (Local Storage Mock)
      let found = false;
      if (role === "student") {
        found = !!lsStudents().find(s => (s.email || "").toLowerCase() === normalizedEmail);
      } else {
        found = !!lsStaff().find(s => (s.email || "").toLowerCase() === normalizedEmail);
      }
      
      if (!found) {
        throw new Error("The email address does not match our records. Please enter the email address used during registration.");
      }

      // Generate a mock 6-digit OTP
      const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
      mockOtpStore[normalizedEmail] = {
        otp: mockOtp,
        expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
      };
      
      console.log(\`[MOCK OTP for \${normalizedEmail}]: \${mockOtp}\`);
      // In a real local dev environment, we'd alert this or just print it to console.
      // We will actually just return and let the dev look at the console.
    }
  );
}

export async function verifyPasswordResetOTP(email: string, otp: string, role: "student" | "staff"): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  
  if (otp.length !== 6 || !/^\\d+$/.test(otp)) {
    throw new Error("Invalid verification code. Please try again.");
  }

  return run(
    async () => {
      const { data, error } = await supabase!.auth.verifyOtp({
        email: normalizedEmail,
        token: otp,
        type: 'recovery'
      });
      if (error) {
        if (error.message.includes('expired')) {
          throw new Error("Verification code has expired. Please request a new code.");
        }
        throw new Error("Invalid verification code. Please try again.");
      }
    },
    () => Promise.reject("Not implemented via REST"),
    () => {
      // Fallback
      const record = mockOtpStore[normalizedEmail];
      if (!record) throw new Error("Invalid verification code. Please try again.");
      
      if (Date.now() > record.expiresAt) {
        delete mockOtpStore[normalizedEmail];
        throw new Error("Verification code has expired. Please request a new code.");
      }
      
      if (record.otp !== otp) {
        throw new Error("Invalid verification code. Please try again.");
      }
      
      // OTP matched. We'll set a temporary flag to allow password change in the next step
      mockOtpStore[normalizedEmail + "_verified"] = { otp: "true", expiresAt: Date.now() + 10 * 60 * 1000 };
      delete mockOtpStore[normalizedEmail];
    }
  );
}

export async function updatePasswordSecurely(email: string, newPassword: string, role: "student" | "staff"): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  
  return run(
    async () => {
      // Assuming a session was established via verifyOtp
      const { error } = await supabase!.auth.updateUser({ password: newPassword });
      if (error) throw new Error(error.message);
      
      // Update our custom table's fallback password field just in case
      await supabase!.from(role === "student" ? "students" : "staff")
        .update({ password: newPassword })
        .eq("email", normalizedEmail);
    },
    () => Promise.reject("Not implemented via REST"),
    () => {
      // Fallback
      if (!mockOtpStore[normalizedEmail + "_verified"]) {
        throw new Error("Session expired. Please restart the password reset process.");
      }
      
      if (role === "student") {
        const students = lsStudents();
        const idx = students.findIndex(s => (s.email || "").toLowerCase() === normalizedEmail);
        if (idx !== -1) {
          students[idx].password = newPassword;
          localStorage.setItem("sscet_students", JSON.stringify(students));
        }
      } else {
        const staff = lsStaff();
        const idx = staff.findIndex(s => (s.email || "").toLowerCase() === normalizedEmail);
        if (idx !== -1) {
          staff[idx].password = newPassword;
          localStorage.setItem("sscet_staff", JSON.stringify(staff));
        }
      }
      
      delete mockOtpStore[normalizedEmail + "_verified"];
    }
  );
}
`;

// Insert the new logic before the first export async function resetStudentPassword
if (!content.includes('requestPasswordResetOTP')) {
  content = content.replace(
    /export async function resetStudentPassword/, 
    otpLogic + '\\n\\nexport async function resetStudentPassword'
  );
  fs.writeFileSync(path, content);
  console.log("Added OTP logic to api.ts");
} else {
  console.log("OTP logic already exists.");
}
