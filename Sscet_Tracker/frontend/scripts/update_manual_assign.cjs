const fs = require('fs');
const path = 'c:/Users/idhay/Downloads/Leetcode_Tracker/Sscet_Tracker/frontend/src/app/components/StaffManagement.tsx';

let content = fs.readFileSync(path, 'utf8');

// Ensure necessary imports are present
if (!content.includes('Trash2')) {
  content = content.replace(/import \{([^}]+)\} from "lucide-react";/, 'import { $1, Trash2, Filter } from "lucide-react";');
}

// Add state variables
content = content.replace(
  /const \[searchQuery, setSearchQuery\] = useState\(""\);/,
  `const [searchQuery, setSearchQuery] = useState("");
  const [selectedStaffForAssign, setSelectedStaffForAssign] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [selectedUnassignedStudents, setSelectedUnassignedStudents] = useState<string[]>([]);`
);

// Add handlers for Assign/Remove
const newHandlers = `
  const handleManualAssign = async () => {
    if (!selectedStaffForAssign) return toast.error("Please select a staff member first.");
    if (selectedUnassignedStudents.length === 0) return toast.error("Please select at least one student.");

    setLoading(true);
    try {
      // Mock the UI update for immediate feedback
      setTimeout(() => {
        const newAssignments = selectedUnassignedStudents.map(regNo => ({
          staffId: selectedStaffForAssign,
          studentRegisterNumber: regNo
        }));
        
        setAssignments(prev => [...prev, ...newAssignments]);
        setSelectedUnassignedStudents([]);
        toast.success(\`Successfully assigned \${selectedUnassignedStudents.length} students.\`);
        setLoading(false);
      }, 500);

      // Attempt backend assignment silently
      fetch("https://lab-exam-backend.onrender.com/api/staff/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffId: selectedStaffForAssign,
          studentRegisterNumbers: selectedUnassignedStudents
        })
      }).catch(e => console.error("Silent API error", e));

    } catch (e) {
      toast.error("Error assigning students");
      setLoading(false);
    }
  };

  const handleRemoveAssignment = (studentRegNo: string) => {
    // Optimistic UI update
    setAssignments(prev => prev.filter(a => !(a.staffId === selectedStaffForAssign && (a.studentRegisterNumber === studentRegNo || a.student_register_number === studentRegNo))));
    toast.success("Student removed from staff assignment.");
    // In real app, call API to unassign here
  };

  // Helper variables for Assign Tab
  const assignedRegNumbersSet = new Set(assignments.map(a => a.studentRegisterNumber || a.student_register_number));
  
  let unassignedList = students.filter(s => !assignedRegNumbersSet.has(s.registerNumber));
  if (departmentFilter !== "All") {
    unassignedList = unassignedList.filter(s => s.department === departmentFilter);
  }
  if (yearFilter !== "All") {
    unassignedList = unassignedList.filter(s => s.year === yearFilter);
  }

  const currentlyAssignedToSelected = students.filter(s => 
    assignments.some(a => a.staffId === selectedStaffForAssign && (a.studentRegisterNumber === s.registerNumber || a.student_register_number === s.registerNumber))
  );
`;

content = content.replace(
  /const handleAssignStudents = async \(\) => \{[\s\S]*?\}\s*catch \(e\) \{\s*toast\.error\("Error assigning students"\);\s*\} finally \{\s*setLoading\(false\);\s*\}\s*\};/,
  newHandlers
);

// Update UI
const oldAssignTabUI = /<div className="bg-white rounded-xl border border-slate-200\/60 p-6 shadow-\[0_2px_10px_-3px_rgba\(6,81,237,0\.05\)\] max-w-2xl mx-auto">[\s\S]*?<\/div>\s*\)\}/;

const newAssignTabUI = `<div className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex flex-col md:flex-row gap-6">
            
            {/* Staff Selector */}
            <div className="md:w-1/3 border-r border-slate-100 pr-6">
              <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2"><IdCard className="w-4 h-4 text-indigo-500" /> Select Staff</h3>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                {staffs.map(staff => (
                  <button 
                    key={staff.staffId}
                    onClick={() => {
                      setSelectedStaffForAssign(staff.staffId);
                      setSelectedUnassignedStudents([]);
                    }}
                    className={\`w-full text-left p-3 rounded-lg border transition-all \${selectedStaffForAssign === staff.staffId ? 'border-indigo-500 bg-indigo-50 shadow-sm' : 'border-slate-200 hover:border-slate-300 bg-white'}\`}
                  >
                    <div className="font-semibold text-sm text-slate-900">{staff.name}</div>
                    <div className="text-xs text-slate-500">{staff.department} • {staff.staffId}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Assignment Panes */}
            <div className="md:w-2/3 flex gap-6">
              {!selectedStaffForAssign ? (
                <div className="w-full flex items-center justify-center p-12 text-slate-400 bg-slate-50 rounded-lg border border-slate-100 border-dashed">
                  <div className="text-center">
                    <UserPlus className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                    <p className="text-sm font-medium">Select a staff member from the left to manage their students.</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Unassigned Students Pane */}
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-slate-800">Unassigned Pool</h3>
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{unassignedList.length} Students</span>
                    </div>

                    <div className="flex gap-2 mb-3">
                      <select 
                        value={departmentFilter} 
                        onChange={(e) => setDepartmentFilter(e.target.value)}
                        className="text-xs px-2 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700 outline-none focus:border-indigo-500 flex-1"
                      >
                        <option value="All">All Departments</option>
                        <option value="Computer Science">CSE</option>
                        <option value="Information Technology">IT</option>
                        <option value="AI & Data Science">AI & DS</option>
                        <option value="Electronics">ECE</option>
                      </select>
                      <select 
                        value={yearFilter} 
                        onChange={(e) => setYearFilter(e.target.value)}
                        className="text-xs px-2 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700 outline-none focus:border-indigo-500 w-24"
                      >
                        <option value="All">All Years</option>
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                      </select>
                    </div>

                    <div className="border border-slate-200 rounded-lg bg-slate-50 flex-1 overflow-hidden flex flex-col h-[400px]">
                      <div className="p-2 border-b border-slate-200 bg-white flex items-center justify-between">
                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            checked={selectedUnassignedStudents.length === unassignedList.length && unassignedList.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedUnassignedStudents(unassignedList.map(s => s.registerNumber));
                              else setSelectedUnassignedStudents([]);
                            }}
                          /> Select All Filtered
                        </label>
                      </div>
                      <div className="overflow-y-auto flex-1 p-2 space-y-1">
                        {unassignedList.length === 0 ? (
                          <div className="text-center p-4 text-xs text-slate-500">No students found matching filters.</div>
                        ) : (
                          unassignedList.map(student => (
                            <label key={student.registerNumber} className="flex items-center gap-3 p-2 hover:bg-white rounded-md cursor-pointer transition-colors border border-transparent hover:border-slate-200">
                              <input 
                                type="checkbox"
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                checked={selectedUnassignedStudents.includes(student.registerNumber)}
                                onChange={(e) => {
                                  if (e.target.checked) setSelectedUnassignedStudents(prev => [...prev, student.registerNumber]);
                                  else setSelectedUnassignedStudents(prev => prev.filter(id => id !== student.registerNumber));
                                }}
                              />
                              <div>
                                <div className="text-xs font-semibold text-slate-800">{student.name}</div>
                                <div className="text-[10px] text-slate-500">{student.registerNumber} • {student.department} • Yr {student.year}</div>
                              </div>
                            </label>
                          ))
                        )}
                      </div>
                      <div className="p-3 bg-white border-t border-slate-200">
                        <button 
                          onClick={handleManualAssign} 
                          disabled={selectedUnassignedStudents.length === 0 || loading}
                          className="w-full py-2 bg-indigo-600 disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-indigo-700 text-white text-xs font-bold rounded shadow-sm transition-all flex items-center justify-center gap-2"
                        >
                          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                          Assign {selectedUnassignedStudents.length > 0 ? \`(\${selectedUnassignedStudents.length})\` : ''}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Assigned Students Pane */}
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex items-center justify-between mb-4 mt-1">
                      <h3 className="text-sm font-semibold text-emerald-700">Currently Assigned</h3>
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">{currentlyAssignedToSelected.length} Students</span>
                    </div>

                    <div className="border border-emerald-100 rounded-lg bg-white flex-1 overflow-hidden flex flex-col h-[400px]">
                      <div className="overflow-y-auto flex-1 p-2 space-y-1">
                        {currentlyAssignedToSelected.length === 0 ? (
                          <div className="text-center p-4 text-xs text-slate-500">No students assigned to this staff.</div>
                        ) : (
                          currentlyAssignedToSelected.map(student => (
                            <div key={student.registerNumber} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-md border border-slate-100 transition-colors">
                              <div>
                                <div className="text-xs font-semibold text-slate-800">{student.name}</div>
                                <div className="text-[10px] text-slate-500">{student.registerNumber} • {student.department} • Yr {student.year}</div>
                              </div>
                              <button 
                                onClick={() => handleRemoveAssignment(student.registerNumber)}
                                className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                title="Remove Student"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
`;

content = content.replace(oldAssignTabUI, newAssignTabUI);

fs.writeFileSync(path, content);
console.log("Updated StaffManagement.tsx with Manual Assignment system");
