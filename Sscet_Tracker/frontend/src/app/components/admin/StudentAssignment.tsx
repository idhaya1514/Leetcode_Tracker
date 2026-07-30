import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Users, UserPlus, Save, Loader2, Search, BookOpen, Clock, 
  Trash2, AlertCircle, History, CheckCircle2, ChevronDown, Upload
} from "lucide-react";
import * as XLSX from "xlsx";
import { 
  getStudents, 
  getStaffs, 
  getStaffAssignments, 
  getAssignmentHistory,
  assignStudentsToStaff,
  removeStudentAssignment,
  Student,
  StaffStudentAssignment,
  AssignmentHistoryRecord
} from "../../services/api";
import { toast } from "sonner";
import { DEPARTMENTS, ACADEMIC_YEARS } from "../../constants";

export default function StudentAssignment() {
  const [students, setStudents] = useState<Student[]>([]);
  const [staffs, setStaffs] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<StaffStudentAssignment[]>([]);
  const [history, setHistory] = useState<AssignmentHistoryRecord[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [activeTab, setActiveTab] = useState<"assign" | "history">("assign");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        const assignmentsMap: Record<string, string[]> = {};
        
        data.forEach((row: any) => {
          let staffId = "";
          let regNo = "";
          
          for (const key in row) {
            const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (normalizedKey.includes('staffid')) staffId = String(row[key]).trim();
            if (normalizedKey.includes('registernumber') || normalizedKey.includes('regno') || normalizedKey.includes('register')) {
              regNo = String(row[key]).trim();
            }
          }
          
          if (staffId && regNo) {
            if (!assignmentsMap[staffId]) assignmentsMap[staffId] = [];
            assignmentsMap[staffId].push(regNo);
          }
        });

        const staffIds = Object.keys(assignmentsMap);
        if (staffIds.length === 0) {
          toast.error("No valid 'Staff ID' and 'Register Number' columns found in the file.");
          return;
        }

        setAssigning(true);
        let successCount = 0;
        let failCount = 0;
        
        for (const sId of staffIds) {
          const regs = assignmentsMap[sId];
          const res = await assignStudentsToStaff(sId, regs, "Admin");
          if (res.success) {
            successCount += regs.length;
          } else {
            failCount += regs.length;
          }
        }
        
        if (successCount > 0) {
          toast.success(`Successfully assigned ${successCount} student(s) from file.`);
        }
        if (failCount > 0) {
          toast.error(`Failed to assign ${failCount} student(s). Check if Staff IDs exist.`);
        }
        
        await fetchData();
      } catch (err) {
        toast.error("Error parsing file. Ensure it is a valid Excel or CSV.");
      } finally {
        setAssigning(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All"); // All, Assigned, Unassigned
  const [staffFilter, setStaffFilter] = useState("All"); // For table filtering

  // Selections
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedStaffForAssign, setSelectedStaffForAssign] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stData, sfData, asData, hData] = await Promise.all([
        getStudents(),
        getStaffs(),
        getStaffAssignments(),
        getAssignmentHistory()
      ]);
      setStudents(stData || []);
      setStaffs(sfData || []);
      setAssignments(asData || []);
      setHistory(hData || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load assignment data.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedStaffForAssign) return toast.error("Please select a staff member to assign.");
    if (selectedStudents.length === 0) return toast.error("Please select at least one student.");

    // Check for reassignments
    const alreadyAssigned = selectedStudents.filter(regNo => 
      assignments.some(a => a.studentRegisterNumber === regNo && a.staffId !== selectedStaffForAssign)
    );

    if (alreadyAssigned.length > 0) {
      const confirmMsg = `${alreadyAssigned.length} selected student(s) are already assigned to other staff. Do you want to reassign them?`;
      if (!window.confirm(confirmMsg)) return;
    }

    setAssigning(true);
    try {
      const res = await assignStudentsToStaff(selectedStaffForAssign, selectedStudents, "Admin");
      if (res.success) {
        toast.success(`Successfully assigned ${selectedStudents.length} student(s)!`);
        setSelectedStudents([]);
        await fetchData(); // Refresh data to get latest assignments and history
      } else {
        toast.error(res.message || "Failed to assign students.");
      }
    } catch (e: any) {
      toast.error(e.message || "Error assigning students.");
    } finally {
      setAssigning(false);
    }
  };

  const handleRemove = async (registerNumber: string) => {
    if (!window.confirm(`Are you sure you want to remove the assignment for student ${registerNumber}?`)) return;
    
    try {
      const res = await removeStudentAssignment(registerNumber, "Admin");
      if (res.success) {
        toast.success("Assignment removed.");
        await fetchData();
      }
    } catch (e: any) {
      toast.error(e.message || "Error removing assignment.");
    }
  };

  const toggleSelectAll = (filteredList: Student[]) => {
    const filteredRegs = filteredList.map(s => s.registerNumber);
    const allSelected = filteredRegs.every(r => selectedStudents.includes(r));
    if (allSelected) {
      setSelectedStudents(prev => prev.filter(r => !filteredRegs.includes(r)));
    } else {
      const newSelections = new Set([...selectedStudents, ...filteredRegs]);
      setSelectedStudents(Array.from(newSelections));
    }
  };

  const toggleStudent = (regNo: string) => {
    setSelectedStudents(prev => 
      prev.includes(regNo) ? prev.filter(r => r !== regNo) : [...prev, regNo]
    );
  };

  // Prepare filtered list
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            s.registerNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const shortDept = departmentFilter === "All" ? "All" : (departmentFilter.split("(")[1]?.replace(")","").replace("&", "") || departmentFilter);
      const matchesDept = departmentFilter === "All" || s.department === shortDept || s.department === departmentFilter;
      const matchesYear = yearFilter === "All" || (s as any).academicYear === yearFilter; // Type hack for potential year mismatch
      
      const assignment = assignments.find(a => a.studentRegisterNumber === s.registerNumber);
      const isAssigned = !!assignment;
      
      let matchesStatus = true;
      if (statusFilter === "Assigned") matchesStatus = isAssigned;
      if (statusFilter === "Unassigned") matchesStatus = !isAssigned;

      let matchesStaff = true;
      if (staffFilter !== "All") {
        if (staffFilter === "UNASSIGNED") matchesStaff = !isAssigned;
        else matchesStaff = assignment?.staffId === staffFilter;
      }

      return matchesSearch && matchesDept && matchesYear && matchesStatus && matchesStaff;
    });
  }, [students, assignments, searchQuery, departmentFilter, yearFilter, statusFilter, staffFilter]);

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-500 p-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900 tracking-tight">Student Assignment Module</h1>
          <p className="text-ink-500 text-sm mt-1">Manage staff allocations and track assignment history</p>
        </div>
        
        <div className="flex items-center gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".csv, .xlsx, .xls" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={assigning}
            className="flex items-center gap-2 px-4 py-2 bg-sapphire-100 text-sapphire-800 rounded-lg font-medium text-sm hover:bg-sapphire-200 transition-colors shadow-sm"
          >
            {assigning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Import CSV/Excel
          </button>

          <div className="flex p-1 bg-cream-200 rounded-lg border border-stone-200/60 inline-flex shadow-sm">
          <button 
            onClick={() => setActiveTab("assign")} 
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === "assign" ? "bg-cream-100 text-ink-900 shadow-sm border border-stone-200/60" : "text-ink-500 hover:text-ink-700"}`}
          >
            <Users className="w-4 h-4" /> Manage Assignments
          </button>
          <button 
            onClick={() => setActiveTab("history")} 
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === "history" ? "bg-cream-100 text-ink-900 shadow-sm border border-stone-200/60" : "text-ink-500 hover:text-ink-700"}`}
          >
            <History className="w-4 h-4" /> Assignment History
          </button>
        </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-sapphire-600 animate-spin" /></div>
      ) : activeTab === "assign" ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Table Area */}
          <div className="lg:col-span-3 bg-cream-100 rounded-xl border border-stone-200/60 shadow-sm overflow-hidden flex flex-col h-[700px]">
            {/* Filters Bar */}
            <div className="p-4 border-b border-stone-200/60 bg-cream-200/50 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input 
                  type="text" 
                  placeholder="Search by Register Number or Name..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-cream-100 border border-stone-200 rounded-lg text-sm outline-none focus:border-sapphire-600 focus:ring-4 focus:ring-sapphire-600/10 transition-all"
                />
              </div>
              
              <div className="flex flex-wrap gap-3">
                <select value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)} className="px-3 py-2 bg-cream-100 border border-stone-200 rounded-lg text-sm outline-none focus:border-sapphire-600 cursor-pointer text-ink-900">
                  <option value="All">All Departments</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select value={yearFilter} onChange={e => setYearFilter(e.target.value)} className="px-3 py-2 bg-cream-100 border border-stone-200 rounded-lg text-sm outline-none focus:border-sapphire-600 cursor-pointer text-ink-900">
                  <option value="All">All Years</option>
                  {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 bg-cream-100 border border-stone-200 rounded-lg text-sm outline-none focus:border-sapphire-600 cursor-pointer text-ink-900">
                  <option value="All">All Statuses</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Unassigned">Unassigned</option>
                </select>
                <select value={staffFilter} onChange={e => setStaffFilter(e.target.value)} className="px-3 py-2 bg-cream-100 border border-stone-200 rounded-lg text-sm outline-none focus:border-sapphire-600 cursor-pointer text-ink-900">
                  <option value="All">Filter by Staff</option>
                  <option value="UNASSIGNED">-- Unassigned --</option>
                  {staffs.map(s => <option key={s.staffId} value={s.staffId}>{s.name} ({s.staffId})</option>)}
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-cream-200/80 border-b border-stone-200/60 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-4 py-3 w-12 text-center">
                      <input 
                        type="checkbox" 
                        checked={filteredStudents.length > 0 && filteredStudents.every(s => selectedStudents.includes(s.registerNumber))}
                        onChange={() => toggleSelectAll(filteredStudents)}
                        className="rounded border-stone-300 text-sapphire-800 focus:ring-sapphire-800 cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold text-ink-500 uppercase tracking-wider">Register No</th>
                    <th className="px-4 py-3 text-[11px] font-semibold text-ink-500 uppercase tracking-wider">Student Info</th>
                    <th className="px-4 py-3 text-[11px] font-semibold text-ink-500 uppercase tracking-wider">Assigned Staff</th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold text-ink-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-ink-500 text-sm">No students match your criteria.</td>
                    </tr>
                  ) : (
                    filteredStudents.map(student => {
                      const assignment = assignments.find(a => a.studentRegisterNumber === student.registerNumber);
                      const staff = assignment ? staffs.find(s => s.staffId === assignment.staffId) : null;
                      const isSelected = selectedStudents.includes(student.registerNumber);
                      
                      return (
                        <tr key={student.registerNumber} className={`hover:bg-cream-200/50 transition-colors ${isSelected ? 'bg-sapphire-100/30' : ''}`}>
                          <td className="px-4 py-3 text-center">
                            <input 
                              type="checkbox" 
                              checked={isSelected}
                              onChange={() => toggleStudent(student.registerNumber)}
                              className="rounded border-stone-300 text-sapphire-800 focus:ring-sapphire-800 cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-ink-700">{student.registerNumber}</td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-ink-900">{student.name}</p>
                            <p className="text-[11px] text-ink-500">{student.department} • {(student as any).academicYear || "N/A"}</p>
                          </td>
                          <td className="px-4 py-3">
                            {staff ? (
                              <div className="inline-flex flex-col">
                                <span className="text-sm font-medium text-sapphire-800">{staff.name}</span>
                                <span className="text-[10px] text-ink-500">{staff.staffId}</span>
                              </div>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-cream-200 text-ink-600">
                                Unassigned
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {staff && (
                              <button 
                                onClick={() => handleRemove(student.registerNumber)}
                                className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                title="Remove Assignment"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-stone-200/60 bg-cream-200/80 text-sm font-medium text-ink-600 flex justify-between items-center">
              <span>{selectedStudents.length} Student(s) Selected</span>
              <span>Total filtered: {filteredStudents.length}</span>
            </div>
          </div>

          {/* Action Pane */}
          <div className="bg-cream-100 rounded-xl border border-stone-200/60 shadow-sm p-6 h-fit sticky top-6">
            <div className="flex items-center gap-3 mb-6 border-b border-stone-200 pb-4">
              <div className="p-2 bg-sapphire-100 text-sapphire-800 rounded-lg shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-ink-900 tracking-tight">Bulk Assign</h2>
                <p className="text-xs text-ink-500 mt-0.5">Assign selected students</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-[11px] font-semibold text-ink-500 uppercase tracking-wider mb-2">Selected Staff</label>
                <div className="relative">
                  <select 
                    value={selectedStaffForAssign} 
                    onChange={e => setSelectedStaffForAssign(e.target.value)}
                    className="w-full px-4 py-3 bg-cream-100 border border-stone-200 rounded-lg text-ink-900 text-sm outline-none focus:border-sapphire-600 focus:ring-4 focus:ring-sapphire-600/10 transition-all font-medium appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select Instructor...</option>
                    {staffs.map(s => (
                      <option key={s.staffId} value={s.staffId}>{s.name} ({s.staffId})</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                </div>
              </div>

              <div className="p-4 bg-sapphire-100/50 rounded-lg border border-sapphire-200 text-sm">
                <div className="flex items-start gap-2 text-sapphire-800 font-medium mb-1">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  Important Note
                </div>
                <p className="text-xs text-sapphire-900/70 pl-6 leading-relaxed">
                  Students can only be assigned to one staff member. If any selected student is already assigned, they will be reassigned and previous mappings will be removed.
                </p>
              </div>

              <button 
                onClick={handleAssign}
                disabled={assigning || selectedStudents.length === 0}
                className="w-full py-3 bg-sapphire-800 disabled:bg-stone-300 disabled:cursor-not-allowed hover:bg-sapphire-900 text-cream-100 text-sm font-bold rounded-lg shadow-sm shadow-sapphire-200 transition-all flex items-center justify-center gap-2"
              >
                {assigning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Assign {selectedStudents.length > 0 ? `${selectedStudents.length} Students` : ''}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-cream-100 rounded-xl border border-stone-200/60 shadow-sm overflow-hidden flex flex-col h-[700px]">
          <div className="p-4 border-b border-stone-200/60 bg-cream-200/50">
            <h3 className="font-semibold text-ink-900 text-sm">Recent Assignment Activity</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-cream-200/80 border-b border-stone-200/60 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-3 text-[11px] font-semibold text-ink-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-ink-500 uppercase tracking-wider">Register No</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-ink-500 uppercase tracking-wider">Student Name</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-ink-500 uppercase tracking-wider">Change Action</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-ink-500 uppercase tracking-wider">Assigned By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-ink-500 text-sm">No assignment history found.</td>
                  </tr>
                ) : (
                  [...history].reverse().map(record => (
                    <tr key={record.id} className="hover:bg-cream-200/50 transition-colors">
                      <td className="px-4 py-3 text-xs text-ink-600 whitespace-nowrap">
                        {new Date(record.assignedAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-ink-700">{record.registerNumber}</td>
                      <td className="px-4 py-3 text-sm font-medium text-ink-900">{record.studentName}</td>
                      <td className="px-4 py-3">
                        {record.newStaff === "UNASSIGNED" ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-100">
                            Removed from {record.previousStaff}
                          </span>
                        ) : record.previousStaff ? (
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                            <span className="px-2 py-1 rounded bg-cream-200 text-ink-600 line-through decoration-stone-400">{record.previousStaff}</span>
                            <span className="text-stone-400">→</span>
                            <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">{record.newStaff}</span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold bg-sapphire-100 text-sapphire-800 border border-sapphire-200">
                            <CheckCircle2 className="w-3 h-3" /> Assigned to {record.newStaff}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-ink-500 font-medium">{record.assignedBy}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

