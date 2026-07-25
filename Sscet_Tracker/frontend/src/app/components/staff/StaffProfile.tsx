import { User, Shield, Briefcase, Hash, LogOut, Mail, CheckCircle2, ChevronRight, Users, Building2 } from "lucide-react";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { getStaffDashboardMetrics } from "../../services/api";

export default function StaffProfile({ staff, onLogout }: any) {
  const navigate = useNavigate();
  const [studentCount, setStudentCount] = useState<number>(staff?.assignedStudents?.length || staff?.assignedStudentCount || 0);

  useEffect(() => {
    if (staff && (staff.staffId || staff.id)) {
      getStaffDashboardMetrics(staff.staffId || staff.id)
        .then(data => {
          if (data && typeof data.totalStudents === 'number') {
            setStudentCount(data.totalStudents);
          }
        })
        .catch(console.error);
    }
  }, [staff]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Staff Profile</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your account settings and preferences.</p>
        </div>
      </div>

      {/* Main Profile Container */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Sleek Minimalist Banner */}
        <div className="h-32 bg-slate-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900"></div>
          <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/10 to-transparent"></div>
        </div>
        
        <div className="px-6 sm:px-10 pb-10">
          {/* Avatar and Actions row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end -mt-12 mb-8 gap-4 relative z-10">
            <div className="relative">
              {/* Circular Avatar */}
              <div className="w-24 h-24 bg-white rounded-full p-1 shadow-sm ring-1 ring-slate-200">
                <div className="w-full h-full bg-gradient-to-b from-indigo-50 to-slate-100 rounded-full flex items-center justify-center text-indigo-600 text-3xl font-semibold border border-slate-200/60">
                  {staff?.name?.charAt(0) || "S"}
                </div>
              </div>
              <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
            </div>

            <button 
              onClick={() => { onLogout(); navigate('/'); }}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium text-sm rounded-lg hover:bg-slate-50 hover:text-rose-600 transition-colors flex items-center gap-2 shadow-sm"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>

          {/* Profile Name & Badge */}
          <div className="mb-10">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
              {staff?.name || "Staff Member"}
              <CheckCircle2 className="w-5 h-5 text-indigo-500" />
            </h2>
            <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-slate-400" /> Staff Member
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-400" /> {staff?.department?.name || staff?.department || "No Department"}
              </span>
            </div>
          </div>

          <hr className="border-slate-100 mb-8" />

          {/* Details Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
            
            {/* Personal Information */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Personal Information</h3>
              <div className="space-y-4">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-slate-100">
                  <div className="flex items-center gap-3 text-slate-500 mb-1 sm:mb-0">
                    <User className="w-4 h-4" />
                    <span className="text-sm">Full Name</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900">{staff?.name || "Staff Member"}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-slate-100">
                  <div className="flex items-center gap-3 text-slate-500 mb-1 sm:mb-0">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">Email Address</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900">{staff?.email || "No email provided"}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-slate-100">
                  <div className="flex items-center gap-3 text-slate-500 mb-1 sm:mb-0">
                    <Hash className="w-4 h-4" />
                    <span className="text-sm">Staff ID</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900">{staff?.staffId || staff?.id || "N/A"}</span>
                </div>

              </div>
            </div>

            {/* Academic Information */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Role & Responsibilities</h3>
              <div className="space-y-4">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-slate-100">
                  <div className="flex items-center gap-3 text-slate-500 mb-1 sm:mb-0">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm">Account Type</span>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                    Faculty
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-slate-100">
                  <div className="flex items-center gap-3 text-slate-500 mb-1 sm:mb-0">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Assigned Students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900">{studentCount} Students</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

