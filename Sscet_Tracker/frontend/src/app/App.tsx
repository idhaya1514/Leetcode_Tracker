import { useState, useEffect, Suspense, lazy } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router";
import { Toaster } from "./components/ui/sonner";
import { getStudent, supabase, updateStudentPassword } from "./services/api";

const LoginPage = lazy(() => import("./components/LoginPage"));
const AdminPanel = lazy(() => import("./components/AdminPanel"));
const StudentManagement = lazy(() => import("./components/StudentManagement"));
const StudentPerformance = lazy(() => import("./components/StudentPerformance"));
const StudentDashboard = lazy(() => import("./components/StudentDashboard"));
const StaffManagement = lazy(() => import("./components/StaffManagement"));
const StudentAssignment = lazy(() => import("./components/StudentAssignment"));
const StaffDashboard = lazy(() => import("./components/StaffDashboard"));
const StaffStudents = lazy(() => import("./components/StaffStudents"));
const StaffLeetCode = lazy(() => import("./components/StaffLeetCode"));
const StaffAttendance = lazy(() => import("./components/StaffAttendance"));
const StaffProgress = lazy(() => import("./components/StaffProgress"));
const StaffTasks = lazy(() => import("./components/StaffTasks"));
const StaffEmails = lazy(() => import("./components/StaffEmails"));
const StaffReports = lazy(() => import("./components/StaffReports"));
const StaffNotifications = lazy(() => import("./components/StaffNotifications"));
const StaffProfile = lazy(() => import("./components/StaffProfile"));
const StaffSettings = lazy(() => import("./components/StaffSettings"));

const AdminSettings = lazy(() => import("./components/AdminSettings"));
const AdminLayout = lazy(() => import("./components/layouts/AdminLayout"));
const StaffLayout = lazy(() => import("./components/layouts/StaffLayout"));
const StudentLayout = lazy(() => import("./components/layouts/StudentLayout"));

export interface Student {
  name: string;
  registerNumber: string;
  department: string;
  email?: string;
  leetCodeUsername?: string;
}

export default function App() {
  const [student, setStudent] = useState<Student | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [staff, setStaff] = useState<any>(null);
  const navigate = useNavigate();

  // On mount: restore sessions
  useEffect(() => {
    const savedStudent = localStorage.getItem("currentStudent");
    if (savedStudent) {
      try {
        const parsed = JSON.parse(savedStudent);
        getStudent(parsed.registerNumber)
          .then((dbStudent) => {
            setStudent({
              name: dbStudent.name,
              registerNumber: dbStudent.registerNumber,
              department: dbStudent.department,
              email: dbStudent.email,
              leetCodeUsername: dbStudent.leetCodeUsername,
            });
          })
          .catch(() => {
            localStorage.removeItem("currentStudent");
          });
      } catch {
        localStorage.removeItem("currentStudent");
      }
    }

    const adminSession = sessionStorage.getItem("adminLoggedIn");
    if (adminSession === "true") {
      setIsAdminLoggedIn(true);
    }

    if (supabase) {
      const { data: authListener } = (supabase as any).auth.onAuthStateChange(
        async (event: any, session: any) => {
          if (event === "PASSWORD_RECOVERY") {
            const newPassword = prompt(
              "Password Recovery Mode: Please enter your new password (min 6 characters):",
            );
            if (newPassword && newPassword.length >= 6) {
              try {
                await updateStudentPassword(newPassword);
                alert(
                  "Password updated successfully! You can now log in with your new password.",
                );
              } catch (err: any) {
                alert("Failed to update password: " + err.message);
              }
            }
            window.location.hash = "";
            navigate("/");
          }
        },
      );
      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, [navigate]);

  const handleStudentLogin = (studentData: Student) => {
    setStudent(studentData);
    localStorage.setItem("currentStudent", JSON.stringify(studentData));
    navigate("/student");
  };

  const handleStudentLogout = () => {
    setStudent(null);
    localStorage.removeItem("currentStudent");
  };

  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
    sessionStorage.setItem("adminLoggedIn", "true");
    navigate("/admin");
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem("adminLoggedIn");
  };

  const handleStaffLogin = (staffData: any) => {
    setStaff(staffData);
    navigate("/staff");
  };

  const handleStaffLogout = () => {
    setStaff(null);
  };

  return (
    <>
      <Toaster position="top-center" />
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-slate-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>}>
        <Routes>
          {/* Public Login */}
          <Route 
            path="/" 
            element={
              <LoginPage 
                onStudentLogin={handleStudentLogin} 
                onAdminLogin={handleAdminLogin} 
                onStaffLogin={handleStaffLogin} 
              />
            } 
          />

          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={isAdminLoggedIn ? <AdminLayout onLogout={handleAdminLogout} /> : <Navigate to="/" />}
          >
            <Route index element={<AdminPanel onLogout={handleAdminLogout} onNavigate={() => {}} />} />
            <Route path="students" element={<StudentManagement />} />
            <Route path="staff" element={<StaffManagement />} />
            <Route path="assignment" element={<StudentAssignment />} />
            <Route path="performance" element={<StudentPerformance onBack={() => {}} />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="notifications" element={<div className="p-8 text-slate-500 animate-in fade-in">Admin Notifications Center</div>} />
          </Route>

          {/* Staff Routes */}
          <Route 
            path="/staff" 
            element={staff ? <StaffLayout staff={staff} onLogout={handleStaffLogout} /> : <Navigate to="/" />}
          >
            <Route index element={<StaffDashboard />} />
            <Route path="students" element={<StaffStudents />} />
            <Route path="leetcode" element={<StaffLeetCode />} />
            <Route path="attendance" element={<StaffAttendance />} />
            <Route path="progress" element={<StaffProgress />} />
            <Route path="tasks" element={<StaffTasks />} />
            <Route path="emails" element={<StaffEmails />} />
            <Route path="notifications" element={<StaffNotifications />} />
            <Route path="reports" element={<StaffReports />} />
            <Route path="profile" element={<StaffProfile staff={staff} onLogout={handleStaffLogout} />} />
            <Route path="settings" element={<StaffSettings />} />
          </Route>

          {/* Student Routes */}
          <Route 
            path="/student" 
            element={student ? <StudentLayout student={student} onLogout={handleStudentLogout} /> : <Navigate to="/" />}
          >
            <Route index element={<StudentDashboard student={student!} />} />
            <Route path="tasks" element={<div className="p-8 text-slate-500">Today's Tasks (Coming Soon)</div>} />
            <Route path="leetcode" element={<StudentPerformance onBack={() => {}} />} />
            <Route path="tracker" element={<div className="p-8 text-slate-500">Daily Target (Coming Soon)</div>} />
            <Route path="performance" element={<div className="p-8 text-slate-500">Performance (Coming Soon)</div>} />
            <Route path="reports" element={<div className="p-8 text-slate-500">Reports (Coming Soon)</div>} />
            <Route path="notifications" element={<div className="p-8 text-slate-500">Notifications (Coming Soon)</div>} />
            <Route path="profile" element={<div className="p-8 text-slate-500">Profile (Coming Soon)</div>} />
            <Route path="settings" element={<div className="p-8 text-slate-500">Settings (Coming Soon)</div>} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </>
  );
}
