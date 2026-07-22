const fs = require('fs');

const path = 'c:/Users/idhay/Downloads/Leetcode_Tracker/Sscet_Tracker/frontend/src/app/components/StudentManagement.tsx';

const content = `import { useState, useEffect, useMemo } from "react";
import {
  Plus, Edit2, Trash2, X, Users, Loader2, Search, 
  ChevronRight, ArrowLeft, Code2, Shield, Eye
} from "lucide-react";
import { getStudents, createStudent, updateStudent, deleteStudent } from "../services/api";
import { toast } from "sonner";

export const DEPARTMENTS = [
  "Artificial Intelligence and Data Science (AI&DS)",
  "Computer Science and Engineering (CSE)",
  "Cyber Security (CS)",
  "Information Technology (IT)",
  "Biomedical Engineering (BME)",
  "Electrical and Electronics Engineering (EEE)",
  "Electronics and Communication Engineering (ECE)",
  "Mechanical Engineering (MECH)",
  "Agricultural Engineering (AGRI)",
];

export const ACADEMIC_YEARS = [
  "First Year",
  "Second Year",
  "Third Year",
  "Final Year"
];

export interface StudentRecord {
  id: string;
  name: string;
  registerNumber: string;
  department: string;
  academicYear: string;
  email?: string;
  leetCodeUrl?: string;
  leetCodeUsername?: string;
  createdAt: string;
}

export default function StudentManagement() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const data = await getStudents();
      setStudents(data.map((s: any) => ({
        id: String(s.id),
        name: s.name,
        registerNumber: s.registerNumber,
        department: s.department,
        academicYear: s.academicYear || "First Year",
        email: s.email,
        leetCodeUrl: s.leetCodeUrl,
        leetCodeUsername: s.leetCodeUsername,
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
    if (!confirm(\`Delete \${name}?\`)) return;
    try {
      await deleteStudent(id);
      toast.success("Student deleted");
      loadStudents();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchSearch = !searchTerm || s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.registerNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchYear = filterYear === "All" || s.academicYear === filterYear;
      const matchDept = filterDept === "All" || s.department === filterDept;
      return matchSearch && matchYear && matchDept;
    });
  }, [students, searchTerm, filterYear, filterDept]);

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Student Directory</h1>
          <p className="text-slate-500 text-sm mt-1">Manage student records, credentials, and LeetCode mapping.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setEditingId(null);
              setFormData({name: "", registerNumber: "", department: DEPARTMENTS[0], academicYear: ACADEMIC_YEARS[0], email: "", leetCodeUrl: "", leetCodeUsername: "", password: "", confirmPassword: ""});
              setIsModalOpen(true);
            }} 
            className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Student
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search name or register number..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200/60 text-slate-600 text-sm rounded-lg outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-100 transition-all shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] placeholder:text-slate-400" 
          />
        </div>
        <select 
          value={filterYear} 
          onChange={e => setFilterYear(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200/60 text-slate-600 text-sm rounded-lg shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] outline-none"
        >
          <option value="All">All Years</option>
          {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select 
          value={filterDept} 
          onChange={e => setFilterDept(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200/60 text-slate-600 text-sm rounded-lg shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] outline-none max-w-[200px] truncate"
        >
          <option value="All">All Departments</option>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d.split("(")[1]?.replace(")","") || d}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/60 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">No students found matching your filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/80 border-b border-slate-200/60">
                <tr>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Year</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">LeetCode</th>
                  <th className="px-5 py-3.5 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{student.name}</p>
                        <p className="text-[11px] font-medium text-slate-500 mt-0.5">{student.registerNumber}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200/60">
                        {student.department.split("(")[1]?.replace(")","") || student.department}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-600">{student.academicYear}</td>
                    <td className="px-5 py-3">
                      {student.leetCodeUsername ? (
                        <a href={student.leetCodeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md transition-colors border border-indigo-100">
                          <Code2 className="w-3.5 h-3.5" /> {student.leetCodeUsername}
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">Not Linked</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right space-x-1">
                      <button onClick={() => handleEdit(student)} className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors inline-block">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(student.id, student.name)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors inline-block">
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-200/60 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">{editingId ? "Edit Student" : "Add Student"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-md text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200/60 rounded-md text-sm outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-100 shadow-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Register Number</label>
                  <input type="text" value={formData.registerNumber} onChange={e=>setFormData({...formData, registerNumber: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200/60 rounded-md text-sm outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-100 shadow-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Department</label>
                  <select value={formData.department} onChange={e=>setFormData({...formData, department: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200/60 rounded-md text-sm outline-none shadow-sm">
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Academic Year</label>
                  <select value={formData.academicYear} onChange={e=>setFormData({...formData, academicYear: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200/60 rounded-md text-sm outline-none shadow-sm">
                    {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">LeetCode Profile URL</label>
                <input type="text" placeholder="https://leetcode.com/username/" value={formData.leetCodeUrl} onChange={e=>setFormData({...formData, leetCodeUrl: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200/60 rounded-md text-sm outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-100 shadow-sm" />
              </div>
              
              {!editingId && (
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 mt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
                    <input type="password" value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200/60 rounded-md text-sm outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-100 shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Confirm Password</label>
                    <input type="password" value={formData.confirmPassword} onChange={e=>setFormData({...formData, confirmPassword: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200/60 rounded-md text-sm outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-100 shadow-sm" />
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-200/60 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
                Cancel
              </button>
              <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2">
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? "Save Changes" : "Add Student"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync(path, content);
console.log("Updated StudentManagement to modern Vercel/Linear table!");
