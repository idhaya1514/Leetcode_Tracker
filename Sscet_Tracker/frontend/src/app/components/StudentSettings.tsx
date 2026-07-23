import React, { useState } from 'react';
import { Bell, Lock, Palette, Save, Shield, Key } from 'lucide-react';

export default function StudentSettings() {
  const [activeTab, setActiveTab] = useState<'security' | 'notifications' | 'appearance'>('security');

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account preferences and security.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 space-y-1">
          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'security' 
                ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Shield className={`w-5 h-5 ${activeTab === 'security' ? 'text-indigo-600' : 'text-slate-400'}`} />
            Security
          </button>
          
          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'notifications' 
                ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Bell className={`w-5 h-5 ${activeTab === 'notifications' ? 'text-indigo-600' : 'text-slate-400'}`} />
            Notifications
          </button>

          <button
            onClick={() => setActiveTab('appearance')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'appearance' 
                ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Palette className={`w-5 h-5 ${activeTab === 'appearance' ? 'text-indigo-600' : 'text-slate-400'}`} />
            Appearance
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'security' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-lg font-semibold text-slate-800">Change Password</h2>
                <p className="text-sm text-slate-500 mt-1">Update your password to keep your account secure.</p>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input 
                      type="password" 
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors sm:text-sm text-slate-900"
                      placeholder="Enter current password"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-5 w-5 text-slate-400" />
                    </div>
                    <input 
                      type="password" 
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors sm:text-sm text-slate-900"
                      placeholder="Enter new password"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-5 w-5 text-slate-400" />
                    </div>
                    <input 
                      type="password" 
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors sm:text-sm text-slate-900"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-indigo-200">
                    <Save className="w-4 h-4" />
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-lg font-semibold text-slate-800">Notification Preferences</h2>
                <p className="text-sm text-slate-500 mt-1">Choose what updates you want to receive.</p>
              </div>
              <div className="p-6 space-y-6">
                {[
                  { title: 'Email Notifications', desc: 'Receive daily performance summaries via email.' },
                  { title: 'Task Reminders', desc: 'Get notified when you have pending daily tasks.' },
                  { title: 'LeetCode Sync Alerts', desc: 'Alert me when LeetCode stats are successfully synced.' },
                  { title: 'System Announcements', desc: 'Receive important updates about the platform.' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-800">{item.title}</p>
                      <p className="text-sm text-slate-500">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked={idx < 2} />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-lg font-semibold text-slate-800">Appearance</h2>
                <p className="text-sm text-slate-500 mt-1">Customize how the platform looks for you.</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="border-2 border-indigo-600 rounded-xl p-4 cursor-pointer bg-indigo-50/30">
                    <div className="h-20 bg-white rounded-lg shadow-sm border border-slate-200 mb-3 overflow-hidden flex flex-col">
                      <div className="h-4 bg-slate-100 border-b border-slate-200 w-full"></div>
                      <div className="flex-1 flex p-2 gap-2">
                        <div className="w-4 bg-slate-100 rounded"></div>
                        <div className="flex-1 bg-slate-50 rounded"></div>
                      </div>
                    </div>
                    <p className="text-center font-medium text-indigo-900">Light Mode</p>
                  </div>
                  
                  <div className="border-2 border-slate-200 rounded-xl p-4 cursor-pointer hover:border-slate-300 transition-colors opacity-60">
                    <div className="h-20 bg-slate-900 rounded-lg shadow-sm border border-slate-800 mb-3 overflow-hidden flex flex-col">
                      <div className="h-4 bg-slate-800 border-b border-slate-700 w-full"></div>
                      <div className="flex-1 flex p-2 gap-2">
                        <div className="w-4 bg-slate-800 rounded"></div>
                        <div className="flex-1 bg-slate-800/50 rounded"></div>
                      </div>
                    </div>
                    <p className="text-center font-medium text-slate-500">Dark Mode <span className="text-xs ml-1">(Coming Soon)</span></p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
