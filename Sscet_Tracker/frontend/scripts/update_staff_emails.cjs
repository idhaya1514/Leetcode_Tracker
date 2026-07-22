const fs = require('fs');
const path = 'c:/Users/idhay/Downloads/Leetcode_Tracker/Sscet_Tracker/frontend/src/app/components/StaffEmails.tsx';

let content = fs.readFileSync(path, 'utf8');

// Modify the table headers
content = content.replace(
  /<th className="px-5 py-3\.5 text-left text-\[11px\] font-semibold text-slate-500 uppercase tracking-wider">Student Profile<\/th>/,
  `<th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Student Name</th>
   <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Profile</th>`
);

// Modify the row content
const oldRow = `<td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{student.name}</p>
                        <p className="text-[11px] font-medium text-slate-500 mt-0.5">{student.registerNumber} • {student.email}</p>
                      </div>
                    </div>
                  </td>`;

const newRow = `<td className="px-5 py-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{student.name}</p>
                      <p className="text-[11px] font-medium text-slate-500 mt-0.5">{student.registerNumber} • {student.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline">
                      View Profile
                    </button>
                  </td>`;

content = content.replace(oldRow, newRow);

fs.writeFileSync(path, content);
console.log("Updated StaffEmails.tsx");
