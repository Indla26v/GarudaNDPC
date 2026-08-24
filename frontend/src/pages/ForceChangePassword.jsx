import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import apLogo from '../assets/Appolice(emblem).png';
import garudaLogo from '../assets/Garuda_logo.png';

export default function ForceChangePassword() {
  const { user, isAuthenticated, sessionValidated, markPasswordChanged, logout } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [violations, setViolations] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');

  // Redirect if not authenticated or doesn't need to change password
  useEffect(() => {
    if (sessionValidated) {
      if (!isAuthenticated) {
        navigate('/login', { replace: true });
      } else if (!user?.mustChangePassword) {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, sessionValidated, user, navigate]);

  // Live password policy checklist
  const passwordChecks = useMemo(() => {
    const p = newPassword;
    return [
      { label: '10-18 characters', pass: p.length >= 10 && p.length <= 18 },
      { label: 'Uppercase letter (A-Z)', pass: /[A-Z]/.test(p) },
      { label: 'Lowercase letter (a-z)', pass: /[a-z]/.test(p) },
      { label: 'Digit (0-9)', pass: /[0-9]/.test(p) },
      { label: 'Special character (!@#$%...)', pass: /[!@#$%^&*()_+\-=\[\]{}|;:'",.<>?\/\\`~]/.test(p) },
      { label: 'No spaces', pass: p.length === 0 || !/\s/.test(p) },
    ];
  }, [newPassword]);

  const allChecksPass = newPassword.length > 0 && passwordChecks.every(c => c.pass);
  const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setViolations([]);
    setSuccessMsg('');

    if (!currentPassword) {
      setError('Please enter your initial / temporary password');
      return;
    }

    if (!allChecksPass) {
      setError('New password must satisfy all password policy criteria');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match');
      return;
    }

    setLoading(true);
    try {
      await api.put('/auth/password', {
        currentPassword,
        newPassword,
      });

      setSuccessMsg('Password updated successfully! Redirecting to dashboard...');
      markPasswordChanged();
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1200);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update password. Please try again.';
      setError(msg);
      if (err.response?.data?.violations) {
        setViolations(err.response.data.violations);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ background: 'linear-gradient(135deg, var(--color-garuda-800) 0%, var(--color-garuda-600) 100%)' }}
    >
      <div className="w-full max-w-lg animate-slide-up">
        {/* Branding Logos */}
        <div className="flex items-center justify-center gap-8 mb-6">
          <img 
            src={apLogo}
            alt="AP Police Logo" 
            className="w-20 h-20 object-contain drop-shadow-lg"
          />
          <img 
            src={garudaLogo}
            alt="Garuda Logo" 
            className="w-auto h-20 object-contain drop-shadow-lg"
          />
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6 sm:p-8 relative overflow-hidden"
          style={{
            background: 'var(--color-garuda-800)',
            border: '1px solid var(--color-garuda-700)',
            boxShadow: 'var(--shadow-elevated)',
          }}
        >
          {/* Header Banner */}
          <div className="mb-6 border-b border-slate-700/60 pb-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                First-Time Login
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--color-garuda-100)' }}>
              Set Your New Password
            </h2>
            <p className="text-xs sm:text-sm mt-1.5 text-slate-300">
              Welcome{user?.fullName ? `, ${user.fullName}` : ''}! For security compliance, you must change your temporary password before accessing the system.
            </p>
          </div>

          {/* Success Alert */}
          {successMsg && (
            <div
              className="mb-5 px-4 py-3 rounded-xl text-sm font-medium animate-fade-in flex items-center gap-2"
              style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.3)' }}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              {successMsg}
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div
              className="mb-5 px-4 py-3 rounded-xl text-sm animate-fade-in space-y-1"
              style={{ background: 'rgba(220, 38, 38, 0.12)', color: '#f87171', border: '1px solid rgba(220, 38, 38, 0.25)' }}
            >
              <div className="flex items-center gap-2 font-semibold">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </div>
              {violations.length > 0 && (
                <ul className="text-xs space-y-0.5 pl-6 list-disc text-red-300">
                  {violations.map((v, i) => <li key={i}>{v}</li>)}
                </ul>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-garuda-300)' }}>
                Initial / Temporary Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="Enter initial password"
                  className="input w-full pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200"
                  tabIndex="-1"
                >
                  {showCurrentPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-garuda-300)' }}>
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Enter new strong password"
                  className="input w-full pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200"
                  tabIndex="-1"
                >
                  {showNewPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Real-Time Password Policy Checklist */}
              {newPassword.length > 0 && (
                <div className="mt-2.5 p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-2 text-xs animate-fade-in">
                  <span className="text-xs font-semibold text-slate-300">
                    Password requirements
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                    {passwordChecks.map((check, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${check.pass ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                        <span className={check.pass ? 'text-slate-200 font-medium' : 'text-slate-400'}>
                          {check.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-garuda-300)' }}>
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-enter new password"
                  className="input w-full pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200"
                  tabIndex="-1"
                >
                  {showConfirmPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
              {confirmPassword.length > 0 && (
                <p className={`text-xs mt-1.5 flex items-center gap-1.5 ${passwordsMatch ? 'text-emerald-400' : 'text-rose-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${passwordsMatch ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                  <span>{passwordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="pt-3 space-y-2">
              <button
                type="submit"
                disabled={loading || !allChecksPass || !passwordsMatch}
                className="w-full py-3 rounded-full font-bold text-xs uppercase tracking-wider bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating Password...' : 'Save New Password & Continue'}
              </button>

              <button
                type="button"
                onClick={() => logout()}
                className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
              >
                Sign Out & Return to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
