import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('khush@ecc-demo.dev');
  const [password, setPassword] = useState('demo-password');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setError('');
      setLoading(true);
      await signIn(email, password);
      navigate('/');
    } catch (err) {
      setError(`Failed to sign in: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 font-body">
      <div className="max-w-md w-full space-y-8 bg-surface p-8 rounded-2xl shadow-luxury border border-border">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-primary font-heading">
            Sign in to the demo
          </h2>
          <p className="mt-2 text-center text-sm text-text-muted">
            Use any seeded email to preview the portfolio copy, or{' '}
            <Link to="/signup" className="font-medium text-primary hover:text-primary-hover transition-colors">
              create a local demo user
            </Link>
          </p>
        </div>
        {error && <div className="bg-error/10 border border-error text-error p-3 rounded-xl">{error}</div>}

        <div className="bg-primary/10 border border-primary/20 text-primary p-3 rounded-xl text-sm">
          Suggested demo login: <span className="font-semibold">khush@ecc-demo.dev</span>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-border placeholder-text-muted text-text-main bg-background rounded-t-xl focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm transition-colors"
                placeholder="Email address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-border placeholder-text-muted text-text-main bg-background rounded-b-xl focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm transition-colors pr-10"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-primary transition-colors z-20"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-background bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all shadow-gold-glow hover:shadow-gold-glow-hover"
            >
              {loading ? 'Signing in...' : 'Enter Demo Dashboard'}
            </button>
          </div>

          <div className="text-center mt-4">
            <Link to="/forgot-password" className="text-sm text-primary hover:text-primary-hover transition-colors">
              Demo reset flow
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
