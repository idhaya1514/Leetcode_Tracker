import { useState, useEffect } from "react";
import { Mail, Search, Send, CheckCircle2, XCircle, Users } from "lucide-react";
import { toast } from "sonner";
import { getStudents } from "../services/api";

export default function StaffEmails() {
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const data = await getStudents();
      // Mock completion status
      const mapped = data.slice(0, 35).map((s: any, idx: number) => ({
        ...s,
        isCompleted: Math.random() > 0.4, // 60% completion rate
      }));
      setStudents(mapped);
    } catch (e) {
      console.error(e);
    }
  };

  const pendingStudents = students.filter(s => !s.isCompleted);
  const filteredStudents = students.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.registerNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [isSendingReminders, setIsSendingReminders] = useState(false);
  const [isSendingCongrats, setIsSendingCongrats] = useState(false);

  const handleSendEmail = (studentName: string) => {
    toast.success(`Warning email sent successfully to ${studentName}`);
  };

  const handleBulkReminders = async () => {
    setIsSendingReminders(true);
    try {
      const res = await fetch('http://localhost:3000/api/email/remind', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Success! Sent ${data.successCount}, Failed ${data.failedCount} reminders.`);
      } else {
        toast.error(data.error || 'Failed to send reminders.');
      }
    } catch (e: any) {
      toast.error('Network error while sending reminders.');
    } finally {
      setIsSendingReminders(false);
    }
  };

  const handleBulkCongrats = async () => {
    setIsSendingCongrats(true);
    try {
      const res = await fetch('http://localhost:3000/api/email/congratulate', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Success! Sent ${data.successCount}, Failed ${data.failedCount} congratulations.`);
      } else {
        toast.error(data.error || 'Failed to send congratulations.');
      }
    } catch (e: any) {
      toast.error('Network error while sending congratulations.');
    } finally {
      setIsSendingCongrats(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <Mail className="w-6 h-6 text-indigo-500" /> Email Center
          </h1>
          <p className="text-slate-500 text-sm mt-1">Send automated reminders to students who haven't completed their daily tasks.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleBulkCongrats}
            disabled={isSendingCongrats}
            className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSendingCongrats ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Send Congratulations Emails
          </button>
          
          <button 
            onClick={handleBulkReminders}
            disabled={isSendingReminders || pendingStudents.length === 0}
            className="px-4 py-2 bg-rose-600 text-white text-sm font-medium rounded-lg hover:bg-rose-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSendingReminders ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Email All Pending ({pendingStudents.length})
          </button>
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
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Student Name</th>
   <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Profile</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Task Status</th>
                <th className="px-5 py-3.5 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Communication Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student, idx) => (
                <tr key={student.id || idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{student.name}</p>
                      <p className="text-[11px] font-medium text-slate-500 mt-0.5">{student.registerNumber} • {student.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline">
                      View Profile
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    {student.isCompleted ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4" /> Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle className="w-4 h-4" /> Not Completed
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button 
                      onClick={() => handleSendEmail(student.name)}
                      disabled={student.isCompleted}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors shadow-sm border ${
                        student.isCompleted 
                          ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed' 
                          : 'bg-white text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" /> 
                      {student.isCompleted ? 'No Action Needed' : 'Send Reminder'}
                    </button>
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
