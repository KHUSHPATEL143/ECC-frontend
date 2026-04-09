import { useState } from 'react';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';

export default function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { changePassword } = useAuth();

  const handleUpdatePassword = async (event) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    await changePassword(password);
    setLoading(false);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 font-body">
      <div className="max-w-md w-full bg-surface rounded-2xl shadow-luxury p-8 border border-border">
        <div className="text-center mb-8">
          <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-primary font-heading">Set New Password</h2>
          <p className="text-text-muted mt-2">This update is simulated locally for the portfolio build.</p>
        </div>

        {error && (
          <div className="bg-error/10 border border-error text-error p-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">New Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-main focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="Enter a new password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">Confirm Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-main focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="Confirm the new password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-background font-bold py-3 rounded-xl hover:bg-primary-hover transition-all shadow-gold-glow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
