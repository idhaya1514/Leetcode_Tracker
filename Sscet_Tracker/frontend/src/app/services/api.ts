// @ts-nocheck
import { supabase, isSupabaseConfigured } from "./supabaseClient";
export { supabase };
import defaultQuestions from "../data/default_questions.json";

// ─── Configuration ────────────────────────────────────────────────────────────
// Priority: Supabase → Express/SQLite → localStorage
export const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Student {
  id?: number;
  name: string;
  registerNumber: string;
  email?: string;
  password?: string;
  department: string;
  academicYear?: string;
  leetCodeUrl?: string;
  leetCodeUsername?: string;
  createdAt?: string;
}

export interface LeetCodeStats {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  ranking: number;
  username: string;
  realName?: string;
  avatar?: string;
  totalQuestions?: number;
  streak?: number;
  longestStreak?: number;
  solvedToday?: number;
  weeklyProgress?: number;
  monthlyProgress?: number;
  weeklyChartData?: { name: string; solved: number }[];
  acceptanceRate?: number | string;
  totalEasy?: number;
  totalMedium?: number;
  totalHard?: number;
}

export interface Question {
  id: string | number;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  language: "javascript" | "python" | "java" | "c" | "cpp";
  expectedOutput: string;
  testCases: { input: string; output: string }[];
  vivas: {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
  createdAt?: string;
}

export interface ExamResult {
  id?: number;
  student: {
    name: string;
    registerNumber: string;
    department?: string;
    leetCodeUsername?: string;
  };
  question: string;
  questionId?: string | number;
  programmingMarks: number;
  mcqMarks: number;
  observationMarks?: number;
  totalMarks: number;
  maxMarks: number;
  code: string;
  codeOutput: string;
  outputMatches: boolean;
  mcqAnswers: Record<number, number>;
  timeSpent: number;
  malpractice: boolean;
  malpracticeReason?: string;
  submittedAt?: string;
}

// ─── Express HTTP helper ──────────────────────────────────────────────────────

async function handleResponse(response: Response) {
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const error = new Error("Response is not JSON");
    (error as any).isHttpError = true;
    (error as any).status = response.status;
    throw error;
  }
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      errorMessage = body.error || body.message || errorMessage;
    } catch {
      // ignore
    }
    const error = new Error(errorMessage);
    (error as any).isHttpError = true;
    (error as any).status = response.status;
    throw error;
  }
  return response.json();
}

// ─── Health / Connectivity ────────────────────────────────────────────────────

export async function checkServerHealth(): Promise<boolean> {
  // Supabase is our primary cloud server
  return isSupabaseConfigured;
}

// ─── Local Storage Helpers ────────────────────────────────────────────────────

function lsGet<T>(key: string, def: T): T {
  const d = localStorage.getItem(key);
  return d ? JSON.parse(d) : def;
}
function lsSet<T>(key: string, v: T) {
  localStorage.setItem(key, JSON.stringify(v));
}

function lsStudents(): Student[] {
  return lsGet<Student[]>("exam_portal_students", []);
}
function lsSaveStudents(s: Student[]) {
  lsSet("exam_portal_students", s);
}

function lsQuestions(): Question[] {
  const q = lsGet<Question[]>("exam_portal_questions", []);
  if (q.length === 0) {
    lsSet("exam_portal_questions", defaultQuestions);
    return defaultQuestions;
  }
  return q;
}
function lsSaveQuestions(q: Question[]) {
  lsSet("exam_portal_questions", q);
}

interface LocalAssignment {
  registerNumber: string;
  questionId: string | number;
}
function lsAssignments(): LocalAssignment[] {
  return lsGet<LocalAssignment[]>("exam_portal_assignments", []);
}
function lsSaveAssignments(a: LocalAssignment[]) {
  lsSet("exam_portal_assignments", a);
}

function lsResults(): ExamResult[] {
  return lsGet<ExamResult[]>("exam_portal_results", []);
}
function lsSaveResults(r: ExamResult[]) {
  lsSet("exam_portal_results", r);
}

export interface StaffStudentAssignment {
  staffId: string;
  studentRegisterNumber: string;
  assignedAt: string;
}

export interface AssignmentHistoryRecord {
  id: string;
  registerNumber: string;
  studentName: string;
  previousStaff: string | null;
  newStaff: string;
  assignedBy: string;
  assignedAt: string;
}

export function lsStaffAssignments(): StaffStudentAssignment[] {
  return lsGet<StaffStudentAssignment[]>("exam_portal_staff_assignments", []);
}
export function lsSaveStaffAssignments(a: StaffStudentAssignment[]) {
  lsSet("exam_portal_staff_assignments", a);
}

export function lsAssignmentsHistory(): AssignmentHistoryRecord[] {
  return lsGet<AssignmentHistoryRecord[]>("exam_portal_assignment_history", []);
}
export function lsSaveAssignmentsHistory(a: AssignmentHistoryRecord[]) {
  lsSet("exam_portal_assignment_history", a);
}

// ─── Unified runner ───────────────────────────────────────────────────────────

async function run<T>(
  supabaseCall: (() => Promise<T>) | null,
  expressCall: () => Promise<Response>,
  localCall: () => T,
): Promise<T> {
  if (isSupabaseConfigured && supabaseCall) {
    try {
      return await supabaseCall();
    } catch (e: any) {
      console.error("Supabase Error:", e);
    }
  }

  try {
    const res = await expressCall();
    return await handleResponse(res);
  } catch (e: any) {
    if (e.isHttpError) {
      throw e; // Do not fallback if backend responded with an error
    }
    console.warn("Express API network error, falling back to local storage:", e.message);
    try {
      // Fallback to local storage
      return localCall();
    } catch (localError: any) {
      throw new Error(localError.message || "Operation failed in fallback mode.");
    }
  }
}

// ════════════════════════════════════════════════════════════════════════════════
//  STUDENT APIs
// ════════════════════════════════════════════════════════════════════════════════

let cachedStudents: Student[] | null = null;
let lastStudentsFetchTime = 0;
const CACHE_TTL = 30000; // 30 seconds

export async function getStudents(forceRefresh = false): Promise<Student[]> {
  const now = Date.now();
  if (!forceRefresh && cachedStudents && (now - lastStudentsFetchTime < CACHE_TTL)) {
    return cachedStudents;
  }
  
  try {
    const data = await run(
      async () => {
        const { data, error } = await supabase!.from("students").select("*");
        if (error) throw error;
        return data.map((d: any) => ({
          id: d.id,
          name: d.name,
          registerNumber: d.register_number,
          email: d.email,
          password: d.password,
          department: d.department,
          academicYear: d.academic_year,
          leetCodeUrl: d.leetcode_url,
          leetCodeUsername: d.leet_code_username,
          createdAt: d.created_at,
        }));
      },
      () => fetch(`${API_BASE_URL}/students`),
      () => lsStudents()
    );
    cachedStudents = data;
    lastStudentsFetchTime = now;
    return data || [];
  } catch (err) {
    console.error('getStudents Error:', err);
    if (cachedStudents) return cachedStudents;
    return [];
  }
}

export async function getStudent(registerNumber: string): Promise<Student> {
  if (!registerNumber) {
    throw new Error("Register number is required");
  }

  return run(
    async () => {
      const { data, error } = await supabase!
        .from("students")
        .select("*")
        .eq("register_number", registerNumber.trim())
        .single();
      if (error)
        throw new Error(
          "Student not found. Please contact your administrator.",
        );
      return {
        id: data.id,
        name: data.name,
        registerNumber: data.register_number,
        email: data.email,
        password: data.password,
        department: data.department,
        leetCodeUsername: data.leet_code_username,
        createdAt: data.created_at,
      };
    },
    () =>
      fetch(`${API_BASE_URL}/students/${encodeURIComponent(registerNumber)}`),
    () => {
      const s = lsStudents().find(
        (s) =>
          s.registerNumber.trim().toLowerCase() ===
          registerNumber.trim().toLowerCase(),
      );
      if (!s)
        throw new Error(
          "Student not found. Please contact your administrator.",
        );
      return s;
    },
  );
}

export async function getStudentByEmail(email: string): Promise<Student> {
  if (!email) {
    throw new Error("Email is required");
  }

  return run(
    async () => {
      const { data, error } = await supabase!
        .from("students")
        .select("*")
        .eq("email", email.trim().toLowerCase())
        .single();
      if (error) throw new Error("Email not found. Please register first.");
      return {
        id: data.id,
        name: data.name,
        registerNumber: data.register_number,
        email: data.email,
        password: data.password,
        department: data.department,
        leetCodeUsername: data.leet_code_username,
        createdAt: data.created_at,
      };
    },
    () =>
      fetch(`${API_BASE_URL}/students/by-email/${encodeURIComponent(email)}`),
    () => {
      const s = lsStudents().find(
        (s) =>
          (s.email || "").trim().toLowerCase() === email.trim().toLowerCase(),
      );
      if (!s) throw new Error("Email not found. Please register first.");
      return s;
    },
  );
}

export function getLeetCodeProfileUrl(
  usernameOrUrl: string | undefined,
): string {
  if (!usernameOrUrl) return "";
  const cleaned = cleanLeetCodeUsername(usernameOrUrl);
  return `https://leetcode.com/u/${cleaned}/`;
}

export async function loginStudent(registerNumber: string, password?: string): Promise<{ success: boolean; data?: Student; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: registerNumber, password, role: 'student' })
    });
    const json = await res.json();
    if (res.ok && json.token) {
      return { success: true, data: json.user as Student };
    }
    return { success: false, error: json.error || 'Login failed' };
  } catch (error: any) {
    console.warn("Express API failed, falling back to local storage:", error.message);
    try {
      const all = lsStudents();
      const s = all.find(
        (st) =>
          st.registerNumber.toLowerCase() === registerNumber.trim().toLowerCase() ||
          (st.email || "").toLowerCase() === registerNumber.trim().toLowerCase()
      );
      if (!s) throw new Error("Invalid credentials.");
      if (s.password && password && s.password !== password) {
        throw new Error("Invalid credentials (local storage).");
      }
      return { success: true, data: s };
    } catch (localError: any) {
      return { success: false, error: localError.message };
    }
  }
}

export async function requestPasswordResetOTP(email: string, role: "student" | "staff"): Promise<void> {
  if (!email) throw new Error("Email is required");
  const normalizedEmail = email.trim().toLowerCase();

  const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: normalizedEmail, role })
  });
  
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error || "Failed to process request");
  }
  
  // Show mock OTP alert if SMTP isn't set up yet
  if (data.message && data.message.includes("Mock OTP")) {
    console.log(data.message);
  }
}

export async function verifyPasswordResetOTP(email: string, otp: string, role: "student" | "staff"): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  
  if (otp.length !== 6 || !/^\d+$/.test(otp)) {
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
    async () => {
      const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, otp, role })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Invalid verification code.");
      }
      return res;
    },
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
    async () => {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, newPassword, role })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to reset password.");
      }
      return res;
    },
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


export async function resetStudentPassword(email: string): Promise<void> {
  if (!isSupabaseConfigured)
    throw new Error("Supabase is not configured. Cannot reset password.");
  const { error } = await supabase!.auth.resetPasswordForEmail(
    email.trim().toLowerCase(),
  );
  if (error) throw new Error(error.message);
}

export async function updateStudentPassword(
  newPassword: string,
): Promise<void> {
  if (!isSupabaseConfigured) throw new Error("Supabase is not configured.");
  const { error } = await supabase!.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
}

export async function createStudent(
  student: Omit<Student, "id" | "createdAt">,
): Promise<Student> {
  return run(
    async () => {
      if (student.email && !student.email.trim().toLowerCase().endsWith('@shanmugha.edu.in')) {
        throw new Error('Only @shanmugha.edu.in email addresses are allowed.');
      }
      if (student.password && student.email) {
        const { error: authError } = await supabase!.auth.signUp({
          email: student.email.trim().toLowerCase(),
          password: student.password,
        });
        if (authError) throw new Error(`Auth Error: ${authError.message}`);
      }

      const { data, error } = await supabase!
        .from("students")
        .insert({
          name: student.name.trim(),
          register_number: student.registerNumber.trim(),
          department: student.department.trim(),
          email: student.email ? student.email.trim().toLowerCase() : null,
          password: student.password ? student.password.trim() : null,
          academic_year: student.academicYear ? student.academicYear.trim() : null,
          leetcode_url: student.leetCodeUrl ? student.leetCodeUrl.trim() : null,
          leet_code_username: student.leetCodeUsername
            ? student.leetCodeUsername.trim()
            : null,
        })
        .select()
        .single();
      if (error) {
        if (error.code === "23505") {
          const msg =
            (error.message || "").toLowerCase() +
            " " +
            (error.details || "").toLowerCase();
          if (msg.includes("email")) {
            throw new Error(`Email "${student.email}" is already registered.`);
          } else if (msg.includes("leet_code_username")) {
            throw new Error(
              `LeetCode Username "${student.leetCodeUsername}" is already registered.`,
            );
          }
          throw new Error(
            `Register number "${student.registerNumber}" already exists.`,
          );
        }
        throw error;
      }
      return {
        id: data.id,
        name: data.name,
        registerNumber: data.register_number,
        department: data.department,
        email: data.email,
        password: data.password,
        academicYear: data.academic_year,
        leetCodeUrl: data.leetcode_url,
        leetCodeUsername: data.leet_code_username,
        createdAt: data.created_at,
      };
    },
    () =>
      fetch(`${API_BASE_URL}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(student),
      }),
    () => {
      if (student.email && !student.email.trim().toLowerCase().endsWith('@shanmugha.edu.in')) {
        throw new Error('Only @shanmugha.edu.in email addresses are allowed.');
      }
      const all = lsStudents();
      if (
        all.some(
          (s) =>
            s.registerNumber.toLowerCase() ===
            student.registerNumber.trim().toLowerCase(),
        )
      )
        throw new Error(
          `Register number "${student.registerNumber}" already exists`,
        );
      if (
        student.email &&
        all.some(
          (s) =>
            (s.email || "").toLowerCase() ===
            student.email!.trim().toLowerCase(),
        )
      )
        throw new Error(`Email "${student.email}" is already registered`);
      const n: Student = {
        ...student,
        email: student.email ? student.email.trim().toLowerCase() : undefined,
        id: Date.now(),
        createdAt: new Date().toISOString(),
      };
      all.push(n);
      lsSaveStudents(all);
      return n;
    },
  );
}

export async function updateStudent(
  id: number | string,
  student: Omit<Student, "id" | "createdAt">,
): Promise<Student> {
  return run(
    async () => {
      const { data, error } = await supabase!
        .from("students")
        .update({
          name: student.name.trim(),
          register_number: student.registerNumber.trim(),
          department: student.department.trim(),
          email: student.email ? student.email.trim().toLowerCase() : null,
          password: student.password ? student.password.trim() : null,
          academic_year: student.academicYear ? student.academicYear.trim() : null,
          leetcode_url: student.leetCodeUrl ? student.leetCodeUrl.trim() : null,
          leet_code_username: student.leetCodeUsername
            ? student.leetCodeUsername.trim()
            : null,
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return {
        id: data.id,
        name: data.name,
        registerNumber: data.register_number,
        email: data.email,
        password: data.password,
        department: data.department,
        academicYear: data.academic_year,
        leetCodeUrl: data.leetcode_url,
        leetCodeUsername: data.leet_code_username,
        createdAt: data.created_at,
      };
    },
    () =>
      fetch(`${API_BASE_URL}/students/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(student),
      }),
    () => {
      if (student.email && !student.email.trim().toLowerCase().endsWith('@shanmugha.edu.in')) {
        throw new Error('Only @shanmugha.edu.in email addresses are allowed.');
      }
      const McKinseyAll = lsStudents();
      const idx = McKinseyAll.findIndex((s) => s.id === Number(id));
      if (idx === -1) throw new Error("Student not found");
      McKinseyAll[idx] = { ...McKinseyAll[idx], ...student };
      lsSaveStudents(McKinseyAll);
      return McKinseyAll[idx];
    },
  );
}

export async function deleteStudent(
  id: number | string,
): Promise<{ message: string }> {
  return run(
    async () => {
      const { error } = await supabase!.from("students").delete().eq("id", id);
      if (error) throw error;
      return { message: "Student deleted successfully" };
    },
    () => fetch(`${API_BASE_URL}/students/${id}`, { method: "DELETE" }),
    () => {
      lsSaveStudents(lsStudents().filter((s) => s.id !== Number(id)));
      return { message: "Student deleted successfully" };
    },
  );
}

export async function deleteAllStudents(): Promise<{ message: string }> {
  // Always clear local storage as well to prevent out-of-sync issues
  lsSaveStudents([]);
  lsSaveResults([]);
  lsSaveAssignments([]);

  return run(
    async () => {
      // Supabase: we can try to delete all where id > 0
      await supabase!.from("exam_results").delete().gt("id", 0);
      await supabase!.from("assigned_questions").delete().gt("id", 0);
      const { error } = await supabase!.from("students").delete().gt("id", 0);
      if (error) throw error;
      return { message: "All students deleted successfully" };
    },
    () => fetch(`${API_BASE_URL}/students`, { method: "DELETE" }),
    () => {
      return { message: "All students deleted successfully" };
    },
  );
}

export async function importStudents(file: File): Promise<{ message: string, summary: any, errors: any[] }> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(`${API_BASE_URL}/import/students`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Import failed");
    }
    return await res.json();
  } catch (error: any) {
    throw new Error(error.message || "Failed to upload file");
  }
}

// ════════════════════════════════════════════════════════════════════════════════
//  LEETCODE API
// ════════════════════════════════════════════════════════════════════════════════

export function cleanLeetCodeUsername(username: string): string {
  let cleaned = username.trim();
  if (cleaned.includes("leetcode.com/")) {
    const parts = cleaned.split("leetcode.com/");
    const path = parts[1] || "";
    const segments = path.split("/").filter(Boolean);
    if (segments[0] === "u" && segments[1]) {
      cleaned = segments[1];
    } else if (segments[0]) {
      cleaned = segments[0];
    }
  }
  if (cleaned.startsWith("@")) {
    cleaned = cleaned.substring(1);
  }
  if (cleaned.includes("@")) {
    cleaned = cleaned.split("@")[0];
  }
  return cleaned.trim();
}

export async function fetchLeetCodeSolvedOnly(
  username: string,
): Promise<number> {
  const cleaned = cleanLeetCodeUsername(username);
  const cacheKey = `lc_solved_cache_${cleaned.toLowerCase()}`;
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    try {
      const { count, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        return count;
      }
    } catch {
      // Ignore cache corruption
    }
  }

  const clean = encodeURIComponent(cleaned);
  const res = await fetch(
    `https://alfa-leetcode-api.onrender.com/${clean}/solved?t=${Date.now()}`,
    { cache: "no-store" as RequestCache },
  );
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.errors?.[0]?.message || `User not found.`);
  }

  const solved = await res.json();
  if (solved.errors && solved.errors.length > 0) {
    throw new Error(solved.errors[0].message || "User not found.");
  }

  const count = solved.solvedProblem || 0;
  localStorage.setItem(
    cacheKey,
    JSON.stringify({
      count,
      timestamp: Date.now(),
    }),
  );

  // Also pre-populate the full stats cache with this totalSolved to prevent double fetch
  const fullCacheKey = `lc_cache_${cleaned.toLowerCase()}`;
  const fullCached = localStorage.getItem(fullCacheKey);
  if (!fullCached) {
    localStorage.setItem(
      fullCacheKey,
      JSON.stringify({
        data: {
          username: cleaned,
          totalSolved: count,
          easySolved: solved.easySolved || 0,
          mediumSolved: solved.mediumSolved || 0,
          hardSolved: solved.hardSolved || 0,
          ranking: 0,
          realName: undefined,
          avatar: undefined,
          totalQuestions: undefined,
        },
        timestamp: Date.now(),
      }),
    );
  }

  return count;
}

export async function fetchLeetCodeStats(
  username: string,
  forceSync: boolean = false,
): Promise<LeetCodeStats> {
  const cleanedUsername = cleanLeetCodeUsername(username);

  // Cache check (5 minutes duration)
  const cacheKey = `lc_cache_${cleanedUsername.toLowerCase()}`;
  if (!forceSync) {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          return data;
        }
      } catch {
        // Ignore cache format error
      }
    }
  }

  const clean = encodeURIComponent(cleanedUsername);

  try {
    const fetchOpts = { cache: "no-store" as RequestCache };
    const res = await fetch(`https://leetcode-api-faisalshohag.vercel.app/${clean}?t=${Date.now()}`, fetchOpts);

    if (!res.ok) throw new Error("Primary API failed");

    const data = await res.json();
    if (data.errors && data.errors.length > 0)
      throw new Error("User not found");

    const calendar = data.submissionCalendar || {};
    let submissionsToday = 0;
    let weeklySubmissions = 0;
    let monthlySubmissions = 0;
    let currentStreak = 0;
    let longestStreak = 0;

    const now = Math.floor(Date.now() / 1000);
    const SECONDS_IN_DAY = 86400;

    const activeDays = new Set<number>();
    // Generate Monday to Sunday for the current week
    const weeklyChartData = Array(7).fill(0).map((_, i) => {
      const d = new Date(now * 1000);
      // getDay() returns 0 for Sunday, 1 for Monday, etc.
      const day = d.getDay();
      // Calculate how many days to subtract to get to the most recent Monday
      // If today is Sunday (0), we subtract 6 days. Otherwise, subtract day - 1.
      const diffToMonday = day === 0 ? 6 : day - 1;
      
      d.setDate(d.getDate() - diffToMonday + i);
      const name = d.toLocaleDateString('en-US', { weekday: 'short' });
      return { name, solved: 0, dateStr: d.toISOString().split('T')[0] };
    });
    
    let totalSubmissions = 0;
    for (const [tsStr, count] of Object.entries(calendar)) {
      const ts = parseInt(tsStr, 10);
      const diff = now - ts;
      const countNum = count as number;
      totalSubmissions += countNum;

      if (diff < SECONDS_IN_DAY) submissionsToday += countNum;
      if (diff < 7 * SECONDS_IN_DAY) weeklySubmissions += countNum;
      if (diff < 30 * SECONDS_IN_DAY) monthlySubmissions += countNum;

      const d = new Date(ts * 1000);
      const dateStr = d.toISOString().split('T')[0];
      const chartItem = weeklyChartData.find(w => w.dateStr === dateStr);
      if (chartItem) chartItem.solved += countNum;

      const dayIndex = Math.floor(ts / SECONDS_IN_DAY);
      activeDays.add(dayIndex);
    }

    const sortedDays = Array.from(activeDays).sort((a, b) => b - a);

    if (sortedDays.length > 0) {
      const currentDayIndex = Math.floor(now / SECONDS_IN_DAY);
      
      if (sortedDays[0] === currentDayIndex || sortedDays[0] === currentDayIndex - 1) {
        currentStreak = 1;
        for (let i = 1; i < sortedDays.length; i++) {
          if (sortedDays[i - 1] - sortedDays[i] === 1) currentStreak++;
          else break;
        }
      }

      let tempStreak = 1;
      longestStreak = 1;
      for (let i = 1; i < sortedDays.length; i++) {
        if (sortedDays[i - 1] - sortedDays[i] === 1) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, currentStreak);
    }

    // Estimate Unique Problems Solved
    // LeetCode's API only gives us up to 20 recent submissions, so we use a ratio of total solved / total submissions
    const totalSolved = data.totalSolved || 0;
    const ratio = totalSubmissions > 0 ? (totalSolved / totalSubmissions) : 1;
    
    // Exact count from recentSubmissions if we have all of them for the time period
    const recentSubmissions = data.recentSubmissions || [];
    const getExactSolved = (maxSeconds: number) => {
      const solvedSet = new Set<string>();
      let completeHistory = false;
      
      // If we have fewer than 20 submissions, or the oldest submission is older than our time window, 
      // we know we have the full history for this time window.
      if (recentSubmissions.length < 20 || (recentSubmissions.length === 20 && (now - parseInt(recentSubmissions[19].timestamp, 10)) > maxSeconds)) {
        completeHistory = true;
      }
      
      for (const sub of recentSubmissions) {
        if (now - parseInt(sub.timestamp, 10) < maxSeconds && sub.statusDisplay === "Accepted") {
          solvedSet.add(sub.titleSlug);
        }
      }
      return { exactCount: solvedSet.size, isExact: completeHistory };
    };

    const todayData = getExactSolved(SECONDS_IN_DAY);
    const weeklyData = getExactSolved(7 * SECONDS_IN_DAY);
    const monthlyData = getExactSolved(30 * SECONDS_IN_DAY);

    // Apply Chart Ratio
    weeklyChartData.forEach(item => {
      item.solved = Math.round(item.solved * ratio);
    });

    const result: LeetCodeStats = {
      username: cleanedUsername,
      realName: data.name || cleanedUsername,
      avatar: data.avatar || "https://assets.leetcode.com/users/default_avatar.png",
      ranking: data.ranking || 0,
      totalSolved: data.totalSolved || 0,
      totalQuestions: data.totalQuestions || 3000,
      easySolved: data.easySolved || 0,
      totalEasy: data.totalEasy || 700,
      mediumSolved: data.mediumSolved || 0,
      totalMedium: data.totalMedium || 1500,
      hardSolved: data.hardSolved || 0,
      totalHard: data.totalHard || 600,
      streak: currentStreak,
      longestStreak,
      solvedToday: todayData.isExact ? todayData.exactCount : Math.round(submissionsToday * ratio),
      weeklyProgress: weeklyData.isExact ? weeklyData.exactCount : Math.round(weeklySubmissions * ratio),
      monthlyProgress: monthlyData.isExact ? monthlyData.exactCount : Math.round(monthlySubmissions * ratio),
      weeklyChartData: weeklyChartData.map(d => ({ name: d.name, solved: d.solved })),
    };

    localStorage.setItem(
      cacheKey,
      JSON.stringify({ data: result, timestamp: Date.now() })
    );

    return result;
  } catch (err: any) {
    console.error(`[API] Error fetching stats for ${username}:`, err);
    throw err;
  }
}

// ════════════════════════════════════════════════════════════════════════════════
//  QUESTION APIs
// ════════════════════════════════════════════════════════════════════════════════

function mapQuestion(r: any): Question {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    difficulty: r.difficulty,
    language: r.language,
    expectedOutput: r.expected_output,
    testCases:
      typeof r.test_cases === "string"
        ? JSON.parse(r.test_cases)
        : (r.test_cases ?? []),
    vivas: typeof r.vivas === "string" ? JSON.parse(r.vivas) : (r.vivas ?? []),
    createdAt: r.created_at,
  };
}

export async function getQuestions(): Promise<Question[]> {
  if (isSupabaseConfigured && !hasCheckedDefaultQuestions) {
    hasCheckedDefaultQuestions = true;
    ensureDefaultQuestionsSeeded().catch((err) =>
      console.error("ensureDefaultQuestionsSeeded error:", err),
    );
  }
  return run(
    async () => {
      const { data, error } = await supabase!
        .from("questions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const mapped = (data ?? []).map(mapQuestion);
      if (mapped.length === 0) {
        try {
          console.log("Auto-seeding questions in Supabase...");
          const seeded = await seedDefaultQuestions();
          if (seeded && seeded.length > 0) {
            return seeded;
          }
        } catch (e) {
          console.warn("Auto-seeding failed:", e);
        }
      }

      // Merge remote questions with localStorage questions
      const local = lsQuestions();
      const merged = [...mapped];
      for (const l of local) {
        if (
          !merged.some(
            (r) =>
              String(r.id) === String(l.id) ||
              r.title.toLowerCase() === l.title.toLowerCase(),
          )
        ) {
          merged.push(l);
        }
      }
      return merged;
    },
    () => fetch(`${API_BASE_URL}/questions`),
    () => lsQuestions(),
  );
}

export async function createQuestion(
  question: Omit<Question, "id" | "createdAt">,
): Promise<Question> {
  return run(
    async () => {
      const { data, error } = await supabase!
        .from("questions")
        .insert({
          title: question.title.trim(),
          description: question.description.trim(),
          difficulty: question.difficulty,
          language: question.language,
          expected_output: (question.expectedOutput || "").trim(),
          test_cases: question.testCases || [],
          vivas: question.vivas || [],
        })
        .select()
        .single();
      if (error) throw error;
      return mapQuestion(data);
    },
    () =>
      fetch(`${API_BASE_URL}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(question),
      }),
    () => {
      const all = lsQuestions();
      const n: Question = {
        ...question,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      all.push(n);
      lsSaveQuestions(all);
      return n;
    },
  );
}

export async function updateQuestion(
  id: number | string,
  question: Omit<Question, "id" | "createdAt">,
): Promise<Question> {
  return run(
    async () => {
      const { data, error } = await supabase!
        .from("questions")
        .update({
          title: question.title.trim(),
          description: question.description.trim(),
          difficulty: question.difficulty,
          language: question.language,
          expected_output: (question.expectedOutput || "").trim(),
          test_cases: question.testCases || [],
          vivas: question.vivas || [],
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return mapQuestion(data);
    },
    () =>
      fetch(`${API_BASE_URL}/questions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(question),
      }),
    () => {
      const all = lsQuestions();
      const idx = all.findIndex((q) => q.id.toString() === id.toString());
      if (idx === -1) throw new Error("Question not found");
      all[idx] = { ...all[idx], ...question };
      lsSaveQuestions(all);
      return all[idx];
    },
  );
}

export async function deleteQuestion(
  id: number | string,
): Promise<{ message: string }> {
  return run(
    async () => {
      const { error } = await supabase!.from("questions").delete().eq("id", id);
      if (error) throw error;
      return { message: "Question deleted successfully" };
    },
    () => fetch(`${API_BASE_URL}/questions/${id}`, { method: "DELETE" }),
    () => {
      lsSaveQuestions(
        lsQuestions().filter((q) => q.id.toString() !== id.toString()),
      );
      return { message: "Question deleted successfully" };
    },
  );
}

// ════════════════════════════════════════════════════════════════════════════════
//  ASSIGNMENT APIs
// ════════════════════════════════════════════════════════════════════════════════

export async function getAssignedQuestion(
  registerNumber: string,
): Promise<any> {
  // Supabase path
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase!
        .from("assigned_questions")
        .select("id, question_id, questions(*)")
        .eq("student_register_number", registerNumber.trim())
        .single();
      if (error) {
        if (error.code === "PGRST116") return null; // no rows
        throw error;
      }
      const q = (data as any).questions;
      return {
        assignmentId: data.id,
        questionId: data.question_id,
        title: q.title,
        description: q.description,
        difficulty: q.difficulty,
        language: q.language,
        expectedOutput: q.expected_output,
        testCases:
          typeof q.test_cases === "string"
            ? JSON.parse(q.test_cases)
            : (q.test_cases ?? []),
        vivas:
          typeof q.vivas === "string" ? JSON.parse(q.vivas) : (q.vivas ?? []),
      };
    } catch (e) {
      console.warn("[Supabase] getAssignedQuestion failed:", e);
    }
  }

  // localStorage path
  const a = lsAssignments().find(
    (a) =>
      a.registerNumber.trim().toLowerCase() ===
      registerNumber.trim().toLowerCase(),
  );
  if (!a) return null;
  const q = lsQuestions().find(
    (q) => q.id.toString() === a.questionId.toString(),
  );
  if (!q) return null;
  return {
    assignmentId: Date.now(),
    questionId: q.id,
    title: q.title,
    description: q.description,
    difficulty: q.difficulty,
    language: q.language,
    expectedOutput: q.expectedOutput,
    testCases: q.testCases,
    vivas: q.vivas,
  };
}

export async function assignQuestion(
  registerNumber: string,
  questionId: number | string,
): Promise<any> {
  return run(
    async () => {
      const { data, error } = await supabase!
        .from("assigned_questions")
        .insert({
          student_register_number: registerNumber.trim(),
          question_id: questionId,
        })
        .select()
        .single();
      if (error) {
        if (error.code === "23505")
          throw new Error("Student already has a question assigned");
        throw error;
      }
      return { id: data.id, registerNumber: registerNumber.trim(), questionId };
    },
    () =>
      fetch(`${API_BASE_URL}/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registerNumber, questionId }),
      }),
    () => {
      const all = lsAssignments();
      // Remove any existing assignment for this student to allow overwriting
      const filtered = all.filter(
        (a) =>
          a.registerNumber.toLowerCase() !==
          registerNumber.trim().toLowerCase(),
      );
      filtered.push({ registerNumber: registerNumber.trim(), questionId });
      lsSaveAssignments(filtered);
      return {
        id: Date.now(),
        registerNumber: registerNumber.trim(),
        questionId,
      };
    },
  );
}

export async function autoAssignRandomQuestion(
  registerNumber: string,
): Promise<any> {
  // Check if already assigned
  const existing = await getAssignedQuestion(registerNumber);
  if (existing) {
    return {
      id: existing.assignmentId,
      registerNumber,
      questionId: existing.questionId,
    };
  }

  const allQs = await getQuestions();
  if (allQs.length === 0) return null; // Or return instead of throw error, so login doesn't fail

  const randomQ = allQs[Math.floor(Math.random() * allQs.length)];

  return run(
    async () => {
      // 1. Delete existing assignment (just in case)
      await supabase!
        .from("assigned_questions")
        .delete()
        .eq("student_register_number", registerNumber.trim());
      // 2. Insert new
      const { data, error } = await supabase!
        .from("assigned_questions")
        .insert({
          student_register_number: registerNumber.trim(),
          question_id: randomQ.id,
        })
        .select()
        .single();
      if (error) throw error;
      return {
        id: data.id,
        registerNumber: registerNumber.trim(),
        questionId: randomQ.id,
      };
    },
    () => Promise.reject("Not implemented via REST"),
    () => {
      let all = lsAssignments();
      all = all.filter(
        (a) =>
          a.registerNumber.toLowerCase() !==
          registerNumber.trim().toLowerCase(),
      );
      all.push({
        registerNumber: registerNumber.trim(),
        questionId: randomQ.id,
      });
      lsSaveAssignments(all);
      return {
        id: Date.now(),
        registerNumber: registerNumber.trim(),
        questionId: randomQ.id,
      };
    },
  );
}

// ════════════════════════════════════════════════════════════════════════════════
//  EXAM RESULTS APIs
// ════════════════════════════════════════════════════════════════════════════════

function mapResult(r: any): ExamResult {
  return {
    id: r.id,
    student: {
      name: r.student_name,
      registerNumber: r.student_register_number,
      department: r.student_department,
      leetCodeUsername: r.student_leetcode_username,
    },
    question: r.question,
    programmingMarks: r.programming_marks,
    mcqMarks: r.mcq_marks,
    observationMarks: r.observation_marks || 0,
    totalMarks: r.total_marks,
    maxMarks: r.max_marks,
    code: r.code,
    codeOutput: r.code_output,
    outputMatches: r.output_matches,
    mcqAnswers:
      typeof r.mcq_answers === "string"
        ? JSON.parse(r.mcq_answers)
        : (r.mcq_answers ?? {}),
    timeSpent: r.time_spent,
    malpractice: r.malpractice,
    malpracticeReason: r.malpractice_reason,
    submittedAt: r.submitted_at,
  };
}

export async function syncLocalExamResultsToSupabase(): Promise<void> {
  if (!supabase) return;
  const localResultsStr = localStorage.getItem("exam_results");
  if (!localResultsStr) return;

  try {
    const localResults = JSON.parse(localResultsStr);
    if (!Array.isArray(localResults) || localResults.length === 0) return;

    let syncedCount = 0;
    for (const result of localResults) {
      // Sanitize old data format before inserting
      delete result.total_marks; // generated column
      if (!result.question_id && result.question?.id) {
        result.question_id = result.question.id.toString();
      }

      const { error } = await supabase.from("exam_results").insert(result);
      if (!error) {
        syncedCount++;
      } else {
        console.warn("Failed to sync a local result:", error);
        window.alert(
          "Auto-Sync Failed for Student " +
            result.student_register_number +
            ": " +
            (error.message || JSON.stringify(error)),
        );
      }
    }

    if (syncedCount > 0) {
      // Optional: Clear local storage after syncing to prevent infinite syncs
      // However, if we clear it, offline mode might lose history.
      // For now, we clear the synced ones.
      localStorage.removeItem("exam_results");
      console.log(
        `Successfully synced ${syncedCount} offline exam results to Supabase!`,
      );
    }
  } catch (err) {
    console.error("Error syncing local exam results:", err);
  }
}

export async function submitExamResult(
  result: Omit<ExamResult, "id" | "submittedAt">,
): Promise<{ id: number; success: boolean }> {
  const row = {
    student_register_number: result.student.registerNumber,
    student_name: result.student.name,
    student_department: result.student.department || "Unknown",
    student_leetcode_username: result.student.leetCodeUsername || null,
    question_id: result.questionId ? result.questionId.toString() : "0",
    question: result.question,
    programming_marks: result.programmingMarks || 0,
    mcq_marks: result.mcqMarks || 0,
    observation_marks: result.observationMarks || 0,
    max_marks: result.maxMarks || 50,
    code: result.code || "",
    code_output: result.codeOutput || "",
    output_matches: result.outputMatches,
    mcq_answers: result.mcqAnswers || {},
    time_spent: result.timeSpent || 0,
    malpractice: result.malpractice,
    malpractice_reason: result.malpracticeReason || null,
    submitted_at: new Date().toISOString(),
  };

  return run(
    async () => {
      const response = await fetch("http://localhost:8085/api/exam-results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(row),
      });
      if (!response.ok) {
        throw new Error("Failed to submit to Spring Boot API");
      }
      const data = await response.json();
      return { id: data.id, success: true };
    },
    () =>
      fetch(`${API_BASE_URL}/exam-results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentRegisterNumber: result.student.registerNumber,
          studentName: result.student.name,
          studentDepartment: result.student.department,
          studentLeetCodeUsername: result.student.leetCodeUsername,
          question: result.question,
          programmingMarks: result.programmingMarks,
          mcqMarks: result.mcqMarks,
          observationMarks: result.observationMarks || 0,
          totalMarks: result.totalMarks,
          maxMarks: result.maxMarks,
          code: result.code,
          codeOutput: result.codeOutput,
          outputMatches: result.outputMatches,
          mcqAnswers: result.mcqAnswers,
          timeSpent: result.timeSpent,
          malpractice: result.malpractice,
          malpracticeReason: result.malpracticeReason,
        }),
      }),
    () => {
      const all = lsResults();
      const n: ExamResult = {
        ...result,
        id: Date.now(),
        submittedAt: new Date().toISOString(),
      };
      all.push(n);
      lsSaveResults(all);
      return { id: n.id as number, success: true };
    },
  );
}

export async function getExamResults(): Promise<ExamResult[]> {
  // Always fetch from localStorage first
  const localResults = lsResults();

  if (isSupabaseConfigured) {
    try {
      const response = await fetch("http://localhost:8085/api/exam-results");
      if (!response.ok) {
        throw new Error("Failed to fetch from Spring Boot API");
      }
      const data = await response.json();
      const remoteResults = (data ?? []).map(mapResult);

      // Merge remote and local results, using ID or timestamp to prevent exact duplicates
      // (Though IDs might be different, let's just prefer remote if there's a match,
      // but since inserts failed, remote will be empty anyway)
      const merged = [...remoteResults];

      // Add local results that aren't already in remote (by simple comparison)
      for (const local of localResults) {
        const exists = remoteResults.some(
          (r) =>
            r.student.registerNumber === local.student.registerNumber &&
            r.question === local.question &&
            r.submittedAt === local.submittedAt,
        );
        if (!exists) {
          merged.push(local);
        }
      }

      return merged.sort(
        (a, b) =>
          new Date(b.submittedAt || b.date).getTime() -
          new Date(a.submittedAt || a.date).getTime(),
      );
    } catch (e) {
      console.warn(
        "[Supabase] getExamResults exception, using localStorage only:",
        e,
      );
      return localResults;
    }
  }

  // Fallback to Express backend if configured, otherwise just local
  try {
    const res = await fetch(`${API_BASE_URL}/exam-results`);
    if (res.ok) {
      const remote = await res.json();
      return remote;
    }
  } catch (e) {
    // Ignore
  }

  return localResults;
}

export async function getExamResultsByDate(
  date: string,
): Promise<ExamResult[]> {
  return run(
    async () => {
      const { data, error } = await supabase!
        .from("exam_results")
        .select("*")
        .gte("submitted_at", `${date}T00:00:00`)
        .lt("submitted_at", `${date}T23:59:59.999`)
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapResult);
    },
    () =>
      fetch(`${API_BASE_URL}/exam-results/by-date/${encodeURIComponent(date)}`),
    () => lsResults().filter((r) => r.submittedAt?.startsWith(date)),
  );
}

export async function getStudentExamResults(
  registerNumber: string,
): Promise<ExamResult[]> {
  const localResults = lsResults().filter(
    (r) =>
      r.student.registerNumber.trim().toLowerCase() ===
      registerNumber.trim().toLowerCase(),
  );

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("exam_results")
        .select("*")
        .eq("student_register_number", registerNumber.trim())
        .order("submitted_at", { ascending: false });

      if (error) {
        console.warn("[Supabase] getStudentExamResults error:", error);
      }

      const remoteResults = (data ?? []).map(mapResult);
      const merged = [...remoteResults];

      for (const local of localResults) {
        const exists = remoteResults.some(
          (r) =>
            r.student.registerNumber === local.student.registerNumber &&
            r.question === local.question &&
            r.submittedAt === local.submittedAt,
        );
        if (!exists) {
          merged.push(local);
        }
      }

      return merged.sort(
        (a, b) =>
          new Date(b.submittedAt || b.date).getTime() -
          new Date(a.submittedAt || a.date).getTime(),
      );
    } catch (e) {
      console.warn("[Supabase] getStudentExamResults exception:", e);
      return localResults;
    }
  }

  try {
    const res = await fetch(
      `${API_BASE_URL}/exam-results/student/${encodeURIComponent(registerNumber)}`,
    );
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {}

  return localResults;
}

export async function updateExamResult(
  id: number | string,
  data: { observationMarks: number },
): Promise<{ id: number; observationMarks: number; totalMarks: number }> {
  return run(
    async () => {
      // Get existing to recalculate total
      const { data: existing, error: fetchErr } = await supabase!
        .from("exam_results")
        .select("programming_marks, mcq_marks")
        .eq("id", id)
        .single();
      if (fetchErr) throw fetchErr;
      const newTotal =
        (existing.programming_marks || 0) +
        (existing.mcq_marks || 0) +
        data.observationMarks;
      const { error } = await supabase!
        .from("exam_results")
        .update({
          observation_marks: data.observationMarks,
          total_marks: newTotal,
        })
        .eq("id", id);
      if (error) throw error;
      return {
        id: Number(id),
        observationMarks: data.observationMarks,
        totalMarks: newTotal,
      };
    },
    () =>
      fetch(`${API_BASE_URL}/exam-results/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    () => {
      const all = lsResults();
      const idx = all.findIndex((r) => r.id === Number(id));
      if (idx === -1) throw new Error("Exam result not found");
      const obs = data.observationMarks;
      const total =
        (all[idx].programmingMarks || 0) + (all[idx].mcqMarks || 0) + obs;
      all[idx] = { ...all[idx], observationMarks: obs, totalMarks: total };
      lsSaveResults(all);
      return { id: Number(id), observationMarks: obs, totalMarks: total };
    },
  );
}

export async function clearAllExamData(): Promise<{ message: string }> {
  return run(
    async () => {
      await supabase!.from("exam_results").delete().neq("id", 0);
      await supabase!.from("assigned_questions").delete().neq("id", 0);
      return { message: "Exam results and assignments cleared successfully" };
    },
    () => fetch(`${API_BASE_URL}/admin/clear-data`, { method: "POST" }),
    () => {
      lsSaveAssignments([]);
      lsSaveResults([]);
      return { message: "Exam results and assignments cleared successfully" };
    },
  );
}

export async function deleteExamResult(
  id: number | string,
): Promise<{ message: string }> {
  // Always delete from localStorage
  const all = lsResults();
  const target = all.find((r) => String(r.id) === String(id));

  // If found, also delete their assignment so they get a fresh question on retake
  if (target) {
    const regNum = target.student.registerNumber;

    // Clear local assignment
    const assigns = lsAssignments();
    lsSaveAssignments(
      assigns.filter(
        (a) =>
          a.registerNumber.trim().toLowerCase() !== regNum.trim().toLowerCase(),
      ),
    );

    // Clear remote assignment
    if (isSupabaseConfigured && supabase) {
      supabase
        .from("assigned_questions")
        .delete()
        .eq("student_register_number", regNum)
        .then(({ error }) => {
          if (error)
            console.warn("[Supabase] Assignment delete failed:", error);
        });
    }
  }

  lsSaveResults(all.filter((r) => String(r.id) !== String(id)));

  // Try to delete from Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("exam_results").delete().eq("id", id);
    } catch (e) {
      console.warn("[Supabase] Delete failed:", e);
    }
  }

  // Try to delete from backend API if available
  try {
    await fetch(`${API_BASE_URL}/exam-results/${id}`, { method: "DELETE" });
  } catch (e) {}

  return { message: "Exam result deleted successfully" };
}

export function logLeetCodePresence(registerNumber: string, dateStr: string) {
  const history = lsGet<Record<string, string[]>>(
    "leetcode_attendance_history",
    {},
  );
  if (!history[registerNumber]) {
    history[registerNumber] = [];
  }
  if (!history[registerNumber].includes(dateStr)) {
    history[registerNumber].push(dateStr);
    lsSet("leetcode_attendance_history", history);
  }
}

export function getLeetCodeAttendanceMap(): Record<string, Set<string>> {
  const map: Record<string, Set<string>> = {};
  const history = lsGet<Record<string, string[]>>(
    "leetcode_attendance_history",
    {},
  );
  for (const [regNum, dates] of Object.entries(history)) {
    for (const d of dates) {
      if (!map[d]) map[d] = new Set();
      map[d].add(regNum);
    }
  }
  return map;
}

// ─── Global Settings (Supabase) ────────────────────────────────────────────────

export async function getGlobalSetting(
  id: string,
  defaultValue: string,
): Promise<string> {
  try {
    const { data, error } = await supabase
      .from("global_settings")
      .select("value")
      .eq("id", id)
      .single();
    if (error || !data) return defaultValue;
    return data.value;
  } catch {
    return defaultValue;
  }
}

export async function setGlobalSetting(
  id: string,
  value: string,
): Promise<void> {
  try {
    await supabase
      .from("global_settings")
      .upsert({ id, value }, { onConflict: "id" });
  } catch (err) {
    console.error("Failed to save global setting", err);
  }
}

// --- ONE TIME SCRIPT TO CLEAR IDHAYA'S ATTEMPTS AS REQUESTED ---
if (typeof window !== "undefined") {
  setTimeout(() => {
    try {
      // Clear exam results
      const results = JSON.parse(localStorage.getItem("exam_results") || "[]");
      const filtered = results.filter((r: any) => {
        const reg = (r.student?.registerNumber || "").trim().toUpperCase();
        return !reg.includes("E23AI011");
      });
      if (results.length !== filtered.length) {
        localStorage.setItem("exam_results", JSON.stringify(filtered));
        console.log(
          "Successfully cleared Idhaya's attempts from local storage!",
        );
      }

      // Clear question assignment
      const assigns = JSON.parse(
        localStorage.getItem("assigned_questions") || "[]",
      );
      const filteredAssigns = assigns.filter((a: any) => {
        const reg = (a.registerNumber || "").trim().toUpperCase();
        return !reg.includes("E23AI011");
      });
      if (assigns.length !== filteredAssigns.length) {
        localStorage.setItem(
          "assigned_questions",
          JSON.stringify(filteredAssigns),
        );
        console.log(
          "Successfully cleared Idhaya's assignment from local storage!",
        );
      }

      // Also attempt to delete from Supabase if configured
      if (isSupabaseConfigured && supabase) {
        supabase
          .from("exam_results")
          .delete()
          .eq("student_register_number", "E23AI011")
          .then(({ error }) => {
            if (!error) console.log("Cleared from Supabase as well");
          });
      }
    } catch (e) {
      console.error(e);
    }
  }, 1000);
}

export async function seedDefaultQuestions(): Promise<Question[]> {
  if (isSupabaseConfigured) {
    // Delete existing rows
    const { error: delError } = await supabase!
      .from("questions")
      .delete()
      .neq("id", "0");
    if (delError) {
      throw new Error(
        `Supabase Delete Error: ${delError.message} (Please check your RLS policies to allow DELETE on the "questions" table)`,
      );
    }

    // Insert 100 questions in chunks of 20 to prevent payload size issues
    const chunkSize = 20;
    const allInserted: Question[] = [];

    for (let i = 0; i < defaultQuestions.length; i += chunkSize) {
      const chunk = defaultQuestions.slice(i, i + chunkSize);
      const { data, error } = await supabase!
        .from("questions")
        .insert(
          chunk.map((q) => ({
            title: q.title,
            description: q.description,
            difficulty: q.difficulty,
            language: q.language,
            expected_output: q.expectedOutput,
            test_cases: q.testCases,
            vivas: q.vivas,
          })),
        )
        .select();

      if (error) {
        throw new Error(
          `Supabase Insert Error: ${error.message} (Please check your RLS policies to allow INSERT on the "questions" table)`,
        );
      }
      if (data) {
        allInserted.push(...data.map(mapQuestion));
      }
    }
    return allInserted;
  }

  return defaultQuestions;
}

let hasCheckedDefaultQuestions = false;

export async function ensureDefaultQuestionsSeeded(): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    const { data, error } = await supabase!.from("questions").select("title");
    if (error) throw error;

    const existingTitles = new Set(
      (data ?? []).map((q) => q.title.toLowerCase().trim()),
    );
    const missingQuestions = defaultQuestions.filter(
      (q) => !existingTitles.has(q.title.toLowerCase().trim()),
    );

    if (missingQuestions.length > 0) {
      console.log(
        `[Auto-Seed] Inserting ${missingQuestions.length} missing default questions to Supabase...`,
      );
      const chunkSize = 20;
      for (let i = 0; i < missingQuestions.length; i += chunkSize) {
        const chunk = missingQuestions.slice(i, i + chunkSize);
        const { error: insertError } = await supabase!.from("questions").insert(
          chunk.map((q) => ({
            title: q.title,
            description: q.description,
            difficulty: q.difficulty,
            language: q.language,
            expected_output: q.expectedOutput,
            test_cases: q.testCases,
            vivas: q.vivas,
          })),
        );
        if (insertError) {
          console.warn(
            "[Auto-Seed] Failed to insert missing questions chunk:",
            insertError,
          );
        }
      }
    }
  } catch (e) {
    console.error("[Auto-Seed] Error checking/seeding default questions:", e);
  }
}

// ─── Student Dashboard API ──────────────────────────────────────────────────
export async function fetchStudentDashboardData(registerNumber: string) {
  const res = await fetch(`${API_BASE_URL}/student/dashboard/${registerNumber}`);
  return handleResponse(res);
}

export async function updateMobileNumber(registerNumber: string, mobileNumber: string) {
  const res = await fetch(`${API_BASE_URL}/student/profile/${registerNumber}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobileNumber }),
  });
  return handleResponse(res);
}

// ─── Staff Student Assignment Module API ──────────────────────────────────────

let cachedStaffs: any[] | null = null;
let lastStaffsFetchTime = 0;

export async function getStaffs(forceRefresh = false): Promise<any[]> {
  const now = Date.now();
  if (!forceRefresh && cachedStaffs && (now - lastStaffsFetchTime < CACHE_TTL)) {
    return cachedStaffs;
  }
  
  const res = await run(
    async () => { throw new Error("Supabase implementation not ready"); },
    () => fetch(`${API_BASE_URL}/staff/all`),
    () => {
      // Mock staffs
      return [
        { staffId: "STF-001", name: "Dr. Arun Kumar", department: "Computer Science" },
        { staffId: "STF-002", name: "Prof. Sarah", department: "Information Technology" },
      ];
    }
  );
  
  cachedStaffs = res;
  lastStaffsFetchTime = now;
  return res;
}

let cachedAssignments: StaffStudentAssignment[] | null = null;
let lastAssignmentsFetchTime = 0;

export async function getStaffDashboardMetrics(staffId: string) {
  const res = await fetch(`${API_BASE_URL}/staff/dashboard/${staffId}`);
  if (!res.ok) throw new Error("Failed to fetch dashboard metrics");
  return await res.json();
}

export async function getStaffStudentsDetails(staffId: string) {
  const res = await fetch(`${API_BASE_URL}/staff/students/${staffId}`);
  if (!res.ok) throw new Error("Failed to fetch student details");
  return await res.json();
}

export async function getStaffAssignments(forceRefresh = false): Promise<StaffStudentAssignment[]> {
  const now = Date.now();
  if (!forceRefresh && cachedAssignments && (now - lastAssignmentsFetchTime < CACHE_TTL)) {
    return cachedAssignments;
  }
  
  const res = await run(
    async () => { throw new Error("Supabase implementation not ready"); },
    () => fetch(`${API_BASE_URL}/staff/assignments`),
    () => lsStaffAssignments()
  );
  
  cachedAssignments = res;
  lastAssignmentsFetchTime = now;
  return res;
}

let cachedHistory: AssignmentHistoryRecord[] | null = null;
let lastHistoryFetchTime = 0;

export async function getAssignmentHistory(forceRefresh = false): Promise<AssignmentHistoryRecord[]> {
  const now = Date.now();
  if (!forceRefresh && cachedHistory && (now - lastHistoryFetchTime < CACHE_TTL)) {
    return cachedHistory;
  }
  
  const res = await run(
    async () => { throw new Error("Supabase implementation not ready"); },
    () => fetch(`${API_BASE_URL}/staff/assignment_history`),
    () => lsAssignmentsHistory()
  );
  
  cachedHistory = res;
  lastHistoryFetchTime = now;
  return res;
}

export async function assignStudentsToStaff(
  staffId: string, 
  registerNumbers: string[], 
  adminName: string
): Promise<{ success: boolean; message?: string }> {
  return run(
    async () => { throw new Error("Supabase implementation not ready"); },
    () => fetch(`${API_BASE_URL}/staff/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ staffId, studentRegisterNumbers: registerNumbers, adminName })
    }).then(async res => {
      // Invalidate caches
      cachedAssignments = null;
      cachedHistory = null;
      return res;
    }),
    () => {
      const assignments = lsStaffAssignments();
      const history = lsAssignmentsHistory();
      const students = lsStudents();
      
      for (const regNo of registerNumbers) {
        const student = students.find(s => s.registerNumber === regNo);
        if (!student) continue;

        const existingIdx = assignments.findIndex(a => a.studentRegisterNumber === regNo);
        let prevStaff = null;
        if (existingIdx >= 0) {
          prevStaff = assignments[existingIdx].staffId;
          assignments.splice(existingIdx, 1);
        }

        assignments.push({
          staffId,
          studentRegisterNumber: regNo,
          assignedAt: new Date().toISOString()
        });

        history.push({
          id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
          registerNumber: regNo,
          studentName: student.name,
          previousStaff: prevStaff,
          newStaff: staffId,
          assignedBy: adminName,
          assignedAt: new Date().toISOString()
        });
      }
      lsSaveStaffAssignments(assignments);
      lsSaveAssignmentsHistory(history);
      return { success: true };
    }
  );
}

export async function removeStudentAssignment(
  registerNumber: string,
  adminName: string
): Promise<{ success: boolean }> {
  return run(
    async () => { throw new Error("Supabase implementation not ready"); },
    () => fetch(`${API_BASE_URL}/staff/assignments/${registerNumber}`, { method: "DELETE" }).then(async res => {
      cachedAssignments = null;
      cachedHistory = null;
      return res;
    }),
    () => {
      const assignments = lsStaffAssignments();
      const history = lsAssignmentsHistory();
      const students = lsStudents();
      
      const existingIdx = assignments.findIndex(a => a.studentRegisterNumber === registerNumber);
      if (existingIdx >= 0) {
        const prevStaff = assignments[existingIdx].staffId;
        assignments.splice(existingIdx, 1);
        
        const student = students.find(s => s.registerNumber === registerNumber);
        if (student) {
          history.push({
            id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
            registerNumber,
            studentName: student.name,
            previousStaff: prevStaff,
            newStaff: "UNASSIGNED",
            assignedBy: adminName,
            assignedAt: new Date().toISOString()
          });
        }
      }
      lsSaveStaffAssignments(assignments);
      lsSaveAssignmentsHistory(history);
      return { success: true };
    }
  );
}

// --------------------------------------------------------------------------------
//  NOTIFICATIONS & MESSAGING API
// --------------------------------------------------------------------------------

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export async function sendNotification(userId: string, title: string, message: string): Promise<AppNotification> {
  return run(
    async () => {
      const { data, error } = await supabase!.from("Notification").insert({ userId, title, message }).select().single();
      if (error) throw error;
      return data;
    },
    () => fetch(`${API_BASE_URL}/notifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, title, message })
    }),
    () => {
      const all = lsGet<AppNotification[]>("exam_portal_notifications", []);
      const n: AppNotification = { id: Date.now().toString(), userId, title, message, isRead: false, createdAt: new Date().toISOString() };
      all.push(n);
      lsSet("exam_portal_notifications", all);
      return n;
    }
  );
}

export async function getDashboardOverview(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/dashboard/overview`);
    if (!res.ok) throw new Error("Failed to fetch dashboard overview");
    return await res.json();
  } catch (e: any) {
    console.error("Dashboard overview error:", e.message);
    throw e;
  }
}

export async function getAnalytics(department: string, year: string, section: string = 'All'): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/analytics?department=${encodeURIComponent(department)}&year=${encodeURIComponent(year)}&section=${encodeURIComponent(section)}`);
    if (!res.ok) throw new Error("Failed to fetch analytics");
    return await res.json();
  } catch (e: any) {
    console.error("Analytics fetch error:", e.message);
    throw e;
  }
}

export async function getNotifications(userId: string): Promise<AppNotification[]> {
  try {
    let backendData: AppNotification[] = [];
    if (isSupabaseConfigured) {
      const { data, error } = await supabase!.from("Notification").select("*").eq("userId", userId).order("createdAt", { ascending: false });
      if (error) throw error;
      backendData = data;
    } else {
      const res = await fetch(`${API_BASE_URL}/notifications/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch from backend");
      backendData = await res.json();
    }
    
    // Merge with local storage in case some were created while offline
    const allLs = lsGet<AppNotification[]>("exam_portal_notifications", []);
    const lsNotifs = allLs.filter(n => n.userId === userId);
    const merged = [...backendData];
    const backendIds = new Set(backendData.map((n: any) => n.id));
    for (const n of lsNotifs) {
      if (!backendIds.has(n.id)) {
        merged.push(n);
      }
    }
    return merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (e: any) {
    console.warn("API failed, falling back to local storage:", e.message);
    const allLs = lsGet<AppNotification[]>("exam_portal_notifications", []);
    return allLs.filter(n => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export async function markNotificationRead(id: string): Promise<void> {
  return run(
    async () => {
      const { error } = await supabase!.from("Notification").update({ isRead: true }).eq("id", id);
      if (error) throw error;
    },
    () => fetch(`${API_BASE_URL}/notifications/${id}/read`, { method: "PUT" }),
    () => {
      const all = lsGet<AppNotification[]>("exam_portal_notifications", []);
      const idx = all.findIndex(n => n.id === id);
      if (idx !== -1) {
        all[idx].isRead = true;
        lsSet("exam_portal_notifications", all);
      }
    }
  );
}

export async function getAssignedStaffForStudent(registerNumber: string): Promise<any> {
  return run(
    async () => {
      const { data, error } = await supabase!.from("StaffStudentAssignment").select("staff(*)").eq("studentRegisterNumber", registerNumber).single();
      if (error || !data) return null;
      return data.staff;
    },
    () => fetch(`${API_BASE_URL}/students/${registerNumber}/staff`),
    () => {
      const assignments = lsStaffAssignments();
      const a = assignments.find(x => x.studentRegisterNumber === registerNumber);
      if (!a) return null;
      const staffList = lsGet<any[]>("sscet_staff", []);
      return staffList.find(s => s.staffId === a.staffId) || null;
    }
  );
}

// --- Tasks ---

export interface TaskAssignmentData {
  id: string;
  studentRegisterNumber: string;
  taskId: string;
  status: string;
  assignedAt: string;
  completedAt?: string;
  task: any;
  student?: any;
}

export async function getStudentTasks(registerNumber: string): Promise<TaskAssignmentData[]> {
  const res = await fetch(`${API_BASE_URL}/tasks/student/${registerNumber}`);
  if (!res.ok) throw new Error("Failed to fetch student tasks");
  return res.json();
}

export async function getStaffTasks(staffId: string): Promise<any[]> {
  const res = await fetch(`${API_BASE_URL}/tasks/staff/${staffId}`);
  if (!res.ok) throw new Error("Failed to fetch staff tasks");
  return res.json();
}

export async function getAllTasks(): Promise<any[]> {
  const res = await fetch(`${API_BASE_URL}/tasks`);
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
}

export async function createTask(taskData: any): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskData)
  });
  if (!res.ok) throw new Error("Failed to create task");
  return res.json();
}

export async function updateTask(taskId: string, taskData: any): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskData)
  });
  if (!res.ok) throw new Error("Failed to update task");
  return res.json();
}

export async function deleteTask(taskId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete task");
}

export async function syncLeetCodeTaskProgress(registerNumber: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/tasks/sync/${registerNumber}`, { method: "POST" });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to sync tasks");
  }
  return res.json();
}

