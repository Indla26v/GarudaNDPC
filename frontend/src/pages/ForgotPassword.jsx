import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import apLogo from '../assets/Appolice(emblem).png';
import garudaLogo from '../assets/Garuda_logo.png';

export default function ForgotPassword() {
  const navigate = useNavigate();

  // Step tracking: 1 = Enter Identifier, 2 = Verify OTP & Enter New Password, 3 = Success
  const [step, setStep] = useState(1);

  // Step 1 Form State
  const [identifier, setIdentifier] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [targetUsername, setTargetUsername] = useState('');

  // Step 2 Form State
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [violations, setViolations] = useState([]);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(4);

  const timerRef = useRef(null);

  // Countdown timer for OTP Resend
  useEffect(() => {
    if (step === 2 && resendCooldown > 0) {
      timerRef.current = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timerRef.current);
    }
  }, [step, resendCooldown]);

  // Auto-redirect countdown on success
  useEffect(() => {
    if (step === 3) {
      const redirectTimer = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(redirectTimer);
            navigate('/login', { replace: true });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(redirectTimer);
    }
  }, [step, navigate]);

  // Live password policy checklist
  const passwordChecks = useMemo(() => {
    const p = newPassword;
    return [
      { label: '10–18 characters', pass: p.length >= 10 && p.length <= 18 },
      { label: 'Uppercase letter (A-Z)', pass: /[A-Z]/.test(p) },
      { label: 'Lowercase letter (a-z)', pass: /[a-z]/.test(p) },
      { label: 'Digit (0-9)', pass: /[0-9]/.test(p) },
      { label: 'Special character (!@#$%...)', pass: /[!@#$%^&*()_+\-=\[\]{}|;:'",.<>?\/\\`~]/.test(p) },
      { label: 'No spaces allowed', pass: p.length === 0 || !/\s/.test(p) },
    ];
  }, [newPassword]);

  const allChecksPass = newPassword.length > 0 && passwordChecks.every((c) => c.pass);
  const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your username or registered email address');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password/request', {
        identifier: identifier.trim(),
      });

      const data = res.data.data;
      setMaskedEmail(data.maskedEmail || 'your registered email');
      setTargetUsername(data.username || identifier.trim());
      setStep(2);
      setResendCooldown(60);
      setCanResend(false);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to request password reset code. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Resend OTP
  const handleResendOtp = async () => {
    if (!canResend || loading) return;
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/forgot-password/request', {
        identifier: identifier.trim(),
      });
      setResendCooldown(60);
      setCanResend(false);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to resend verification code.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Reset Password
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setViolations([]);

    if (!otp.trim() || otp.trim().length < 6) {
      setError('Please enter the 6-digit verification code sent to your email');
      return;
    }

    if (!allChecksPass) {
      setError('New password must satisfy all password policy criteria');
      return;
    }

    if (!passwordsMatch) {
      setError('New password and confirmation do not match');
      return;
    }

    setLoading(true);

    try {
      // First verify OTP and obtain resetToken
      const verifyRes = await api.post('/auth/forgot-password/verify-otp', {
        identifier: identifier.trim(),
        otp: otp.trim(),
      });

      const { resetToken } = verifyRes.data.data;

      // Submit password reset with the verified resetToken
      await api.post('/auth/forgot-password/reset', {
        resetToken,
        newPassword,
        confirmPassword,
      });

      setStep(3);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reset password. Please verify your verification code and try again.';
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
      style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}
    >
      <div className="w-full max-w-md animate-slide-up">
        {/* Emblem & Branding Header */}
        <div className="flex items-center justify-center gap-8 mb-7">
          <img src={apLogo} alt="AP Police Logo" className="w-20 h-20 object-contain drop-shadow-sm" />
          <img src={garudaLogo} alt="Garuda Logo" className="w-auto h-20 object-contain drop-shadow-sm" />
        </div>

        {/* Main Card */}
        <div
          className="rounded-2xl p-8 bg-white border border-slate-200 shadow-xl"
          style={{
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.06), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
          }}
        >
          {/* STEP 1: Enter Username or Email */}
          {step === 1 && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-1.5 tracking-tight">
                  Forgot Password
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Enter your officer username or registered email address to receive a secure verification code.
                </p>
              </div>

              {error && (
                <div className="mb-5 px-4 py-3 rounded-lg text-sm animate-fade-in flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleRequestOtp} className="space-y-5">
                <div>
                  <label htmlFor="identifier" className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Username or Registered Email
                  </label>
                  <input
                    id="identifier"
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    autoFocus
                    className="input w-full bg-white border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="e.g. tpt-001_sho or officer@police.gov.in"
                  />
                </div>

                <button
                  id="btn-send-otp"
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-lg w-full flex items-center justify-center gap-2 font-semibold shadow-md transition-all"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Sending Verification Code...
                    </>
                  ) : (
                    'Send Verification Code'
                  )}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-200 text-center">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-600 hover:text-blue-600 hover:underline inline-flex items-center gap-1.5 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Sign In
                </Link>
              </div>
            </div>
          )}

          {/* STEP 2: Verify OTP & Reset Password */}
          {step === 2 && (
            <div>
              <div className="mb-5">
                <div className="flex items-center justify-between mb-1.5">
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Reset Password
                  </h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                    Step 2 of 2
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  A 6-digit verification code was sent to <strong className="text-blue-700 font-semibold">{maskedEmail}</strong>.
                </p>
              </div>

              {error && (
                <div className="mb-4 px-4 py-3 rounded-lg text-sm animate-fade-in flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <div>
                    <p>{error}</p>
                    {violations.length > 0 && (
                      <ul className="list-disc list-inside mt-1.5 space-y-0.5 text-xs text-red-600">
                        {violations.map((v, i) => (
                          <li key={i}>{v}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              <form onSubmit={handleResetSubmit} className="space-y-4">
                {/* OTP Code Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="otp-code" className="block text-sm font-semibold text-slate-700">
                      6-Digit Verification Code
                    </label>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={!canResend || loading}
                      className={`text-xs font-semibold ${
                        canResend ? 'text-blue-600 hover:text-blue-800 hover:underline cursor-pointer' : 'text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {canResend ? 'Resend Code' : `Resend in ${resendCooldown}s`}
                    </button>
                  </div>
                  <input
                    id="otp-code"
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    required
                    autoFocus
                    className="input w-full text-center text-xl font-mono tracking-widest bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-bold"
                    placeholder="••••••"
                  />
                </div>

                {/* New Password */}
                <div>
                  <label htmlFor="new-password" className="block text-sm font-semibold text-slate-700 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="input w-full pr-10 bg-white border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      placeholder="Enter new strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      tabIndex="-1"
                    >
                      {showNewPassword ? (
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

                {/* Live Password Policy Checklist */}
                {newPassword.length > 0 && (
                  <div className="p-3.5 rounded-xl text-xs space-y-2 bg-slate-50 border border-slate-200">
                    <div className="font-semibold text-slate-700">Password Policy Requirements:</div>
                    <div className="grid grid-cols-2 gap-2">
                      {passwordChecks.map((chk, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          {chk.pass ? (
                            <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-slate-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <circle cx="12" cy="12" r="9" strokeWidth={2} />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6" />
                            </svg>
                          )}
                          <span className={chk.pass ? 'text-emerald-700 font-medium' : 'text-slate-500'}>{chk.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="input w-full pr-10 bg-white border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      placeholder="Re-enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      tabIndex="-1"
                    >
                      {showConfirmPassword ? (
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
                  {confirmPassword.length > 0 && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                      {passwordsMatch ? (
                        <span className="text-emerald-700 font-medium flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          Passwords match
                        </span>
                      ) : (
                        <span className="text-red-600 font-medium flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Passwords do not match
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <button
                  id="btn-reset-password"
                  type="submit"
                  disabled={loading || !allChecksPass || !passwordsMatch}
                  className="btn btn-primary btn-lg w-full flex items-center justify-center gap-2 mt-2 font-semibold shadow-md transition-all"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Updating Password...
                    </>
                  ) : (
                    'Reset & Save Password'
                  )}
                </button>
              </form>

              <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setError('');
                    setOtp('');
                  }}
                  className="hover:underline text-slate-500 hover:text-slate-800 transition-colors"
                >
                  &larr; Change Username/Email
                </button>
                <Link to="/login" className="hover:underline text-blue-600 hover:text-blue-800 transition-colors">
                  Cancel & Sign In
                </Link>
              </div>
            </div>
          )}

          {/* STEP 3: Success Confirmation */}
          {step === 3 && (
            <div className="text-center py-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Password Reset Successful</h2>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                Your password for <strong>{targetUsername}</strong> has been updated securely. All other active sessions have been
                terminated for security.
              </p>

              <button
                type="button"
                onClick={() => navigate('/login', { replace: true })}
                className="btn btn-primary btn-lg w-full font-semibold shadow-md"
              >
                Sign In Now ({redirectCountdown}s)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
