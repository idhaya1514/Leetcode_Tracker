const fs = require('fs');

const path = 'c:/Users/idhay/Downloads/Leetcode_Tracker/Sscet_Tracker/frontend/src/app/components/StaffManagement.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace top level containers
content = content.replace(
  /className="max-w-7xl mx-auto space-y-6"/g,
  'className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-500"'
);

// Replace main container
content = content.replace(
  /className="bg-white\/80 backdrop-blur-xl rounded-2xl border border-white\/50 shadow-\[0_8px_30px_rgb\(0,0,0,0\.04\)\] p-4 md:p-6"/g,
  'className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all duration-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]"'
);

content = content.replace(
  /className="bg-white\/80 backdrop-blur-xl rounded-2xl border border-white\/50 shadow-\[0_8px_30px_rgb\(0,0,0,0\.04\)\] overflow-hidden"/g,
  'className="bg-white rounded-xl border border-slate-200/60 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] overflow-hidden"'
);

// Title styling
content = content.replace(
  /<h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">/g,
  '<h1 className="text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">'
);
content = content.replace(
  /<p className="text-sm text-slate-500">Manage staff members/g,
  '<p className="text-slate-500 text-sm mt-1">Manage staff members'
);

// Tabs
content = content.replace(
  /className="flex flex-wrap gap-2"/g,
  'className="flex flex-wrap gap-2 p-1 bg-slate-50 rounded-lg border border-slate-200 inline-flex"'
);

content = content.replace(
  /`flex items-center gap-2 px-4 py-2\.5 rounded-xl font-semibold text-sm transition-all \${.*?}`/g,
  "`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === tabValue ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'}`"
);

// Replace generic primary buttons
content = content.replace(
  /className="px-6 py-2\.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl/g,
  'className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg shadow-sm'
);

content = content.replace(
  /className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl/g,
  'className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg shadow-sm'
);

// Inputs
content = content.replace(
  /className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl/g,
  'className="w-full px-4 py-2 bg-white border border-slate-200/60 rounded-lg'
);
content = content.replace(
  /className="w-full px-4 py-3 pl-11 bg-slate-50 border border-slate-200 rounded-xl/g,
  'className="w-full px-4 py-2 pl-10 bg-white border border-slate-200/60 rounded-lg shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] text-sm outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-100"'
);

// Search
content = content.replace(
  /className="pl-11 pr-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl/g,
  'className="pl-10 pr-4 py-2 bg-white border border-slate-200/60 text-slate-600 rounded-lg text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-100"'
);

// Tables
content = content.replace(
  /<thead className="bg-slate-50 border-b border-slate-100">/g,
  '<thead className="bg-slate-50/80 border-b border-slate-200/60">'
);
content = content.replace(
  /className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider"/g,
  'className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider"'
);
content = content.replace(
  /className="border-b border-slate-50 hover:bg-slate-50\/50 transition-colors"/g,
  'className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"'
);
content = content.replace(
  /className="px-6 py-4 whitespace-nowrap"/g,
  'className="px-5 py-3 whitespace-nowrap"'
);

// Inner form containers
content = content.replace(
  /className="max-w-md mx-auto space-y-4"/g,
  'className="max-w-md space-y-4"'
);

fs.writeFileSync(path, content);
console.log("Updated StaffManagement.tsx!");
