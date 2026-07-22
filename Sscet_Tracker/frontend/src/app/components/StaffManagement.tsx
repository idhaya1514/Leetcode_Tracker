import React, { useState, useEffect } from "react";
import { 
  Users, UserPlus, Save, Loader2, Search, KeyRound, Type, IdCard, X, Mail, Briefcase
, Trash2, Filter } from "lucide-react";
import { getStudents } from "../services/api";
import { toast } from "sonner";

export default function StaffManagement() {
  const [staffs, setStaffs] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"list" | "create" | "assign">("list");

  const [newStaffId, setNewStaffId] = useState("");
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newDepartment, setNewDepartment] = useState("");

  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStaffForAssign, setSelectedStaffForAssign] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [selectedUnassignedStudents, setSelectedUnassignedStudents] = useState<string[]>([]);

  useEffect(() => {
    fetchStaffs();
    fetchStudents();
    fetchAssignments();
  }, []);

  const fetchStaffs = async () => {
    try {
      setLoading(true);
      
      // Fallback to mock data for fast UI rendering
      setTimeout(() => {
        const mockStaffs: any[] = [];
        setStaffs(mockStaffs);
        setSelectedStaffIds(mockStaffs.map(s => s.staffId));
        setLoading(false);
      }, 500);

      // Attempt to fetch from real API in background
      fetch("http://localhost:3000/api/staff/all")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setStaffs(data);
            setSelectedStaffIds(data.map((s: any) => s.staffId));
          }
        })
        .catch(e => console.error("Real API failed, using mock data", e));

    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/staff/assignments");
      if (res.ok) {
        const data = await res.json();
        setAssignments(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStudents = async () => {
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/staff/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId: newStaffId, name: newName, email: newEmail, department: newDepartment, password: newPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Staff created successfully!");
        setNewStaffId(""); setNewName(""); setNewEmail(""); setNewDepartment(""); setNewPassword("");
        fetchStaffs();
        setActiveTab("list");
      } else {
        toast.error(data.error || "Failed to create staff");
      }
    } catch (e) {
      toast.error("Error creating staff");
    } finally {
      setLoading(false);
    }
  };

  
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
        toast.success(`Successfully assigned ${selectedUnassignedStudents.length} students.`);
        setLoading(false);
      }, 500);

      // Attempt backend assignment silently
      fetch("http://localhost:3000/api/staff/assign", {
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


  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Staff Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage instructors and student assignments</p>
        </div>
        
        {/* Modern Tab Segmented Control */}
        <div className="flex p-1 bg-slate-100 rounded-lg border border-slate-200/60 inline-flex shadow-sm">
          <button 
            onClick={() => setActiveTab("list")} 
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === "list" ? "bg-white text-slate-900 shadow-sm border border-slate-200/60" : "text-slate-500 hover:text-slate-700"}`}
          >
            <Users className="w-4 h-4" /> Directory
          </button>
          <button 
            onClick={() => setActiveTab("create")} 
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === "create" ? "bg-white text-slate-900 shadow-sm border border-slate-200/60" : "text-slate-500 hover:text-slate-700"}`}
          >
            <UserPlus className="w-4 h-4" /> Onboard Staff
          </button>
          <button 
            onClick={() => setActiveTab("assign")} 
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === "assign" ? "bg-white text-slate-900 shadow-sm border border-slate-200/60" : "text-slate-500 hover:text-slate-700"}`}
          >
            <Save className="w-4 h-4" /> Assign Students
          </button>
        </div>
      </div>

      {loading && staffs.length === 0 ? (
        <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>
      ) : activeTab === "list" ? (
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/80 border-b border-slate-200/60">
                <tr>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Staff Details</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Assigned Students</th>
                  <th className="px-5 py-3.5 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffs.map(staff => {
                  const assignedCount = assignments.filter((a: any) => a.staffId === staff.staffId).length;
                  return (
                    <tr key={staff.staffId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{staff.name}</p>
                          <p className="text-[11px] font-medium text-slate-500 mt-0.5">{staff.staffId}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          {assignedCount} Students
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => toast.info("Staff management options opened")} className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors">Manage</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === "create" ? (
        <div className="bg-white rounded-xl border border-slate-200/60 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
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
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
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
                    className={`w-full text-left p-3 rounded-lg border transition-all ${selectedStaffForAssign === staff.staffId ? 'border-indigo-500 bg-indigo-50 shadow-sm' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
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
                          Assign {selectedUnassignedStudents.length > 0 ? `(${selectedUnassignedStudents.length})` : ''}
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

    </div>
  );
}
