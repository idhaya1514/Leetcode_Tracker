import { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Search,
  Loader2,
  Users,
  CheckCircle,
  Filter,
} from "lucide-react";
import { DEPARTMENTS } from "../../constants";
import {
  getStudents,
  getLeetCodeAttendanceMap,
} from "../../services/api";
import { toast } from "sonner";

interface DailyTrackerProps {
  onBack: () => void;
}

interface StudentInfo {
  id: string;
  name: string;
  registerNumber: string;
  department: string;
  createdAt: string;
}

const DEPT_COLORS: Record<string, string> = {
  "Artificial Intelligence and Data Science": "bg-violet-50 text-violet-700 border-violet-150",
  "Computer Science": "bg-blue-50 text-blue-700 border-blue-150",
  "Information Technology": "bg-emerald-50 text-emerald-700 border-emerald-150",
  "Cyber Security": "bg-rose-50 text-rose-700 border-rose-150",
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function DailyTracker({ onBack }: DailyTrackerProps) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(formatDateKey(today));
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterDept, setFilterDept] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [attendanceMap, setAttendanceMap] = useState<Record<string, Set<string>>>({});

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
      setStudents(
        studentsList.map((s: any) => ({
          id: String(s.id),
          name: s.name,
          registerNumber: s.registerNumber,
          department: s.department,
          createdAt: s.createdAt ? formatDateKey(new Date(s.createdAt)) : "2000-01-01",
        }))
      );
      setAttendanceMap(attMap);
    } catch (error: any) {
      toast.error("Failed to load data: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const deptOk = filterDept === "all" || s.department === filterDept;
      const searchOk =
        !searchTerm ||
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.registerNumber.toLowerCase().includes(searchTerm.toLowerCase());
      return deptOk && searchOk;
    });
  }, [students, filterDept, searchTerm]);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const todayKey = formatDateKey(today);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else setCurrentMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else setCurrentMonth((m) => m + 1);
  };

  const activeDates = Object.keys(attendanceMap).filter(key => attendanceMap[key].size > 0);
  activeDates.sort();
  const lastActiveDateKey = activeDates.length > 0 ? activeDates[activeDates.length - 1] : null;

  return (
    <div className="min-h-screen bg-cream-50 p-4 md:p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-cream-100/80 backdrop-blur-xl rounded-2xl border border-stone-200/50 shadow-sm p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="p-2 bg-cream-200 text-ink-600 rounded-xl hover:bg-cream-300 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-ink-900">Daily Tracker</h1>
                <p className="text-sm text-ink-500">Monitor student LeetCode attendance.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-cream-100/80 backdrop-blur-xl rounded-2xl border border-stone-200/50 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-ink-900">Calendar</h3>
                <div className="flex items-center gap-2">
                  <button onClick={prevMonth} className="p-1.5 hover:bg-cream-200 rounded-lg text-ink-600"><ChevronLeft className="w-4 h-4" /></button>
                  <span className="text-sm font-semibold text-ink-700 min-w-[100px] text-center">{MONTH_NAMES[currentMonth]} {currentYear}</span>
                  <button onClick={nextMonth} className="p-1.5 hover:bg-cream-200 rounded-lg text-ink-600"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="text-center text-[10px] font-bold text-stone-400 uppercase tracking-wider py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-10" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateKey = formatDateKey(new Date(currentYear, currentMonth, day));
                  const isSelected = selectedDate === dateKey;
                  const isToday = todayKey === dateKey;
                  const activeSet = attendanceMap[dateKey];
                  const hasData = activeSet && activeSet.size > 0;
                  const isFuture = dateKey > todayKey;

                  return (
                    <button
                      key={day}
                      disabled={isFuture}
                      onClick={() => setSelectedDate(dateKey)}
                      className={`h-10 rounded-xl relative transition-all ${
                        isFuture ? "opacity-30 cursor-not-allowed" :
                        isSelected ? "bg-sapphire-800 text-cream-100 shadow-md" :
                        "hover:bg-cream-200 text-ink-700"
                      }`}
                    >
                      <span className={`text-sm ${isToday && !isSelected ? "font-bold text-sapphire-800" : "font-medium"}`}>{day}</span>
                      {hasData && (
                        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                          <div className={`w-1 h-1 rounded-full ${isSelected ? "bg-white/80" : "bg-emerald-500"}`} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="bg-cream-100/80 backdrop-blur-xl rounded-2xl border border-stone-200/50 shadow-sm p-5">
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-sapphire-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-sapphire-800" />
                  </div>
                  <div>
                    <h3 className="font-bold text-ink-900">Quick Stats</h3>
                    <p className="text-xs text-ink-500">Overall LeetCode tracking</p>
                  </div>
               </div>
               <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-xl bg-cream-200 border border-stone-200">
                    <span className="text-sm font-medium text-ink-600">Total Students Tracking</span>
                    <span className="text-sm font-bold text-ink-900">{students.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-cream-200 border border-stone-200">
                    <span className="text-sm font-medium text-ink-600">Last Active Tracking Day</span>
                    <span className="text-sm font-bold text-ink-900">{lastActiveDateKey || "None"}</span>
                  </div>
               </div>
            </div>
          </div>

          <div className="lg:col-span-8 flex flex-col min-h-0 bg-cream-100/80 backdrop-blur-xl rounded-2xl border border-stone-200/50 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-ink-900 text-lg">
                  {selectedDate ? new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }) : "Select a date"}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-48 pl-9 pr-3 py-2 bg-cream-200 border border-stone-200 rounded-xl text-sm outline-none focus:border-sapphire-600 focus:ring-2 focus:ring-sapphire-200 transition-all"
                  />
                </div>
                <div className="relative">
                  <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <select
                    value={filterDept}
                    onChange={(e) => setFilterDept(e.target.value)}
                    className="pl-9 pr-8 py-2 bg-cream-200 border border-stone-200 rounded-xl text-sm outline-none focus:border-sapphire-600 appearance-none transition-all cursor-pointer text-ink-600"
                  >
                    <option value="all">All Depts</option>
                    {DEPARTMENTS.map((d) => {
                      const short = d;
                      return <option key={d} value={d}>{short}</option>;
                    })}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 bg-cream-50">
              {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center text-stone-400">
                  <Loader2 className="w-8 h-8 animate-spin mb-4 text-sapphire-600" />
                  <p>Loading attendance data...</p>
                </div>
              ) : !selectedDate ? (
                <div className="h-full flex flex-col items-center justify-center text-stone-400">
                  <Calendar className="w-12 h-12 mb-4 opacity-20" />
                  <p>Select a date from the calendar</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-stone-400">
                  <Users className="w-12 h-12 mb-4 opacity-20" />
                  <p>No students match your filters</p>
                </div>
              ) : (
                <div className="grid gap-2">
                  {filteredStudents.map((s) => {
                    const activeSet = attendanceMap[selectedDate];
                    const isPresent = activeSet && activeSet.has(s.registerNumber);
                    const isBeforeJoin = selectedDate < s.createdAt;
                    return (
                      <div
                        key={s.id}
                        className={`flex items-center justify-between p-4 rounded-xl border border-stone-200 bg-cream-100 transition-all hover:shadow-sm ${
                          isBeforeJoin ? "opacity-50 grayscale" : ""
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                            isBeforeJoin ? "bg-cream-200 text-stone-400" :
                            isPresent ? "bg-emerald-100 text-emerald-700" :
                            "bg-rose-100 text-rose-700"
                          }`}>
                            {s.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-ink-900">{s.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-mono bg-cream-200 text-ink-600 px-1.5 py-0.5 rounded uppercase border border-stone-200">
                                {s.registerNumber}
                              </span>
                              <span className="text-[10px] font-medium text-ink-500 truncate max-w-[120px]">
                                {s.department}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {isBeforeJoin ? (
                            <span className="text-xs font-medium text-stone-400 bg-cream-200 px-3 py-1 rounded-full">
                              Not Enrolled
                            </span>
                          ) : isPresent ? (
                            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                              <CheckCircle className="w-4 h-4" /> Present
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
                              <X className="w-4 h-4" /> Absent
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

