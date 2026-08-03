import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Plus, Edit2, Trash2, X, Users, Loader2, Search, 
  ChevronRight, ArrowLeft, Code2, Shield, Eye, Upload
} from "lucide-react";
import { getStudents, createStudent, updateStudent, deleteStudent, importStudents } from "../../services/api";
import { toast } from "sonner";
import { DEPARTMENTS, ACADEMIC_YEARS } from "../../constants";





export interface StudentRecord {
  id: string;
  name: string;
  registerNumber: string;
  department: string;
  academicYear: string;
  email?: string;
  leetCodeUrl?: string;
  leetCodeUsername?: string;
  totalSolved?: number;
  createdAt: string;
}

import AdvancedStudentImport from "./AdvancedStudentImport";

export default function StudentManagement() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "", registerNumber: "", department: DEPARTMENTS[0], academicYear: ACADEMIC_YEARS[0],
    email: "", leetCodeUrl: "", leetCodeUsername: "", password: "", confirmPassword: "",
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState("All");
  const [filterDept, setFilterDept] = useState("All");

  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadStudents();
  }, []);
  
  useEffect(() => {
    if (formData.leetCodeUrl && formData.leetCodeUrl.includes("leetcode.com/")) {
      const parts = formData.leetCodeUrl.split("leetcode.com/");
      const path = parts[1] || "";
      const segments = path.split("/").filter(Boolean);
      if (segments[0] === "u" && segments[1]) {
        setFormData(p => ({ ...p, leetCodeUsername: segments[1] }));
      } else if (segments[0]) {
        setFormData(p => ({ ...p, leetCodeUsername: segments[0] }));
      }
    }
  }, [formData.leetCodeUrl]);

  useEffect(() => {
    if (!formData.registerNumber) return;
    const reg = formData.registerNumber.toUpperCase();
    let newYear = formData.academicYear;
    let newDept = formData.department;
    let changed = false;

    if (reg.includes("E23")) { newYear = "Final Year"; changed = true; }
    else if (reg.includes("E24")) { newYear = "Third Year"; changed = true; }
    else if (reg.includes("E25")) { newYear = "Second Year"; changed = true; }
    else if (reg.includes("E26")) { newYear = "First Year"; changed = true; }

    if (reg.includes("AI")) { newDept = "Artificial Intelligence and Data Science"; changed = true; }
    else if (reg.includes("CS")) { newDept = "Computer Science and Engineering"; changed = true; }
    else if (reg.includes("IT")) { newDept = "Information Technology"; changed = true; }
    else if (reg.includes("CY")) { newDept = "Cyber Security"; changed = true; }
    else if (reg.includes("AG")) { newDept = "Agricultural Engineering"; changed = true; }
    else if (reg.includes("ME")) { newDept = "Mechanical Engineering"; changed = true; }
    else if (reg.includes("EC")) { newDept = "Electronics and Communication Engineering"; changed = true; }
    else if (reg.includes("BM")) { newDept = "Biomedical Engineering"; changed = true; }

    if (changed) {
      setFormData(p => {
        if (p.academicYear === newYear && p.department === newDept) return p;
        return { ...p, academicYear: newYear, department: newDept };
      });
    }
  }, [formData.registerNumber]);


  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const data = await getStudents();
      setStudents(data.map((s: any) => ({
        id: String(s.id),
        name: s.name,
        registerNumber: s.registerNumber,
        department: s.department,
        academicYear: s.academicYear || "I",
        email: s.email,
        leetCodeUrl: s.leetCodeUrl,
        leetCodeUsername: s.leetCodeUsername,
        totalSolved: s.totalSolved,
        createdAt: s.createdAt || new Date().toISOString()
      })));
    } catch (error: any) {
      toast.error("Failed to load students: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return toast.error("Name is required");
    if (!formData.registerNumber.trim()) return toast.error("Register number is required");
    if (!formData.leetCodeUrl) return toast.error("LeetCode Profile URL is required");
    if (formData.email && !formData.email.trim().toLowerCase().endsWith("@shanmugha.edu.in")) return toast.error("Only @shanmugha.edu.in email addresses are allowed.");
    
    setIsSaving(true);
    try {
      if (editingId) {
        await updateStudent(editingId, {
          ...formData,
          registerNumber: formData.registerNumber.trim().toUpperCase(),
        });
        toast.success("Student updated successfully");
      } else {
        await createStudent({
          ...formData,
          registerNumber: formData.registerNumber.trim().toUpperCase(),
        });
        toast.success("Student added successfully");
      }
      setIsModalOpen(false);
      setEditingId(null);
      loadStudents();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (student: StudentRecord) => {
    setEditingId(student.id);
    setFormData({
      name: student.name,
      registerNumber: student.registerNumber,
      department: student.department || DEPARTMENTS[0],
      academicYear: student.academicYear || ACADEMIC_YEARS[0],
      email: student.email || "",
      leetCodeUrl: student.leetCodeUrl || "",
      leetCodeUsername: student.leetCodeUsername || "",
      password: "",
      confirmPassword: ""
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    try {
      await deleteStudent(id);
      toast.success("Student deleted");
      loadStudents();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setIsImporting(true);
    const toastId = toast.loading("Importing students...");
    try {
      const result = await importStudents(file);
      
      // We assume the backend responds with `{ message: "150 students imported successfully.", summary: { success: 150, skipped: 5, empty: 2 } }`
      
      let message = result.message || "Import complete!";
      if (result.summary) {
        if (result.summary.skipped > 0) message += `\n${result.summary.skipped} duplicate records skipped.`;
        if (result.summary.empty > 0) message += `\n${result.summary.empty} empty rows ignored.`;
      }
      
      toast.success(message, { id: toastId, duration: 5000 });
      
      loadStudents();
    } catch (error: any) {
      toast.error(error.message || "Failed to import students", { id: toastId });
    } finally {
      setIsImporting(false);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchSearch = !searchTerm || (s.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || (s.registerNumber || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchYear = filterYear === "All" || (s.academicYear || "I") === filterYear;
      
      let matchDept = filterDept === "All";
      if (!matchDept) {
        const d = (s.department || "").toUpperCase().replace(/[^A-Z]/g, '');
        const f = filterDept.toUpperCase().replace(/[^A-Z]/g, '');
        
        if (f.includes('INFORMATIONTECHNOLOGY') && (d === 'IT' || d.includes('INFORMATIONTECHNOLOGY'))) matchDept = true;
        else if (f.includes('COMPUTERSCIENCE') && (d === 'CS' || d === 'CSE' || d.includes('COMPUTERSCIENCE'))) matchDept = true;
        else if (f.includes('ARTIFICIALINTELLIGENCE') && (d === 'AI' || d === 'AIDS' || d.includes('ARTIFICIALINTELLIGENCE'))) matchDept = true;
        else if (f.includes('CYBER') && (d === 'CY' || d.includes('CYBER'))) matchDept = true;
        else if (f.includes('ELECTRONICS') && (d === 'EC' || d === 'ECE' || d.includes('ELECTRONICS'))) matchDept = true;
        else if (f.includes('BIOMEDICAL') && (d === 'BM' || d === 'BME' || d.includes('BIOMEDICAL'))) matchDept = true;
        else if (f.includes('MECHANICAL') && (d === 'ME' || d === 'MECH' || d.includes('MECHANICAL'))) matchDept = true;
        else if (f.includes('AGRICULTUR') && (d === 'AG' || d === 'AGRI' || d.includes('AGRICULTUR'))) matchDept = true;
        else if (s.department === filterDept) matchDept = true;
      }

      return matchSearch && matchYear && matchDept;
    });
  }, [students, searchTerm, filterYear, filterDept]);

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900 tracking-tight">Student Directory</h1>
          <p className="text-ink-500 text-sm mt-1">Manage student records, credentials, and LeetCode mapping.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={async () => {
              try {
                toast.loading("Syncing LeetCode stats...", { id: "sync" });
                const res = await fetch("/api/students/sync-leetcode", { method: "POST" });
                const data = await res.json();
                toast.success(`Synced ${data.synced} students!`, { id: "sync" });
                loadStudents();
              } catch (e) {
                toast.error("Sync failed", { id: "sync" });
              }
            }}
            className="px-4 py-2 bg-sapphire-100 text-sapphire-800 text-sm font-medium rounded-lg hover:bg-sapphire-200 transition-colors shadow-sm flex items-center gap-2"
          >
            <Code2 className="w-4 h-4" /> Sync LeetCode
          </button>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-4 py-2 bg-cream-200 text-ink-700 text-sm font-medium rounded-lg hover:bg-cream-300 transition-colors shadow-sm flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Import CSV / Excel
          </button>
          <button 
            onClick={() => {
              setEditingId(null);
              setFormData({name: "", registerNumber: "", department: DEPARTMENTS[0], academicYear: ACADEMIC_YEARS[0], email: "", leetCodeUrl: "", leetCodeUsername: "", password: "", confirmPassword: ""});
              setIsModalOpen(true);
            }} 
            className="px-4 py-2 bg-sapphire-800 text-cream-100 text-sm font-medium rounded-lg hover:bg-sapphire-900 transition-colors shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Student
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input 
            type="text" 
            placeholder="Search name or register number..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full pl-9 pr-4 py-2 bg-cream-100 border border-stone-200/60 text-ink-600 text-sm rounded-lg outline-none focus:border-sapphire-600 focus:ring-4 focus:ring-sapphire-200/50 transition-all shadow-sm placeholder:text-stone-400" 
          />
        </div>
        <select 
          value={filterYear} 
          onChange={e => setFilterYear(e.target.value)}
          className="px-3 py-2 bg-cream-100 border border-stone-200/60 text-ink-600 text-sm rounded-lg shadow-sm outline-none focus:border-sapphire-600"
        >
          <option value="All">All Years</option>
          {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select 
          value={filterDept} 
          onChange={e => setFilterDept(e.target.value)}
          className="px-3 py-2 bg-cream-100 border border-stone-200/60 text-ink-600 text-sm rounded-lg shadow-sm outline-none focus:border-sapphire-600 max-w-[200px] truncate"
        >
          <option value="All">All Departments</option>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d.split("(")[1]?.replace(")","") || d}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-cream-100 rounded-xl border border-stone-200/60 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 text-sapphire-600 animate-spin" /></div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-ink-500 text-sm">No students found matching your filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-cream-200/80 border-b border-stone-200/60">
                <tr>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-ink-500 uppercase tracking-wider">Student</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-ink-500 uppercase tracking-wider">Department</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-ink-500 uppercase tracking-wider">Year</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-ink-500 uppercase tracking-wider">LeetCode</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-ink-500 uppercase tracking-wider">Solved</th>
                  <th className="px-5 py-3.5 text-right text-[11px] font-semibold text-ink-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-cream-200/50 transition-colors">
                    <td className="px-5 py-3">
                      <div>
                        <p className="text-sm font-semibold text-ink-900">{student.name}</p>
                        <p className="text-[11px] font-medium text-ink-500 mt-0.5">{student.registerNumber}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-cream-200 text-ink-600 border border-stone-200/60">
                        {student.department.split("(")[1]?.replace(")","") || student.department}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-ink-600">{student.academicYear}</td>
                    <td className="px-5 py-3">
                      {student.leetCodeUsername ? (
                        <a href={student.leetCodeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-sapphire-800 hover:text-sapphire-900 bg-sapphire-100 px-2 py-1 rounded-md transition-colors border border-sapphire-200">
                          <Code2 className="w-3.5 h-3.5" /> {student.leetCodeUsername}
                        </a>
                      ) : (
                        <span className="text-xs text-stone-400">Not Linked</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {student.totalSolved !== undefined ? (
                        <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                          {student.totalSolved}
                        </span>
                      ) : (
                        <span className="text-xs text-stone-400">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right space-x-1">
                      <button onClick={() => handleEdit(student)} className="p-1.5 text-stone-400 hover:text-ink-900 hover:bg-cream-200 rounded-md transition-colors inline-block">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(student.id, student.name)} className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors inline-block">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-ink-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-cream-100 rounded-xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-stone-200/60 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink-900">{editingId ? "Edit Student" : "Add Student"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-cream-200 rounded-md text-stone-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-500 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 bg-cream-100 border border-stone-200/60 rounded-md text-sm outline-none focus:border-sapphire-600 focus:ring-4 focus:ring-sapphire-200/50 shadow-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-500 uppercase tracking-wider mb-1.5">Register Number</label>
                  <input type="text" value={formData.registerNumber} onChange={e=>setFormData({...formData, registerNumber: e.target.value})} className="w-full px-3 py-2 bg-cream-100 border border-stone-200/60 rounded-md text-sm outline-none focus:border-sapphire-600 focus:ring-4 focus:ring-sapphire-200/50 shadow-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-500 uppercase tracking-wider mb-1.5">Department</label>
                  <select value={formData.department} onChange={e=>setFormData({...formData, department: e.target.value})} className="w-full px-3 py-2 bg-cream-100 border border-stone-200/60 rounded-md text-sm outline-none shadow-sm text-ink-900 focus:border-sapphire-600 focus:ring-4 focus:ring-sapphire-200/50">
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-500 uppercase tracking-wider mb-1.5">Academic Year</label>
                  <select value={formData.academicYear} onChange={e=>setFormData({...formData, academicYear: e.target.value})} className="w-full px-3 py-2 bg-cream-100 border border-stone-200/60 rounded-md text-sm outline-none shadow-sm text-ink-900 focus:border-sapphire-600 focus:ring-4 focus:ring-sapphire-200/50">
                    {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-500 uppercase tracking-wider mb-1.5">Email Address</label>
                <input type="email" placeholder="student@shanmugha.edu.in" value={formData.email || ''} onChange={e=>setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 bg-cream-100 border border-stone-200/60 rounded-md text-sm outline-none focus:border-sapphire-600 focus:ring-4 focus:ring-sapphire-200/50 shadow-sm" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-500 uppercase tracking-wider mb-1.5">LeetCode Profile URL</label>
                <input type="text" placeholder="https://leetcode.com/username/" value={formData.leetCodeUrl} onChange={e=>setFormData({...formData, leetCodeUrl: e.target.value})} className="w-full px-3 py-2 bg-cream-100 border border-stone-200/60 rounded-md text-sm outline-none focus:border-sapphire-600 focus:ring-4 focus:ring-sapphire-200/50 shadow-sm" />
              </div>
              
              {!editingId && (
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-stone-200 mt-2">
                  <div>
                    <label className="block text-xs font-semibold text-ink-500 uppercase tracking-wider mb-1.5">Password</label>
                    <input type="password" value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} className="w-full px-3 py-2 bg-cream-100 border border-stone-200/60 rounded-md text-sm outline-none focus:border-sapphire-600 focus:ring-4 focus:ring-sapphire-200/50 shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink-500 uppercase tracking-wider mb-1.5">Confirm Password</label>
                    <input type="password" value={formData.confirmPassword} onChange={e=>setFormData({...formData, confirmPassword: e.target.value})} className="w-full px-3 py-2 bg-cream-100 border border-stone-200/60 rounded-md text-sm outline-none focus:border-sapphire-600 focus:ring-4 focus:ring-sapphire-200/50 shadow-sm" />
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-cream-200/80 border-t border-stone-200/60 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-cream-100 border border-stone-200 text-ink-600 text-sm font-medium rounded-lg hover:bg-cream-200 transition-colors shadow-sm">
                Cancel
              </button>
              <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-sapphire-800 text-cream-100 text-sm font-medium rounded-lg hover:bg-sapphire-900 transition-colors shadow-sm flex items-center gap-2">
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? "Save Changes" : "Add Student"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isImportModalOpen && (
        <AdvancedStudentImport 
          onClose={() => setIsImportModalOpen(false)} 
          onSuccess={() => {
            setIsImportModalOpen(false);
            loadStudents();
          }} 
        />
      )}

    </div>
  );
}
