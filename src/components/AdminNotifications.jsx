import { useState } from 'react';
import { AlertCircle, CheckCircle, Mail, Send } from 'lucide-react';
import { useDemoData } from '../context/DemoDataContext';

export default function AdminNotifications() {
  const { members, sendNotification } = useDemoData();
  const [selectedUser, setSelectedUser] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('idle');

  const handleSend = async (event) => {
    event.preventDefault();
    setStatus('sending');

    await sendNotification({
      userId: selectedUser,
      subject,
      message: description,
    });

    setStatus('success');
    setSelectedUser('');
    setSubject('');
    setDescription('');
    window.setTimeout(() => setStatus('idle'), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 font-body">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/10 rounded-full">
          <Mail className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-text-main font-heading">Send Notification</h2>
          <p className="text-sm text-text-muted">This demo form writes to local mock data only.</p>
        </div>
      </div>

      <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-start gap-3 text-primary">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <p className="text-sm">
          Notifications are fully local in this portfolio copy, so you can showcase the flow without any backend dependency.
        </p>
      </div>

      <form onSubmit={handleSend} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">Select User</label>
          <select
            required
            value={selectedUser}
            onChange={(event) => setSelectedUser(event.target.value)}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          >
            <option value="">Choose a recipient...</option>
            {members.map((user) => (
              <option key={user.id} value={user.id}>
                {user.full_name} ({user.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">Subject</label>
          <input
            type="text"
            required
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="e.g. Capital review shared with the team"
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">Description</label>
          <textarea
            required
            rows={6}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Type your message here..."
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
          />
        </div>

        {status === 'success' && (
          <div className="flex items-center gap-2 text-success bg-success/10 p-4 rounded-xl">
            <CheckCircle className="w-5 h-5" />
            <span>Notification added to the demo inbox.</span>
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'sending'}
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
            status === 'sending'
              ? 'bg-primary/50 cursor-not-allowed'
              : 'bg-primary hover:bg-primary-hover text-background shadow-gold-glow hover:shadow-gold-glow-hover'
          }`}
        >
          {status === 'sending' ? (
            <>
              <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send Notification
            </>
          )}
        </button>
      </form>
    </div>
  );
}
