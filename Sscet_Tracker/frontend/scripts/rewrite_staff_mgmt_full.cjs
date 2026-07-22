const fs = require('fs');
const path = 'c:/Users/idhay/Downloads/Leetcode_Tracker/Sscet_Tracker/frontend/src/app/components/StaffManagement.tsx';

const content = `import React, { useState, useEffect } from "react";
import {
  Users, UserPlus, Save, Loader2, Search, KeyRound, Type, IdCard, X
} from "lucide-react";
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

  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchStaffs();
    fetchStudents();
    fetchAssignments();
  }, []);

  const fetchStaffs = async () => {
    try {
      setLoading(true);
      const res = await fetch("https://lab-exam-backend.onrender.com/api/staff/all");
      if (res.ok) {
        const data = await res.json();
        setStaffs(data);
        setSelectedStaffIds(data.map((s: any) => s.staffId));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const res = await fetch("https://lab-exam-backend.onrender.com/api/staff/assignments");
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
      const res = await fetch("https://lab-exam-backend.onrender.com/api/staff/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId: newStaffId, name: newName, password: newPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Staff created successfully!");
        setNewStaffId(""); setNewName(""); setNewPassword("");
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

  const handleAssignStudents = async () => {
    if (staffs.length === 0) return toast.error("Please add at least one staff member first");
    if (students.length === 0) return toast.error("There are no registered students to assign");
    if (selectedStaffIds.length === 0) return toast.error("Please select at least one staff member");

    const assignedRegNumbers = new Set(assignments.map((a: any) => a.studentRegisterNumber || a.student_register_number));
    const unassignedStudents = students.filter((s) => !assignedRegNumbers.has(s.registerNumber));

    if (unassignedStudents.length === 0) return toast.info("All students are already assigned.");

    if (!confirm(\`Distribute \${unassignedStudents.length} unassigned students equally among the \${selectedStaffIds.length} selected staff?\`)) {
      return;
    }

    setLoading(true);
    try {
      const selectedStaffs = staffs.filter((s) => selectedStaffIds.includes(s.staffId));
      const staffAssignments = selectedStaffs.map((staff) => ({
        staffId: staff.staffId,
        studentRegisterNumbers: [] as string[],
      }));

      const studentsByDept: Record<string, any[]> = {};
      unassignedStudents.forEach((s) => {
        const dept = s.department || "Unknown";
        if (!studentsByDept[dept]) studentsByDept[dept] = [];
        studentsByDept[dept].push(s);
      });

      Object.values(studentsByDept).forEach((deptStudents) => {
        deptStudents.sort((a, b) => (a.registerNumber || "").localeCompare(b.registerNumber || ""));
        deptStudents.forEach((student, index) => {
          const staffIndex = index % selectedStaffs.length;
          staffAssignments[staffIndex].studentRegisterNumbers.push(student.registerNumber);
        });
      });

      const results = [];
      for (const assignment of staffAssignments) {
        const res = await fetch("https://lab-exam-backend.onrender.com/api/staff/assign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(assignment),
        });
        results.push(await res.json());
      }

      if (results.some((r) => !r.success)) {
        toast.error("Some assignments failed.");
      } else {
        toast.success("All students assigned successfully.");
        fetchAssignments();
        setActiveTab("list");
      }
    } catch (e) {
      toast.error("Error assigning students");
    } finally {
      setLoading(false);
    }
  };

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
            className={\`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors \${activeTab === "list" ? "bg-white text-slate-900 shadow-sm border border-slate-200/60" : "text-slate-500 hover:text-slate-700"}\`}
          >
            <Users className="w-4 h-4" /> Directory
          </button>
          <button 
            onClick={() => setActiveTab("create")} 
            className={\`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors \${activeTab === "create" ? "bg-white text-slate-900 shadow-sm border border-slate-200/60" : "text-slate-500 hover:text-slate-700"}\`}
          >
            <UserPlus className="w-4 h-4" /> Onboard Staff
          </button>
          <button 
            onClick={() => setActiveTab("assign")} 
            className={\`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors \${activeTab === "assign" ? "bg-white text-slate-900 shadow-sm border border-slate-200/60" : "text-slate-500 hover:text-slate-700"}\`}
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
                        <button className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === "create" ? (
        <div className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] max-w-xl mx-auto">
          <h2 className="text-lg font-semibold text-slate-800 mb-6 border-b border-slate-100 pb-4">Register New Staff</h2>
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
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-slate-800">Auto-Assign Students</h2>
            <p className="text-sm text-slate-500 mt-1">Distribute unassigned students equally to selected staff</p>
          </div>
          
          <div className="bg-slate-50 rounded-lg p-4 mb-6 border border-slate-200/60">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Select Staff Mentors</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {staffs.map(staff => (
                <label key={staff.staffId} className="flex items-center gap-3 p-2 hover:bg-white rounded-md transition-colors cursor-pointer border border-transparent hover:border-slate-200/60">
                  <input 
                    type="checkbox" 
                    className="rounded text-slate-900 focus:ring-slate-900 border-slate-300"
                    checked={selectedStaffIds.includes(staff.staffId)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedStaffIds([...selectedStaffIds, staff.staffId]);
                      else setSelectedStaffIds(selectedStaffIds.filter(id => id !== staff.staffId));
                    }}
                  />
                  <span className="text-sm font-medium text-slate-700">{staff.name} <span className="text-xs text-slate-400 font-normal">({staff.staffId})</span></span>
                </label>
              ))}
            </div>
          </div>

          <button onClick={handleAssignStudents} disabled={loading} className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg shadow-sm flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Distribute Unassigned Students
          </button>
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync(path, content);
console.log("Completely rewritten StaffManagement.tsx!");
