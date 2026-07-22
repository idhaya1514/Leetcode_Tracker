import { useState, useEffect } from "react";
import { Bell, CheckCircle2, MessageSquare, AlertCircle } from "lucide-react";
import { getStudents } from "../services/api";

export default function StaffNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await getStudents();
      // Generate some mock notifications (task completion messages)
      const notifs = data.slice(0, 15).map((s: any, i: number) => {
        const isIssue = i % 7 === 0;
        return {
          id: i,
          type: isIssue ? 'issue' : 'completion',
          message: isIssue 
            ? `${s.name} raised an issue regarding LeetCode sync.`
            : `${s.name} successfully completed Today's Task!`,
          time: `${Math.floor(Math.random() * 5) + 1} hours ago`,
          student: s
        };
      });
      setNotifications(notifs);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-indigo-500" /> Notifications & Messages
          </h1>
          <p className="text-slate-500 text-sm mt-1">Live updates on student task completions and raised issues.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/60 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] overflow-hidden">
        <div className="divide-y divide-slate-100">
          {notifications.map((notif) => (
            <div key={notif.id} className="p-4 hover:bg-slate-50/50 transition-colors flex items-start gap-4">
              <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${notif.type === 'completion' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                {notif.type === 'completion' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">{notif.message}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-500">{notif.time}</span>
                  <span className="text-xs text-slate-300">•</span>
                  <span className="text-xs font-medium text-slate-500">{notif.student.registerNumber}</span>
                </div>
              </div>
              {notif.type === 'issue' && (
                <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded">
                  <MessageSquare className="w-3 h-3" /> Reply
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
