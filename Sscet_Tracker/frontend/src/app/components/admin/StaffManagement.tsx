import React, { useState, useEffect } from "react";
import {
  Users, UserPlus, Save, Loader2, Search, KeyRound, Type, IdCard, X, ChevronLeft, Trophy
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getStudents, API_BASE_URL } from "../../services/api";
import { toast } from "sonner";

export default function StaffManagement() {
  const [staffs, setStaffs] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"list" | "create" | "details">("list");
  const [selectedStaffForDetails, setSelectedStaffForDetails] = useState<any>(null);

  const [newStaffId, setNewStaffId] = useState("");
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
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
      const res = await fetch(`${API_BASE_URL}/staff/all`);
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
      const res = await fetch(`${API_BASE_URL}/staff/assignments`);
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
    if (!newEmail.trim().toLowerCase().endsWith("@shanmugha.edu.in")) {
      return toast.error("Only @shanmugha.edu.in email addresses are allowed.");
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/staff/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId: newStaffId, name: newName, email: newEmail, password: newPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Staff created successfully!");
        setNewStaffId(""); setNewName(""); setNewEmail(""); setNewPassword("");
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
            onClick={() => { setActiveTab("list"); setSelectedStaffForDetails(null); }} 
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === "list" || activeTab === "details" ? "bg-white text-slate-900 shadow-sm border border-slate-200/60" : "text-slate-500 hover:text-slate-700"}`}
          >
            <Users className="w-4 h-4" /> Directory
          </button>
          <button 
            onClick={() => setActiveTab("create")} 
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === "create" ? "bg-white text-slate-900 shadow-sm border border-slate-200/60" : "text-slate-500 hover:text-slate-700"}`}
          >
            <UserPlus className="w-4 h-4" /> Onboard Staff
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
                        <button 
                          onClick={() => {
                            setSelectedStaffForDetails(staff);
                            setActiveTab("details");
                          }}
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
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
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
              <input type="email" required value={newEmail} onChange={e=>setNewEmail(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200/60 rounded-md text-sm outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-100 shadow-sm" placeholder="staff@shanmugha.edu.in" />
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
      ) : activeTab === "details" && selectedStaffForDetails ? (
        <div className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={() => { setActiveTab("list"); setSelectedStaffForDetails(null); }}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{selectedStaffForDetails.name}'s Students</h2>
              <p className="text-sm text-slate-500">{selectedStaffForDetails.staffId}</p>
            </div>
          </div>
          
          {(() => {
            const staffAssignedRegs = new Set(assignments.filter((a: any) => a.staffId === selectedStaffForDetails.staffId).map((a: any) => a.studentRegisterNumber || a.student_register_number));
            const assignedStudents = students.filter(s => staffAssignedRegs.has(s.registerNumber));
            
            const chartData = assignedStudents.map(s => ({
              name: s.name,
              totalSolved: s.totalSolved || 0
            })).sort((a, b) => b.totalSolved - a.totalSolved); // Sort by totalSolved desc for better visibility

            const topStudents = [...assignedStudents].sort((a, b) => (b.totalSolved || 0) - (a.totalSolved || 0)).slice(0, 5);

            if (assignedStudents.length === 0) {
              return <div className="text-center py-12 text-slate-500">No students assigned yet.</div>;
            }

            return (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-sm font-semibold text-slate-700">Total Solved Performance</h3>
                  <div className="h-[400px] bg-slate-50 border border-slate-200/60 rounded-xl p-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData.slice(0, 10)}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="name" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} tick={{fontSize: 11}} />
                        <Tooltip 
                          cursor={{fill: '#F1F5F9'}} 
                          contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                        />
                        <Bar dataKey="totalSolved" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  {chartData.length > 10 && <p className="text-xs text-slate-400 text-center">Showing top 10 students in chart for clarity.</p>}
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" /> Highly Active Students
                  </h3>
                  <div className="bg-slate-50 rounded-xl border border-slate-200/60 divide-y divide-slate-200/60">
                    {topStudents.map((s, idx) => (
                      <div key={s.registerNumber} className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-amber-100 text-amber-700' : idx === 1 ? 'bg-slate-200 text-slate-700' : idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'}`}>
                            {idx + 1}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{s.name}</p>
                            <p className="text-xs text-slate-500">{s.registerNumber}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-indigo-600">{s.totalSolved || 0}</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Solved</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      ) : null}
    </div>
  );
}

