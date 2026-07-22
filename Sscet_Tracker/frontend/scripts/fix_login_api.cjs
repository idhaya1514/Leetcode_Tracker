const fs = require('fs');
const path = 'c:/Users/idhay/Downloads/Leetcode_Tracker/Sscet_Tracker/frontend/src/app/services/api.ts';

let content = fs.readFileSync(path, 'utf8');

const oldLoginFunc = `export async function loginStudent(
  email: string,
  password?: string,
): Promise<Student> {
  if (!email) throw new Error("Email is required");

  return run(
    async () => {
      if (password) {
        const { error: authError } = await supabase!.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (authError) throw new Error(authError.message);
      }

      const { data, error } = await supabase!
        .from("students")
        .select("*")
        .eq("email", email.trim().toLowerCase())
        .single();
      if (error)
        throw new Error("Email not found in database. Please register first.");

      return {
        id: data.id,
        name: data.name,
        registerNumber: data.register_number,
        email: data.email,
        password: data.password, // Keep for fallback compatibility
        department: data.department,
        leetCodeUsername: data.leet_code_username,
        createdAt: data.created_at,
      };
    },
    () => Promise.reject("Not implemented via REST"),
    () => {
      const s = lsStudents().find(
        (s) =>
          (s.email || "").trim().toLowerCase() === email.trim().toLowerCase(),
      );
      if (!s) throw new Error("Email not found. Please register first.");
      if (password && s.password && s.password !== password)
        throw new Error("Incorrect password.");
      return s;
    },
  );
}`;

const newLoginFunc = `export async function loginStudent(
  registerNumber: string,
  password?: string,
): Promise<Student> {
  if (!registerNumber) throw new Error("Register number is required");

  return run(
    async () => {
      // Find the user by register number first
      const { data, error } = await supabase!
        .from("students")
        .select("*")
        .eq("register_number", registerNumber.trim().toUpperCase())
        .single();
        
      if (error || !data)
        throw new Error("Register number not found. Please register first.");

      if (password) {
        const { error: authError } = await supabase!.auth.signInWithPassword({
          email: data.email,
          password,
        });
        if (authError) throw new Error(authError.message);
      }

      return {
        id: data.id,
        name: data.name,
        registerNumber: data.register_number,
        email: data.email,
        password: data.password, // Keep for fallback compatibility
        department: data.department,
        leetCodeUsername: data.leet_code_username,
        createdAt: data.created_at,
      };
    },
    () => Promise.reject("Not implemented via REST"),
    () => {
      const s = lsStudents().find(
        (s) =>
          (s.registerNumber || "").trim().toUpperCase() === registerNumber.trim().toUpperCase(),
      );
      if (!s) throw new Error("Register number not found. Please register first.");
      if (password && s.password && s.password !== password)
        throw new Error("Incorrect password.");
      return s;
    },
  );
}`;

if (content.includes('export async function loginStudent(')) {
  content = content.replace(oldLoginFunc, newLoginFunc);
  
  // Also, update error message fallback if regex failed
  content = content.replace(/"Email not found. Please register first."/g, '"Register number not found. Please register first."');

  fs.writeFileSync(path, content);
  console.log("Fixed login logic to use Register Number instead of Email.");
} else {
  console.log("Could not find loginStudent function.");
}
