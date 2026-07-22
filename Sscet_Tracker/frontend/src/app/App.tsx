import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router";
import LoginPage from "./components/LoginPage";
import AdminPanel from "./components/AdminPanel";
import StudentManagement from "./components/StudentManagement";
import StudentPerformance from "./components/StudentPerformance";
import DailyTracker from "./components/DailyTracker";
import StudentProfile from "./components/StudentProfile";
import StudentDashboard from "./components/StudentDashboard";
import StaffManagement from "./components/StaffManagement";
import StaffDashboard from "./components/StaffDashboard";
import StaffStudents from "./components/StaffStudents";
import StaffLeetCode from "./components/StaffLeetCode";
import StaffAttendance from "./components/StaffAttendance";
import StaffProgress from "./components/StaffProgress";
import StaffTasks from "./components/StaffTasks";
import StaffEmails from "./components/StaffEmails";
import StaffReports from "./components/StaffReports";
import StaffNotifications from "./components/StaffNotifications";
import StaffProfile from "./components/StaffProfile";
import StaffSettings from "./components/StaffSettings";
import { Toaster } from "./components/ui/sonner";
import { getStudent, supabase, updateStudentPassword } from "./services/api";

import AdminSettings from "./components/AdminSettings";
import AdminLayout from "./components/layouts/AdminLayout";
import StaffLayout from "./components/layouts/StaffLayout";
import StudentLayout from "./components/layouts/StudentLayout";

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
    </>
  );
}
