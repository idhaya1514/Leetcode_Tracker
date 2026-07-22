import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, BarChart2, TrendingUp, Users, Activity, Trophy, Filter } from "lucide-react";
import { getStudents, getLeetCodeAttendanceMap } from "../services/api";
import { DEPARTMENTS } from "../constants";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";

interface StudentPerformanceProps {
  onBack: () => void;
}

const DEPT_SHORT: Record<string, string> = {
  "Artificial Intelligence and Data Science (AI&DS)": "AI&DS",
  "Computer Science and Engineering (CSE)": "CSE",
  "Cyber Security (CS)": "CS",
  "Information Technology (IT)": "IT",
  "Biomedical Engineering (BME)": "BME",
  "Electrical and Electronics Engineering (EEE)": "EEE",
  "Electronics and Communication Engineering (ECE)": "ECE",
  "Mechanical Engineering (MECH)": "MECH",
  "Agricultural Engineering (AGRI)": "AGRI",
};

const ACADEMIC_YEARS = [
  "First Year", "Second Year", "Third Year", "Final Year"
];

export default function StudentPerformance({ onBack }: StudentPerformanceProps) {
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, Set<string>>>({});
  const [isLoading, setIsLoading] = useState(true);

  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [studentsList, attMap] = await Promise.all([
        getStudents(),
        getLeetCodeAttendanceMap(),
      ]);
      setStudents(studentsList);
      setAttendanceMap(attMap);
    } catch (error: any) {
      toast.error("Failed to load performance data: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      if (selectedDept !== "All" && s.department !== selectedDept) return false;
      if (selectedYear !== "All" && s.academicYear !== selectedYear) return false;
      return true;
    });
  }, [students, selectedDept, selectedYear]);

  // Calculate stats
  const totalStudents = filteredStudents.length;
  const linkedProfiles = filteredStudents.filter(s => s.leetCodeUsername).length;

  // Dept Registration Stats
  const deptRegistrationData = useMemo(() => {
    const deptsToMap = selectedDept === "All" ? DEPARTMENTS : [selectedDept];
    return deptsToMap.map(dept => {
      const deptStudents = filteredStudents.filter(s => s.department === dept);
      const linked = deptStudents.filter(s => s.leetCodeUsername).length;
      return {
        name: DEPT_SHORT[dept] || dept,
        total: deptStudents.length,
        linked: linked,
        unlinked: deptStudents.length - linked,
      };
    });
  }, [filteredStudents, selectedDept]);

  // Leaderboard (Top 10 active students based on days present)
  const leaderboard = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.values(attendanceMap).forEach(set => {
      set.forEach(regNo => {
        counts[regNo] = (counts[regNo] || 0) + 1;
      });
    });

    const activeStudents = filteredStudents
      .filter(s => counts[s.registerNumber] > 0)
      .map(s => ({
        ...s,
        daysActive: counts[s.registerNumber]
      }))
      .sort((a, b) => b.daysActive - a.daysActive)
      .slice(0, 10);

    return activeStudents;
  }, [filteredStudents, attendanceMap]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">LeetCode Analytics</h1>
                <p className="text-slate-500 text-sm mt-1">Track engagement and consistency across departments.</p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200/60 shadow-sm">
              <div className="flex items-center gap-2 px-3 border-r border-slate-200">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filters</span>
              </div>
              <select 
                value={selectedDept}
                onChange={e => setSelectedDept(e.target.value)}
                className="bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer py-1 pr-2"
              >
                <option value="All">All Departments</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{DEPT_SHORT[d] || d}</option>)}
              </select>
              <select 
                value={selectedYear}
                onChange={e => setSelectedYear(e.target.value)}
                className="bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer py-1 pr-2"
              >
                <option value="All">All Years</option>
                {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all duration-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-slate-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-1.5 rounded-md bg-indigo-50">
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-[13px] font-medium text-slate-500 mb-2">Filtered Enrollment</p>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-800">{totalStudents}</h2>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all duration-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-slate-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-1.5 rounded-md bg-emerald-50">
                <Activity className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-[13px] font-medium text-slate-500 mb-2">Linked Profiles</p>
                <h2 className="text-2xl font-semibold tracking-tight text-emerald-600">{linkedProfiles}</h2>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all duration-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-slate-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-1.5 rounded-md bg-orange-50">
                <TrendingUp className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-[13px] font-medium text-slate-500 mb-2">Total Active Days</p>
                <h2 className="text-2xl font-semibold tracking-tight text-orange-600">{Object.keys(attendanceMap).length}</h2>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Chart */}
          <div className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
            <h3 className="text-base font-semibold text-slate-800 mb-6">Linked Profiles by Department</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptRegistrationData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <RechartsTooltip 
                    cursor={{ fill: 'rgba(99,102,241,0.05)' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="linked" name="Linked Profiles" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                  <Bar dataKey="unlinked" name="Unlinked Profiles" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
            <div className="flex items-center gap-2 mb-6">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <h3 className="text-base font-semibold text-slate-800">Most Consistent Students</h3>
            </div>
            
            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2">
              {leaderboard.length === 0 ? (
                <div className="py-10 text-center text-slate-400">No active students found in this filter yet.</div>
              ) : (
                leaderboard.map((s, idx) => (
                  <div key={s.id || s.registerNumber} className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200/60 hover:border-slate-300 transition-colors shadow-sm mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        idx === 0 ? "bg-yellow-100 text-yellow-700" :
                        idx === 1 ? "bg-slate-200 text-slate-700" :
                        idx === 2 ? "bg-orange-100 text-orange-700" :
                        "bg-indigo-50 text-indigo-600"
                      }`}>
                        #{idx + 1}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{s.name}</p>
                        <p className="text-[10px] text-slate-500">{DEPT_SHORT[s.department] || s.department} - {s.academicYear}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">{s.daysActive} days</p>
                      <p className="text-[10px] text-slate-400 uppercase">Active</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
