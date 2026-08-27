import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apLogo from '../assets/Appolice(emblem).png';
import garudaLogo from '../assets/Garuda_logo.png';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [idleLogout, setIdleLogout] = useState(false);
  const { user, login, loading, isAuthenticated, sessionValidated } = useAuth();
  const navigate = useNavigate();

  // If already authenticated and session validated, redirect appropriately
  useEffect(() => {
    if (sessionValidated && isAuthenticated) {
      if (user?.mustChangePassword) {
        navigate('/change-password', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, sessionValidated, user, navigate]);

  // Check if user was logged out due to inactivity
  useEffect(() => {
    if (sessionStorage.getItem('garuda_idle_logout') === 'true') {
      setIdleLogout(true);
      sessionStorage.removeItem('garuda_idle_logout');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(username, password);
    if (result.success) {
      if (result.mustChangePassword) {
        navigate('/change-password');
      } else {
        navigate('/dashboard');
      }
    } else if (result.passwordExpired) {
      navigate('/change-password', {
        state: {
          is60DayRenewal: true,
          username: result.username,
          resetToken: result.resetToken,
          maskedEmail: result.maskedEmail,
          message: result.message,
        },
      });
    } else {
      setError(result.message);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ background: 'linear-gradient(135deg, var(--color-garuda-800) 0%, var(--color-garuda-600) 100%)' }}
    >
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="flex items-center justify-center gap-8 mb-8">
          <img 
            src={apLogo}
            alt="AP Police Logo" 
            className="w-24 h-24 object-contain drop-shadow-lg"
          />
          <img 
            src={garudaLogo}
            alt="Garuda Logo" 
            className="w-auto h-24 object-contain drop-shadow-lg"
          />
        </div>

        {/* Login Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: 'var(--color-garuda-800)',
            border: '1px solid var(--color-garuda-700)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--color-garuda-100)' }}>
              Position Login
            </h2>
            <p className="text-xs mt-1" style={{ color: 'var(--color-garuda-400)' }}>
              Sign in with your official Police Station, Division, or District credentials
            </p>
          </div>

          {idleLogout && (
            <div
              className="mb-5 px-4 py-3 rounded-xl text-sm animate-fade-in flex items-center gap-2"
              style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#fbbf24', border: '1px solid rgba(234, 179, 8, 0.25)' }}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Session expired due to inactivity. Please sign in again.
            </div>
          )}

          {error && (
            <div
              className="mb-5 px-4 py-3 rounded-xl text-sm animate-fade-in flex items-start gap-2"
              style={{ background: 'rgba(220, 38, 38, 0.12)', color: '#f87171', border: '1px solid rgba(220, 38, 38, 0.3)' }}
            >
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="login-username" className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-garuda-300)' }}>
                Position Username
              </label>
              <input
                id="login-username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                className="input rounded-xl bg-slate-900/60 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="e.g. sho-tpt-sadar or sp-tpt"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-garuda-300)' }}>
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  id="forgot-password-link"
                  className="text-xs hover:underline transition-colors font-medium"
                  style={{ color: '#60a5fa' }}
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input rounded-xl pr-10 bg-slate-900/60 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter position password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 focus:outline-none"
                  tabIndex="-1"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 rounded-full font-semibold text-sm text-white transition-all transform active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              style={{
                background: 'linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%)',
                boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                border: '1px solid #1e40af',
              }}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <p className="text-xs text-center mt-6 tracking-wide" style={{ color: 'var(--color-garuda-500)' }}>
            Authorized Police Personnel Only &bull; Access Monitored &bull; 60-Day Security Rotation
          </p>
        </div>
      </div>
    </div>
  );
}
