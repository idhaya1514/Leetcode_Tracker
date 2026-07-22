const fs = require('fs');
const path = 'c:/Users/idhay/Downloads/Leetcode_Tracker/Sscet_Tracker/frontend/src/app/App.tsx';

let content = fs.readFileSync(path, 'utf8');

const oldStaffRoutes = `        {/* Staff Routes */}
        <Route 
          path="/staff" 
          element={staff ? <StaffLayout staff={staff} onLogout={handleStaffLogout} /> : <Navigate to="/" />}
        >
          <Route index element={<StaffDashboard staff={staff} onBack={() => {}} />} />
          <Route path="students" element={<div className="p-8 text-slate-500">My Students (Coming Soon)</div>} />
          <Route path="tasks" element={<div className="p-8 text-slate-500">Task Assignments (Coming Soon)</div>} />
          <Route path="reports" element={<div className="p-8 text-slate-500">Reports (Coming Soon)</div>} />
        </Route>`;

const newStaffRoutes = `        {/* Staff Routes */}
        <Route 
          path="/staff" 
          element={staff ? <StaffLayout staff={staff} onLogout={handleStaffLogout} /> : <Navigate to="/" />}
        >
          <Route index element={<StaffDashboard staff={staff} onBack={() => {}} />} />
          <Route path="students" element={<div className="p-8 text-slate-500 text-lg font-semibold animate-in fade-in">Students Module (Coming Soon)</div>} />
          <Route path="leetcode" element={<div className="p-8 text-slate-500 text-lg font-semibold animate-in fade-in">LeetCode Tracker (Coming Soon)</div>} />
          <Route path="attendance" element={<div className="p-8 text-slate-500 text-lg font-semibold animate-in fade-in">Daily Attendance (Coming Soon)</div>} />
          <Route path="progress" element={<div className="p-8 text-slate-500 text-lg font-semibold animate-in fade-in">Daily Progress (Coming Soon)</div>} />
          <Route path="tasks" element={<div className="p-8 text-slate-500 text-lg font-semibold animate-in fade-in">Task Management (Coming Soon)</div>} />
          <Route path="emails" element={<div className="p-8 text-slate-500 text-lg font-semibold animate-in fade-in">Email Center (Coming Soon)</div>} />
          <Route path="notifications" element={<div className="p-8 text-slate-500 text-lg font-semibold animate-in fade-in">Notifications (Coming Soon)</div>} />
          <Route path="reports" element={<div className="p-8 text-slate-500 text-lg font-semibold animate-in fade-in">Reports (Coming Soon)</div>} />
          <Route path="profile" element={<div className="p-8 text-slate-500 text-lg font-semibold animate-in fade-in">Profile (Coming Soon)</div>} />
          <Route path="settings" element={<div className="p-8 text-slate-500 text-lg font-semibold animate-in fade-in">Settings (Coming Soon)</div>} />
        </Route>`;

content = content.replace(oldStaffRoutes, newStaffRoutes);

fs.writeFileSync(path, content);
console.log("Updated App.tsx with full Staff Routes!");
