import { useState, useEffect } from "react";
import { Users, Search, ChevronRight, Activity, Target } from "lucide-react";
import { toast } from "sonner";
import { useOutletContext } from "react-router";
import { getStaffStudentsDetails } from "../../services/api";

export default function StaffStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { staff } = useOutletContext<{ staff: any }>();

  useEffect(() => {
    if (staff?.staffId) {
      loadStudents();
    }
  }, [staff]);

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      if (!staff?.staffId && !staff?.id) return;
      const myStudents = await getStaffStudentsDetails(staff?.staffId || staff?.id);
      setStudents(myStudents);
    } catch (error: any) {
      toast.error("Failed to load students");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.registerNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">My Students</h1>
          <p className="text-slate-500 text-sm mt-1">Detailed view of all students assigned to you.</p>
        </div>
      </div>

      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search name or register number..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200/60 text-slate-600 text-sm rounded-lg outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-100 transition-all shadow-sm placeholder:text-slate-400" 
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200/60 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500">Loading students...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/80 border-b border-slate-200/60">
                <tr>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Department & Year</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Attendance Status</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Today's Progress</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Performance</th>
                  <th className="px-5 py-3.5 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student, idx) => (
                  <tr key={student.id || idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{student.name}</p>
                        <p className="text-[11px] font-medium text-slate-500 mt-0.5">{student.registerNumber}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div>
                        <p className="text-[12px] font-medium text-slate-700">{student.department?.split("(")[1]?.replace(")","") || student.department}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{student.academicYear || "I"} - Sec A</p>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {student.isPresent ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Present
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-rose-50 text-rose-700 border border-rose-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Absent
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-slate-700">{student.todaySolved || 0} Solved</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-full max-w-[100px] bg-slate-100 rounded-full h-1.5">
                          <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${student.performance || 0}%` }}></div>
                        </div>
                        <span className="text-xs font-medium text-slate-600">{student.performance || 0}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors">View Profile</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

