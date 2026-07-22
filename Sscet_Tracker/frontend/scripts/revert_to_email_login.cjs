const fs = require('fs');

// 1. Revert api.ts to use email
const apiPath = 'c:/Users/idhay/Downloads/Leetcode_Tracker/Sscet_Tracker/frontend/src/app/services/api.ts';
let apiContent = fs.readFileSync(apiPath, 'utf8');

const currentLoginFunc = `export async function loginStudent(
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

if (apiContent.includes('export async function loginStudent(\n  registerNumber: string,')) {
  apiContent = apiContent.replace(currentLoginFunc, oldLoginFunc);
  apiContent = apiContent.replace(/"Register number not found. Please register first."/g, '"Email not found. Please register first."');
  fs.writeFileSync(apiPath, apiContent);
}

// 2. Update LoginPage.tsx to use Email instead of Register Number
const loginPath = 'c:/Users/idhay/Downloads/Leetcode_Tracker/Sscet_Tracker/frontend/src/app/components/LoginPage.tsx';
let loginContent = fs.readFileSync(loginPath, 'utf8');

// Change state variable naming in LoginPage
loginContent = loginContent.replace(
  /const \[loginRegNo, setLoginRegNo\] = useState\(""\);/g,
  `const [loginEmail, setLoginEmail] = useState("");`
);

loginContent = loginContent.replace(
  /if \(!loginRegNo\.trim\(\) \|\| !loginPassword\) return setError\("Please fill in all fields\."\);/g,
  `if (!loginEmail.trim() || !loginPassword) return setError("Please fill in all fields.");`
);

loginContent = loginContent.replace(
  /const student = await loginStudent\(loginRegNo\.trim\(\)\.toUpperCase\(\), loginPassword\);/g,
  `const student = await loginStudent(loginEmail.trim(), loginPassword);`
);

// Update UI in LoginPage
loginContent = loginContent.replace(
  /<label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">\s*REGISTER NUMBER\s*<\/label>/,
  `<label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">EMAIL ADDRESS</label>`
);

loginContent = loginContent.replace(
  /<Hash className="absolute left-4 top-1\/2 -translate-y-1\/2 w-4 h-4 text-blue-500" \/>\s*<input\s*type="text"\s*value=\{loginRegNo\}\s*onChange=\{\(e\) => setLoginRegNo\(e\.target\.value\.toUpperCase\(\)\)\}\s*placeholder="e\.g\. E23AI011"\s*className=\{inputCls\}\s*\/>/,
  `<Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                          <input 
                            type="email" 
                            value={loginEmail} 
                            onChange={(e) => setLoginEmail(e.target.value)} 
                            placeholder="e.g. student@college.edu" 
                            className={inputCls} 
                          />`
);

fs.writeFileSync(loginPath, loginContent);
console.log("Reverted to Email Login");
