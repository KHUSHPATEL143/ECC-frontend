import { useEffect, useRef, useState } from 'react';
import { Lock, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/AuthContext';

export default function AccountSettings() {
  const { user, profile, updateEmail, updateProfile } = useAuth();
  const [isVerified, setIsVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(new Array(8).fill(''));
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    setFullName(profile?.full_name || '');
  }, [profile?.full_name]);

  useEffect(() => {
    if (otpSent && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [otpSent]);

  const handleChange = (element, index) => {
    if (Number.isNaN(Number(element.value)) && element.value !== '') {
      return;
    }

    const nextOtp = [...otp];
    nextOtp[index] = element.value;
    setOtp(nextOtp);

    if (element.value && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (event, index) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pastedData = event.clipboardData.getData('text').slice(0, 8).split('');
    const nextOtp = [...otp];
    pastedData.forEach((value, index) => {
      if (index < 8) {
        nextOtp[index] = value;
      }
    });
    setOtp(nextOtp);
    inputRefs.current[Math.min(pastedData.length, 7)]?.focus();
  };

  const handleSendOtp = async () => {
    setLoading(true);
    setMessage(null);
    window.setTimeout(() => {
      setOtpSent(true);
      setLoading(false);
      setMessage({ type: 'success', text: 'Demo verification code sent. Enter any 8 digits to continue.' });
    }, 400);
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    if (otp.join('').length !== 8) {
      setLoading(false);
      setMessage({ type: 'error', text: 'Please enter the full 8-digit code.' });
      return;
    }

    window.setTimeout(() => {
      setIsVerified(true);
      setLoading(false);
      setMessage({ type: 'success', text: 'Identity verified in demo mode.' });
    }, 400);
  };

  const handleUpdateProfile = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    await updateProfile({ fullName, password });

    setPassword('');
    setLoading(false);
    setMessage({ type: 'success', text: 'Profile updated locally for the portfolio demo.' });
  };

  const handleUpdateEmail = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    await updateEmail(newEmail);

    setIsEmailModalOpen(false);
    setNewEmail('');
    setLoading(false);
    setMessage({ type: 'success', text: 'Email updated in the local demo state.' });
  };

  return (
    <div className="max-w-2xl mx-auto font-body">
      <h1 className="text-3xl font-bold text-primary mb-8 font-heading">Account Settings</h1>

      {!isVerified ? (
        <div className="bg-surface rounded-2xl border border-border p-8 text-center shadow-luxury">
          <ShieldCheck className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold text-text-main mb-2 font-heading">Identity Verification Required</h2>
          <p className="text-text-muted mb-6">
            This verification step is mocked so the portfolio copy still shows the full settings flow.
          </p>

          {message && (
            <div
              className={`mb-6 p-3 rounded-xl text-sm ${
                message.type === 'success' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
              }`}
            >
              {message.text}
            </div>
          )}

          {!otpSent ? (
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="px-6 py-3 bg-primary text-background font-bold rounded-xl hover:bg-primary-hover disabled:opacity-50 transition-all flex items-center justify-center mx-auto shadow-gold-glow hover:shadow-gold-glow-hover"
            >
              <Mail className="w-4 h-4 mr-2" />
              {loading ? 'Sending...' : 'Send Verification Code'}
            </button>
          ) : (
            <form onSubmit={handleVerifyOtp} className="max-w-md mx-auto space-y-6">
              <div className="flex justify-center gap-2">
                {otp.map((value, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    ref={(element) => {
                      inputRefs.current[index] = element;
                    }}
                    value={value}
                    onChange={(event) => handleChange(event.target, index)}
                    onKeyDown={(event) => handleKeyDown(event, index)}
                    onPaste={handlePaste}
                    className="w-10 h-12 md:w-12 md:h-14 bg-background border border-border rounded-lg text-center text-xl md:text-2xl text-text-main focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-success text-background font-bold rounded-xl hover:bg-opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-success/20"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="text-sm text-text-muted hover:text-text-main underline transition-colors"
              >
                Resend Code
              </button>
            </form>
          )}
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-luxury">
          <div className="flex items-center mb-6 text-success bg-success/10 p-3 rounded-xl">
            <ShieldCheck className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">Identity Verified. Changes stay inside the demo state.</span>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            {message && (
              <div
                className={`p-4 rounded-xl ${
                  message.type === 'success' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                }`}
              >
                {message.text}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Email</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 text-text-muted cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(true)}
                  className="px-4 py-2 bg-surface-hover border border-border text-primary font-bold rounded-xl hover:bg-primary/10 transition-colors whitespace-nowrap"
                >
                  Change Email
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">New Password</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Leave blank to keep current password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-primary transition-colors"
                />
                <Lock className="absolute right-3 top-3.5 w-4 h-4 text-text-muted" />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-primary text-background font-bold rounded-xl hover:bg-primary-hover disabled:opacity-50 transition-all shadow-gold-glow hover:shadow-gold-glow-hover"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-md border border-border shadow-luxury">
            <h2 className="text-xl font-bold text-primary mb-4 font-heading">Change Email Address</h2>
            <p className="text-text-muted mb-6 text-sm">
              Enter a new address to update the local demo profile.
            </p>
            <form onSubmit={handleUpdateEmail} className="space-y-4 font-body">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">New Email</label>
                <input
                  type="email"
                  required
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-primary transition-colors"
                  value={newEmail}
                  onChange={(event) => setNewEmail(event.target.value)}
                  placeholder="name@example.com"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(false)}
                  className="px-4 py-2 text-text-muted hover:text-text-main transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-primary text-background font-bold rounded-xl hover:bg-primary-hover disabled:opacity-50 transition-all shadow-gold-glow"
                >
                  {loading ? 'Saving...' : 'Update Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
