import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    window.setTimeout(() => {
      setLoading(false);
      setMessage(`A demo reset link has been simulated for ${email}.`);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 font-body">
      <div className="max-w-md w-full space-y-8 bg-surface p-8 rounded-2xl shadow-luxury border border-border">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-primary font-heading">
            Reset Password
          </h2>
          <p className="mt-2 text-center text-sm text-text-muted">
            This page is mocked for portfolio display and does not contact any backend.
          </p>
        </div>
        {message && <div className="bg-primary/10 border border-primary text-primary p-3 rounded-xl">{message}</div>}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <input
              type="email"
              required
              className="appearance-none rounded-xl relative block w-full px-3 py-3 border border-border placeholder-text-muted text-text-main bg-background focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm transition-colors"
              placeholder="Email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-background bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all shadow-gold-glow hover:shadow-gold-glow-hover"
            >
              {loading ? 'Preparing...' : 'Simulate Reset Link'}
            </button>
          </div>

          <div className="text-center mt-4">
            <Link to="/login" className="text-sm text-primary hover:text-primary-hover transition-colors">
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
