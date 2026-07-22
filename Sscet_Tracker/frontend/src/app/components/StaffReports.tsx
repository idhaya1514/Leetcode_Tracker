import { useState, useEffect } from "react";
import { BarChart, Download, FileText, Table as TableIcon, Calendar, Filter } from "lucide-react";
import { toast } from "sonner";
import { getStudents } from "../services/api";

export default function StaffReports() {
  const [students, setStudents] = useState<any[]>([]);
  const [reportType, setReportType] = useState("daily"); // daily, weekly, monthly
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadStudents();
  }, [reportType]);

  const loadStudents = async () => {
    try {
      const data = await getStudents();
      // Generate mock stats based on report type
      const mapped = data.slice(0, 35).map((s: any) => {
        let multiplier = reportType === 'daily' ? 1 : reportType === 'weekly' ? 7 : 30;
        return {
          ...s,
          stats: {
            tasksAssigned: multiplier,
            tasksCompleted: Math.floor(Math.random() * (multiplier + 1)),
            attendance: Math.floor(Math.random() * 20) + 80, // 80-100%
            totalSolved: Math.floor(Math.random() * (5 * multiplier)),
          }
        };
      });
      setStudents(mapped);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownload = (format: 'pdf' | 'excel') => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      toast.success(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report downloaded as ${format.toUpperCase()} successfully!`);
    }, 2000);
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart className="w-6 h-6 text-indigo-500" /> Export Reports
          </h1>
          <p className="text-slate-500 text-sm mt-1">Generate and download performance reports for your assigned students.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleDownload('pdf')}
            disabled={isGenerating}
            className="px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 text-sm font-semibold rounded-lg hover:bg-rose-100 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            <FileText className="w-4 h-4" /> Download PDF
          </button>
          <button 
            onClick={() => handleDownload('excel')}
            disabled={isGenerating}
            className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-semibold rounded-lg hover:bg-emerald-100 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            <TableIcon className="w-4 h-4" /> Download Excel
          </button>
        </div>
      </div>

      {/* Report Configuration */}
      <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1 w-full flex items-center gap-4">
            <div className="p-2.5 bg-slate-100 rounded-lg text-slate-500">
              <Filter className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Report Duration</label>
              <div className="flex bg-slate-100 p-1 rounded-lg w-full max-w-md">
                {['daily', 'weekly', 'monthly'].map(type => (
                  <button
                    key={type}
                    onClick={() => setReportType(type)}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${
                      reportType === type ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="h-12 w-px bg-slate-200 hidden md:block"></div>
          
          <div className="flex-1 w-full flex items-center gap-4">
            <div className="p-2.5 bg-slate-100 rounded-lg text-slate-500">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Selected Period</label>
              <p className="text-sm font-semibold text-slate-800">
                {reportType === 'daily' && new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}
                {reportType === 'weekly' && "Past 7 Days"}
                {reportType === 'monthly' && "Past 30 Days"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Preview */}
      <div className="bg-white rounded-xl border border-slate-200/60 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800 text-sm">Report Data Preview</h3>
          <span className="text-xs font-medium text-slate-500">{students.length} Records</span>
        </div>
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white sticky top-0 border-b border-slate-200 shadow-sm z-10">
              <tr>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Student Name</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Register No</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tasks Assigned</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tasks Completed</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Sums Solved</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Attendance %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student, idx) => (
                <tr key={student.id || idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="text-sm font-semibold text-slate-900">{student.name}</p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-[12px] font-medium text-slate-600">{student.registerNumber}</p>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-700 font-medium">{student.stats.tasksAssigned}</td>
                  <td className="px-5 py-3 text-sm font-medium">
                    <span className={student.stats.tasksCompleted === student.stats.tasksAssigned ? "text-emerald-600" : "text-amber-600"}>
                      {student.stats.tasksCompleted}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-700 font-medium">{student.stats.totalSolved}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-100 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${student.stats.attendance >= 90 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${student.stats.attendance}%` }}></div>
                      </div>
                      <span className="text-xs font-semibold text-slate-600">{student.stats.attendance}%</span>
                    </div>
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
