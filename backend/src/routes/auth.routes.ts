import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  login,
  refresh,
  logout,
  getMe,
  updateMyProfile,
  changeMyPassword,
  requestPasswordReset,
  verifyPasswordResetOtp,
  resetPasswordWithToken,
  resetExpiredPasswordWithOtp,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// ── SECURITY FIX #14: Rate limit authentication endpoints
// Prevents brute-force credential stuffing across all accounts.
// Without this, an attacker can attempt 5 logins per username (triggering lockout)
// and move to the next, effectively brute-forcing across the entire user base.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minute window
  max: 20,                    // 20 requests per window per IP
  message: { message: 'Too many authentication attempts. Please try again later.' },
  standardHeaders: true,      // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,       // Disable X-RateLimit-* headers
});

// ── Rate limit forgot-password endpoints (prevents email spam / OTP flooding)
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minute window
  max: 10,                   // 10 requests per window per IP
  message: { message: 'Too many password reset requests. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', authLimiter, login);
router.post('/refresh', authLimiter, refresh);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateMyProfile);
router.put('/password', authenticate, changeMyPassword);

// ── Forgot Password & 60-Day Renewal (OTP via Gmail SMTP) ─────────────
router.post('/forgot-password/request', forgotPasswordLimiter, requestPasswordReset);
router.post('/forgot-password/verify-otp', forgotPasswordLimiter, verifyPasswordResetOtp);
router.post('/forgot-password/reset', forgotPasswordLimiter, resetPasswordWithToken);
router.post('/password-expired/reset', forgotPasswordLimiter, resetExpiredPasswordWithOtp);

export default router;

