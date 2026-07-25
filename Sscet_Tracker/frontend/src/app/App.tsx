import { useState, useEffect, Suspense, lazy } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router";
import { Toaster } from "./components/ui/sonner";
import { getStudent, supabase, updateStudentPassword } from "./services/api";

const LoginPage = lazy(() => import("./components/auth/LoginPage"));
const AdminPanel = lazy(() => import("./components/admin/AdminPanel"));
const StudentManagement = lazy(() => import("./components/admin/StudentManagement"));
const StudentPerformance = lazy(() => import("./components/student/StudentPerformance"));
const StudentDashboard = lazy(() => import("./components/student/StudentDashboard"));
const StaffManagement = lazy(() => import("./components/admin/StaffManagement"));
const StudentAssignment = lazy(() => import("./components/admin/StudentAssignment"));
const StaffDashboard = lazy(() => import("./components/staff/StaffDashboard"));
const StaffStudents = lazy(() => import("./components/staff/StaffStudents"));
const StaffLeetCode = lazy(() => import("./components/staff/StaffLeetCode"));
const StaffAttendance = lazy(() => import("./components/staff/StaffAttendance"));
const StaffProgress = lazy(() => import("./components/staff/StaffProgress"));
const StaffTasks = lazy(() => import("./components/staff/StaffTasks"));
const StaffEmails = lazy(() => import("./components/staff/StaffEmails"));
const StaffReports = lazy(() => import("./components/staff/StaffReports"));
const StaffNotifications = lazy(() => import("./components/staff/StaffNotifications"));
const StaffProfile = lazy(() => import("./components/staff/StaffProfile"));
const StaffSettings = lazy(() => import("./components/staff/StaffSettings"));
const StudentProfile = lazy(() => import("./components/student/StudentProfile"));
const StudentSettings = lazy(() => import("./components/student/StudentSettings"));
const StudentNotifications = lazy(() => import("./components/student/StudentNotifications"));
const StudentDailyTarget = lazy(() => import("./components/student/StudentDailyTarget"));
const StudentDailyProgress = lazy(() => import("./components/student/StudentDailyProgress"));
const StudentTasks = lazy(() => import("./components/student/StudentTasks"));
const StudentReports = lazy(() => import("./components/student/StudentReports"));

const AdminSettings = lazy(() => import("./components/admin/AdminSettings"));
const AdminNotifications = lazy(() => import("./components/admin/AdminNotifications"));
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
  const [student, setStudent] = useState<Student | null>(() => {
    const s = localStorage.getItem("currentStudent");
    return s ? JSON.parse(s) : null;
  });
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => sessionStorage.getItem("adminLoggedIn") === "true");
  const [staff, setStaff] = useState<any>(() => {
    const s = sessionStorage.getItem("currentStaff");
    return s ? JSON.parse(s) : null;
  });
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

    // Fallback: reload state if it somehow gets cleared in another tab (though initial state handles most cases)
    const adminSession = sessionStorage.getItem("adminLoggedIn");
    if (adminSession === "true" && !isAdminLoggedIn) {
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
    sessionStorage.setItem("currentStaff", JSON.stringify(staffData));
    navigate("/staff");
  };

  const handleStaffLogout = () => {
    setStaff(null);
    sessionStorage.removeItem("currentStaff");
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
            <Route path="tasks" element={<StaffTasks />} />
            <Route path="performance" element={<StudentPerformance onBack={() => navigate('/admin')} />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="notifications" element={<AdminNotifications />} />
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
            <Route path="notifications" element={<StaffNotifications staff={staff!} />} />
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
            <Route path="tasks" element={<StudentTasks />} />
            <Route path="leetcode" element={<StudentPerformance onBack={() => navigate('/student')} />} />
            <Route path="tracker" element={<StudentDailyTarget />} />
            <Route path="performance" element={<StudentDailyProgress />} />
            <Route path="reports" element={<StudentReports />} />
            <Route path="notifications" element={<StudentNotifications student={student!} />} />
            <Route path="profile" element={<StudentProfile student={student!} onBack={() => navigate('/student')} />} />
            <Route path="settings" element={<StudentSettings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </>
  );
}

