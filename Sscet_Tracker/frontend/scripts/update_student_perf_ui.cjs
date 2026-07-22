const fs = require('fs');

const path = 'c:/Users/idhay/Downloads/Leetcode_Tracker/Sscet_Tracker/frontend/src/app/components/StudentPerformance.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace main container
content = content.replace(
  /className="max-w-7xl mx-auto space-y-6"/g,
  'className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-500"'
);

// Replace header container
content = content.replace(
  /className="bg-white\/80 backdrop-blur-xl rounded-2xl border border-white\/50 shadow-\[0_8px_30px_rgb\(0,0,0,0\.04\)\] p-4"/g,
  'className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2"'
);

content = content.replace(
  /<div className="flex items-center gap-4">\s*<button onClick=\{onBack\} className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors">\s*<ArrowLeft className="w-5 h-5" \/>\s*<\/button>/g,
  '<div className="flex items-center gap-4">'
);

// Replace title
content = content.replace(
  /<h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">\s*<BarChart2 className="w-6 h-6 text-indigo-600" \/> LeetCode Performance Analytics\s*<\/h1>/g,
  '<h1 className="text-2xl font-semibold text-slate-900 tracking-tight">LeetCode Analytics</h1>'
);
content = content.replace(
  /<p className="text-sm text-slate-500">Track engagement and consistency across departments\.<\/p>/g,
  '<p className="text-slate-500 text-sm mt-1">Track engagement and consistency across departments.</p>'
);

// Filters container
content = content.replace(
  /<div className="flex items-center gap-3 bg-slate-50 p-1\.5 rounded-xl border border-slate-200">/g,
  '<div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200/60 shadow-sm">'
);

// Cards
content = content.replace(
  /className="bg-white\/80 backdrop-blur-xl rounded-2xl border border-white\/50 shadow-\[0_8px_30px_rgb\(0,0,0,0\.04\)\] p-6"/g,
  'className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all duration-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-slate-300"'
);

content = content.replace(
  /<div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">/g,
  '<div className="p-1.5 rounded-md bg-indigo-50">'
);
content = content.replace(
  /<div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">/g,
  '<div className="p-1.5 rounded-md bg-emerald-50">'
);
content = content.replace(
  /<div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">/g,
  '<div className="p-1.5 rounded-md bg-orange-50">'
);
content = content.replace(/<Users className="w-6 h-6/g, '<Users className="w-4 h-4');
content = content.replace(/<Activity className="w-6 h-6/g, '<Activity className="w-4 h-4');
content = content.replace(/<TrendingUp className="w-6 h-6/g, '<TrendingUp className="w-4 h-4');

content = content.replace(
  /<h2 className="text-3xl font-black/g,
  '<h2 className="text-2xl font-semibold tracking-tight'
);

content = content.replace(
  /<p className="text-sm font-semibold text-slate-500">/g,
  '<p className="text-[13px] font-medium text-slate-500 mb-2">'
);

// Sub container cards
content = content.replace(
  /className="bg-white\/80 backdrop-blur-xl rounded-2xl border border-white\/50 shadow-sm p-6"/g,
  'className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]"'
);
content = content.replace(
  /<h3 className="font-bold text-slate-800/g,
  '<h3 className="text-base font-semibold text-slate-800'
);

content = content.replace(
  /className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors"/g,
  'className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200/60 hover:border-slate-300 transition-colors shadow-sm mb-2"'
);

fs.writeFileSync(path, content);
console.log("Updated StudentPerformance.tsx");
