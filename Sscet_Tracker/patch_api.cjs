const fs = require('fs');
const path = require('path');

const apiPath = path.join(__dirname, 'frontend', 'src', 'app', 'services', 'api.ts');
let content = fs.readFileSync(apiPath, 'utf8');

// Replace getStudents
content = content.replace(
  /export async function getStudents\(\): Promise<Student\[\]> \{[\s\S]*?^export async function getStudent\(/m,
  "export async function getStudents(): Promise<Student[]> {\\n" +
  "  try {\\n" +
  "    const res = await fetch('http://localhost:3000/api/students');\\n" +
  "    if (!res.ok) throw new Error('Failed to fetch');\\n" +
  "    return await res.json();\\n" +
  "  } catch (err) {\\n" +
  "    console.error('PostgreSQL API getStudents Error:', err);\\n" +
  "    return [];\\n" +
  "  }\\n" +
  "}\\n\\n" +
  "export async function getStudent("
);

// Replace loginStudent
content = content.replace(
  /export async function loginStudent\([\s\S]*?^export async function requestPasswordResetOTP\(/m,
  "export async function loginStudent(registerNumber: string, password?: string): Promise<{ success: boolean; data?: Student; error?: string }> {\\n" +
  "  try {\\n" +
  "    const res = await fetch('http://localhost:3000/api/auth/login', {\\n" +
  "      method: 'POST',\\n" +
  "      headers: { 'Content-Type': 'application/json' },\\n" +
  "      body: JSON.stringify({ email: registerNumber, password, role: 'student' })\\n" +
  "    });\\n" +
  "    const json = await res.json();\\n" +
  "    if (res.ok && json.token) {\\n" +
  "      return { success: true, data: json.user as Student };\\n" +
  "    }\\n" +
  "    return { success: false, error: json.error || 'Login failed' };\\n" +
  "  } catch (error: any) {\\n" +
  "    return { success: false, error: error.message };\\n" +
  "  }\\n" +
  "}\\n\\n" +
  "export async function requestPasswordResetOTP("
);

fs.writeFileSync(apiPath, content);
console.log("Patched api.ts for getStudents and loginStudent to use PostgreSQL!");
