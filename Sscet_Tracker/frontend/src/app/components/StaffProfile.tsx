import { User, Shield, Briefcase, Hash, LogOut } from "lucide-react";
import { useNavigate } from "react-router";

export default function StaffProfile({ staff, onLogout }: any) {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <User className="w-6 h-6 text-indigo-500" /> Staff Profile
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage your staff account details.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/60 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-blue-600"></div>
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="w-24 h-24 bg-white rounded-2xl p-1 shadow-lg">
              <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center text-white text-3xl font-bold">
                {staff?.name?.charAt(0) || "S"}
              </div>
            </div>
            <button 
              onClick={() => { onLogout(); navigate('/'); }}
              className="px-4 py-2 bg-rose-50 text-rose-600 font-semibold text-sm rounded-lg hover:bg-rose-100 transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Full Name</p>
                <div className="flex items-center gap-2 text-slate-800 font-medium">
                  <User className="w-4 h-4 text-slate-400" /> {staff?.name || "Staff Member"}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Staff ID</p>
                <div className="flex items-center gap-2 text-slate-800 font-medium">
                  <Hash className="w-4 h-4 text-slate-400" /> {staff?.id || "STF-2023-041"}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Department</p>
                <div className="flex items-center gap-2 text-slate-800 font-medium">
                  <Briefcase className="w-4 h-4 text-slate-400" /> {staff?.department || "Computer Science and Engineering"}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Assigned Students</p>
                <div className="flex items-center gap-2 text-slate-800 font-medium">
                  <Shield className="w-4 h-4 text-slate-400" /> 35 Students
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
