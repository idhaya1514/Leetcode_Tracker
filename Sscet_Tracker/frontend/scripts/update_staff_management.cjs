const fs = require('fs');
const path = 'c:/Users/idhay/Downloads/Leetcode_Tracker/Sscet_Tracker/frontend/src/app/components/StaffManagement.tsx';

let content = fs.readFileSync(path, 'utf8');

// 1. Add Mail and Briefcase imports if not present
if (!content.includes('Mail,')) {
  content = content.replace(/Type, IdCard, X/g, 'Type, IdCard, X, Mail, Briefcase');
}

// 2. Add state variables
content = content.replace(
  /const \[newPassword, setNewPassword\] = useState\(""\);/,
  `const [newPassword, setNewPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newDepartment, setNewDepartment] = useState("");`
);

// 3. Update handleCreateStaff
content = content.replace(
  /body: JSON\.stringify\(\{ staffId: newStaffId, name: newName, password: newPassword \}\),/,
  `body: JSON.stringify({ staffId: newStaffId, name: newName, email: newEmail, department: newDepartment, password: newPassword }),`
);

content = content.replace(
  /setNewStaffId\(""\); setNewName\(""\); setNewPassword\(""\);/,
  `setNewStaffId(""); setNewName(""); setNewEmail(""); setNewDepartment(""); setNewPassword("");`
);

// 4. Update UI
const oldUI = `<h2 className="text-lg font-semibold text-slate-800 mb-6 border-b border-slate-100 pb-4">Register New Staff</h2>
          <form onSubmit={handleCreateStaff} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Staff ID</label>
              <input type="text" required value={newStaffId} onChange={e=>setNewStaffId(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200/60 rounded-md text-sm outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-100 shadow-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
              <input type="text" required value={newName} onChange={e=>setNewName(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200/60 rounded-md text-sm outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-100 shadow-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
              <input type="password" required value={newPassword} onChange={e=>setNewPassword(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200/60 rounded-md text-sm outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-100 shadow-sm" />
            </div>
            <div className="pt-4">
              <button type="submit" disabled={loading} className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg shadow-sm flex items-center justify-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Staff Account
              </button>
            </div>
          </form>`;

const newUI = `<div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800 tracking-tight">Register New Staff</h2>
              <p className="text-xs text-slate-500 mt-0.5">Create a new staff portal account.</p>
            </div>
          </div>
          
          <form onSubmit={handleCreateStaff} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><IdCard className="w-3.5 h-3.5" /> Staff ID</label>
                <input type="text" required value={newStaffId} onChange={e=>setNewStaffId(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium" placeholder="e.g. STF-001" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Type className="w-3.5 h-3.5" /> Full Name</label>
                <input type="text" required value={newName} onChange={e=>setNewName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium" placeholder="Enter full name" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email Address</label>
                <input type="email" required value={newEmail} onChange={e=>setNewEmail(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium" placeholder="staff@college.edu" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> Department</label>
                <select required value={newDepartment} onChange={e=>setNewDepartment(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium appearance-none">
                  <option value="" disabled>Select Department</option>
                  <option value="Computer Science">Computer Science & Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="AI & Data Science">AI & Data Science</option>
                  <option value="Electronics">Electronics & Communication</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><KeyRound className="w-3.5 h-3.5" /> Password</label>
              <input type="password" required value={newPassword} onChange={e=>setNewPassword(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium" placeholder="Create a strong password" />
            </div>

            <div className="pt-2">
              <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-sm shadow-indigo-200 transition-all flex items-center justify-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Staff Account
              </button>
            </div>
          </form>`;

content = content.replace(oldUI, newUI);

// Fix the container width to fit the grid nicely
content = content.replace(
  /<div className="bg-white rounded-xl border border-slate-200\/60 p-6 shadow-\[0_2px_10px_-3px_rgba\(6,81,237,0\.05\)\] max-w-xl mx-auto">/,
  `<div className="bg-white rounded-xl border border-slate-200/60 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] max-w-2xl mx-auto">`
);

fs.writeFileSync(path, content);
console.log("Updated StaffManagement.tsx with nicer UI and new fields");
