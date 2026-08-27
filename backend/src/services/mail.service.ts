import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';

export interface SendResetOtpParams {
  to: string;
  fullName: string;
  username: string;
  otp: string;
  expiryMinutes?: number;
  subject?: string;
  customTitle?: string;
  customMessage?: string;
}

function getMailConfig() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465;
  const secure = process.env.SMTP_SECURE !== undefined 
    ? process.env.SMTP_SECURE === 'true' 
    : port === 465;

  const user = (process.env.SMTP_USER || process.env.GMAIL_USER || process.env.EMAIL_USER || '').trim();
  const pass = (process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS || '').trim();
  const from = process.env.SMTP_FROM || (user ? `"GARUDA NDPS Security" <${user}>` : '"GARUDA NDPS Security" <noreply@garuda.ap.gov.in>');

  return { host, port, secure, user, pass, from, isConfigured: Boolean(user && pass) };
}

/**
 * Creates transporter dynamically to ensure latest env variables are always used
 */
function createTransporter() {
  const config = getMailConfig();
  if (!config.isConfigured) {
    return null;
  }

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  });
}

/**
 * Generates a clean, light-themed HTML email template with embedded Garuda logo
 */
function generateResetOtpEmailHtml(params: SendResetOtpParams): string {
  const { fullName, username, otp, expiryMinutes = 10, customTitle, customMessage } = params;

  // Clean name: remove any parenthesized role e.g. "M. Suresh (SHO)" -> "M. Suresh"
  const cleanName = (fullName || 'Officer').replace(/\s*\([^)]*\)\s*/g, '').trim() || 'Officer';
  const headerTitle = customTitle || 'Password Reset Verification Code';
  const bodyMessage = customMessage || 'A request has been received to reset the password for your GARUDA NDPS portal account. Please use the single-use verification code below to authorize your password reset.';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headerTitle} - Garuda NDPS</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f1f5f9;
      color: #1e293b;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      max-width: 560px;
      margin: 30px auto;
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    }
    .header {
      background: #1e3a8a;
      padding: 24px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 0.5px;
      color: #ffffff;
    }
    .header p {
      margin: 4px 0 0 0;
      font-size: 12px;
      color: #bfdbfe;
      text-transform: uppercase;
      letter-spacing: 1.2px;
    }
    .content {
      padding: 32px 28px;
    }
    .greeting {
      font-size: 16px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 12px;
    }
    .message {
      font-size: 14px;
      line-height: 1.6;
      color: #334155;
      margin-bottom: 20px;
    }
    .otp-container {
      background-color: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      margin: 24px 0;
    }
    .otp-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #64748b;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .otp-code {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 36px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #1d4ed8;
      margin: 0;
    }
    .otp-expiry {
      font-size: 12px;
      color: #b45309;
      margin-top: 8px;
      font-weight: 600;
    }
    .advisory {
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      border-left: 4px solid #ef4444;
      padding: 14px 16px;
      border-radius: 6px;
      margin-top: 24px;
    }
    .advisory-title {
      font-size: 13px;
      font-weight: 700;
      color: #991b1b;
      margin: 0 0 4px 0;
    }
    .advisory-text {
      font-size: 12px;
      color: #7f1d1d;
      margin: 0;
      line-height: 1.5;
    }
    .footer {
      background-color: #f8fafc;
      padding: 22px 24px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #64748b;
      line-height: 1.6;
    }
    .footer-noreply {
      font-weight: 600;
      color: #475569;
      margin-bottom: 4px;
    }
    .footer-sub {
      color: #94a3b8;
      font-size: 11px;
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding-bottom: 12px;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
              <tr>
                <td style="padding: 0 10px; vertical-align: middle;">
                  <img src="cid:apLogo" alt="AP Police" width="46" height="46" style="display: block; width: 46px; height: 46px; border: 0;" />
                </td>
                <td style="padding: 0 10px; vertical-align: middle;">
                  <img src="cid:garudaLogo" alt="Garuda Logo" width="46" height="46" style="display: block; width: 46px; height: 46px; border: 0;" />
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center">
            <h1>GARUDA NDPS PLATFORM</h1>
            <p>Andhra Pradesh Police Department</p>
          </td>
        </tr>
      </table>
    </div>
    <div class="content">
      <div class="greeting">Dear ${cleanName},</div>
      <div class="message">
        ${bodyMessage}
      </div>
      
      <div class="otp-container">
        <div class="otp-label">Verification Code</div>
        <div class="otp-code">${otp}</div>
        <div class="otp-expiry">Valid for ${expiryMinutes} minutes only</div>
      </div>

      <div class="message">
        Enter this verification code in the window to proceed with setting your new password.
      </div>

      <div class="advisory">
        <div class="advisory-title">Security Notice</div>
        <div class="advisory-text">
          If you did not initiate this request, please contact your District Nodal Officer or System Administrator immediately. Never share your verification code with anyone.
        </div>
      </div>
    </div>
    <div class="footer">
      <div class="footer-noreply">This is an automated notification. Please do not reply to this email.</div>
      <p class="footer-sub">GARUDA NDPS Platform &bull; Tirupati District Police, Andhra Pradesh</p>
    </div>
  </div>
</body>
</html>
`;
}


/**
 * Sends a password reset OTP email using Gmail SMTP or logs to console in development
 */
export async function sendPasswordResetOtpEmail(params: SendResetOtpParams): Promise<{ success: boolean; simulated?: boolean; messageId?: string }> {
  const { to, fullName, username, otp, expiryMinutes = 10, subject } = params;
  const config = getMailConfig();

  // In test environment, dummy domain, or if SMTP is not configured, simulate delivery
  if (
    process.env.NODE_ENV === 'test' ||
    !config.isConfigured ||
    to.endsWith('@garuda.police.gov.in') ||
    to.endsWith('@example.com') ||
    to.endsWith('.test')
  ) {
    console.log(`[GARUDA EMAIL SERVICE - SIMULATED] Password reset OTP for ${to} (${username}): [ ${otp} ]`);
    return {
      success: true,
      simulated: true,
      messageId: `<simulated-${Date.now()}@garuda.ap.gov.in>`,
    };
  }

  const transporter = createTransporter();
  if (!transporter) {
    throw new Error('Failed to initialize mail transporter');
  }

  try {
    const html = generateResetOtpEmailHtml(params);

    // Build logo attachments with CID
    const attachments: any[] = [];
    const garudaLogoEmailPath = path.join(__dirname, '../assets/Garuda_logo_email.png');
    const garudaLogoOrigPath = path.join(__dirname, '../assets/Garuda_logo.png');
    const garudaLogoPath = fs.existsSync(garudaLogoEmailPath) ? garudaLogoEmailPath : garudaLogoOrigPath;
    const apLogoPath = path.join(__dirname, '../assets/Appolice_emblem.png');

    if (fs.existsSync(garudaLogoPath)) {
      attachments.push({
        filename: 'garuda-logo.png',
        path: garudaLogoPath,
        cid: 'garudaLogo',
      });
    }

    if (fs.existsSync(apLogoPath)) {
      attachments.push({
        filename: 'ap-police-emblem.png',
        path: apLogoPath,
        cid: 'apLogo',
      });
    }

    const emailSubject = subject || 'GARUDA NDPS — Password Verification Code';

    const info = await transporter.sendMail({
      from: config.from,
      to,
      subject: emailSubject,
      text: `Dear ${fullName || 'Officer'},\n\nYour verification code for GARUDA NDPS (${username}) is: ${otp}\n\nThis code is valid for ${expiryMinutes} minutes. If you did not request this, please notify your administrator immediately.`,
      html,
      attachments,
    });

    console.log(`[GARUDA EMAIL SERVICE] Password reset OTP sent to ${to} (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('[GARUDA EMAIL SERVICE] Failed to send email via SMTP:', error);

    // If in development/test, fallback gracefully with log
    if (process.env.NODE_ENV !== 'production') {
      console.log('\n==================== [GARUDA EMAIL SERVICE - FALLBACK] ====================');
      console.log(`SMTP delivery failed, showing OTP in console for testing:`);
      console.log(`To: ${to} (${fullName} | Username: ${username})`);
      console.log(`OTP Code: [ ${otp} ]`);
      console.log('===========================================================================\n');
      return { success: true, simulated: true };
    }

    throw new Error(`Email delivery failed: ${error.message || 'SMTP Connection Error'}`);
  }
}

