import React, { useState, useEffect } from 'react';
import { Send, User, Bell } from 'lucide-react';
import { sendNotification, getAssignedStaffForStudent } from '../../services/api';
import { toast } from 'sonner';

interface StudentNotificationsProps {
  student: any;
}

export default function StudentNotifications({ student }: StudentNotificationsProps) {
  const [recipient, setRecipient] = useState<'admin' | 'staff'>('admin');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [assignedStaff, setAssignedStaff] = useState<any>(null);

  useEffect(() => {
    if (student?.registerNumber) {
      getAssignedStaffForStudent(student.registerNumber).then(staff => {
        if (staff) setAssignedStaff(staff);
      });
    }
  }, [student]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return toast.error("Please enter a message.");

    setIsSending(true);
    try {
      let targetUserId = "admin";
      if (recipient === 'staff') {
        if (!assignedStaff) throw new Error("You don't have an assigned staff member yet.");
        targetUserId = assignedStaff.staffId;
      }

      const title = `Message from ${student.name} (${student.registerNumber})`;
      await sendNotification(targetUserId, title, message.trim());
      
      toast.success("Message sent successfully!");
      setMessage("");
    } catch (err: any) {
      toast.error(err.message || "Failed to send message.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-300">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-sapphire-900 flex items-center gap-2">
          <Bell className="w-6 h-6 text-sapphire-600" /> Messaging & Notifications
        </h2>
        <p className="text-stone-500 mt-1">Send a direct message to the Administrator or your assigned Staff.</p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          <form onSubmit={handleSendMessage} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Send Message To</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setRecipient('admin')}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-300 ${
                    recipient === 'admin' 
                      ? 'border-sapphire-600 bg-sapphire-50 text-sapphire-900 shadow-sm' 
                      : 'border-stone-200 text-stone-500 hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span className="font-semibold">Administrator</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRecipient('staff')}
                  disabled={!assignedStaff}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-300 ${
                    !assignedStaff ? 'opacity-50 cursor-not-allowed bg-stone-100' :
                    recipient === 'staff' 
                      ? 'border-sapphire-600 bg-sapphire-50 text-sapphire-900 shadow-sm' 
                      : 'border-stone-200 text-stone-500 hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span className="font-semibold">
                    Assigned Staff {assignedStaff ? `(${assignedStaff.name})` : '(None)'}
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                className="w-full p-4 border border-stone-200 rounded-xl focus:ring-2 focus:ring-sapphire-600 focus:border-sapphire-600 resize-none transition-all duration-300 bg-stone-50"
                rows={5}
                required
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSending || !message.trim()}
                className="flex items-center gap-2 bg-sapphire-600 hover:bg-sapphire-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <Send className="w-5 h-5" />
                )}
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

