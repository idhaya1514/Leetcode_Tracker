import { useState, useEffect } from "react";
import { Calendar, CheckCircle2, XCircle, Search, Download } from "lucide-react";
import { getStaffStudentsDetails } from "../../services/api";
import { useOutletContext } from "react-router";

export default function StaffAttendance() {
  const { staff } = useOutletContext<{ staff: any }>();
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (staff?.staffId) {
      loadStudents();
    }
  }, [staff]);

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const data = await getStaffStudentsDetails(staff.staffId);
      // Logic: The backend already sets isPresent = true if assignmentCompletions.length > 0 today
      setStudents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.registerNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const presentCount = students.filter(s => s.isPresent).length;
  const absentCount = students.length - presentCount;
  const attendancePercentage = students.length ? Math.round((presentCount / students.length) * 100) : 0;

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-500" /> Daily Attendance
          </h1>
          <p className="text-slate-500 text-sm mt-1">Automatically calculated based on LeetCode activity (1+ problem solved = Present).</p>
        </div>
        <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2">
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
          <p className="text-[13px] font-medium text-slate-500 mb-2">Overall Attendance</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-bold text-slate-800">{attendancePercentage}%</h2>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
            <div className={`h-1.5 rounded-full ${attendancePercentage > 85 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${attendancePercentage}%` }}></div>
          </div>
        </div>
        
        <div className="bg-emerald-50/50 rounded-xl border border-emerald-100 p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[13px] font-medium text-emerald-700">Present Today</p>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-bold text-emerald-800">{presentCount}</h2>
          <p className="text-xs text-emerald-600 mt-2 font-medium">Solved 1+ problems</p>
        </div>

        <div className="bg-rose-50/50 rounded-xl border border-rose-100 p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[13px] font-medium text-rose-700">Absent Today</p>
            <XCircle className="w-5 h-5 text-rose-500" />
          </div>
          <h2 className="text-3xl font-bold text-rose-800">{absentCount}</h2>
          <p className="text-xs text-rose-600 mt-2 font-medium">0 problems solved</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search students..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200/60 text-slate-600 text-sm rounded-lg outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-100 transition-all shadow-sm" 
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200/60 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200/60">
              <tr>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Today's Submissions</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Attendance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student, idx) => (
                <tr key={student.id || idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{student.name}</p>
                      <p className="text-[11px] font-medium text-slate-500 mt-0.5">{student.registerNumber}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-medium text-slate-700">{student.solvedToday} sum(s) solved</span>
                  </td>
                  <td className="px-5 py-4">
                    {student.isPresent ? (
                      <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-bold border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4" /> Present
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 px-2.5 py-1 rounded-md text-xs font-bold border border-rose-200">
                        <XCircle className="w-4 h-4" /> Absent
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

