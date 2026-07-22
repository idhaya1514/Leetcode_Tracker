const fs = require('fs');

const path = 'c:/Users/idhay/Downloads/Leetcode_Tracker/Sscet_Tracker/frontend/src/app/components/StudentManagement.tsx';
const originalContent = fs.readFileSync(path, 'utf8');

let newContent = originalContent.replace(
  /className="max-w-7xl mx-auto space-y-6"/g,
  'className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-500"'
);

newContent = newContent.replace(
  /className="bg-white\/80 backdrop-blur-xl rounded-2xl border border-white\/50 shadow-\[0_8px_30px_rgb\(0,0,0,0\.04\)\] p-4"/g,
  'className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2"'
);

newContent = newContent.replace(
  /className="flex items-center gap-4"/g,
  'className=""'
);

// Replace button for Back
newContent = newContent.replace(
  /<button onClick=\{onBack\} className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors">.*?<\/button>/s,
  ''
);

// Replace Header text
newContent = newContent.replace(
  /<h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">.*?<\/h1>/s,
  '<h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Student Management</h1>'
);

newContent = newContent.replace(
  /<p className="text-sm text-slate-500">Manage student records and LeetCode integrations.<\/p>/,
  '<p className="text-slate-500 text-sm mt-1">Manage student records, credentials, and LeetCode mapping.</p>'
);

// Search Bar and Add Button Container
newContent = newContent.replace(
  /className="flex items-center gap-3"/,
  'className="flex items-center gap-3"'
);

// Add button
newContent = newContent.replace(
  /<button\s+onClick=\{[^}]+\}\s+className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95">.*?<\/button>/s,
  '<button onClick={() => { setIsAdding(true); setEditingId(null); setFormData({name: "", registerNumber: "", department: DEPARTMENTS[0], academicYear: ACADEMIC_YEARS[0], email: "", leetCodeUrl: "", leetCodeUsername: "", password: "", confirmPassword: ""}); }} className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Add Student</button>'
);

// Search input wrapper
newContent = newContent.replace(
  /<div className="relative">\s*<Search className="absolute left-3 top-1\/2 -translate-y-1\/2 w-4 h-4 text-slate-400" \/>\s*<input[^>]+>\s*<\/div>/,
  '<div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="text" placeholder="Search students..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 pr-4 py-2 bg-white border border-slate-200/60 text-slate-600 text-sm rounded-lg outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-100 transition-all w-64 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] placeholder:text-slate-400" /></div>'
);

// Table Container
newContent = newContent.replace(
  /<div className="bg-white\/80 backdrop-blur-xl rounded-2xl border border-white\/50 shadow-\[0_8px_30px_rgb\(0,0,0,0\.04\)\] overflow-hidden">/g,
  '<div className="bg-white rounded-xl border border-slate-200/60 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] overflow-hidden">'
);

// Table Header
newContent = newContent.replace(
  /<thead className="bg-slate-50 border-b border-slate-100">/g,
  '<thead className="bg-slate-50/80 border-b border-slate-200/60">'
);

newContent = newContent.replace(
  /className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider"/g,
  'className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider"'
);

// Table Rows
newContent = newContent.replace(
  /className="border-b border-slate-50 hover:bg-slate-50\/50 transition-colors group"/g,
  'className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"'
);

newContent = newContent.replace(
  /className="px-6 py-4 whitespace-nowrap"/g,
  'className="px-5 py-3 whitespace-nowrap"'
);

// Edit/Delete Buttons in Table
newContent = newContent.replace(
  /<button onClick=\{[^}]+\} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">/g,
  '<button onClick={() => {}} className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors">'
);

newContent = newContent.replace(
  /<button onClick=\{[^}]+\} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">/g,
  '<button onClick={() => {}} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors">'
);

// Modal container
newContent = newContent.replace(
  /<div className="fixed inset-0 bg-slate-900\/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">/g,
  '<div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">'
);

newContent = newContent.replace(
  /<div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-\[90vh\]">/g,
  '<div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">'
);

newContent = newContent.replace(
  /<div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50\/50">/g,
  '<div className="px-6 py-4 border-b border-slate-200/60 flex items-center justify-between bg-white">'
);

fs.writeFileSync(path, newContent);
console.log("Updated StudentManagement.tsx");
