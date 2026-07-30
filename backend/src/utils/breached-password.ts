/**
 * GARUDA — Breached Password Checker
 *
 * Uses the HaveIBeenPwned Passwords API (k-Anonymity model) to check
 * whether a password has appeared in known data breaches.
 *
 * How it works:
 *   1. SHA-1 hash the password
 *   2. Send only the first 5 hex chars (prefix) to the HIBP API
 *   3. The API returns all suffixes matching that prefix
 *   4. Check if the full suffix appears in the response
 *
 * Privacy: The full password hash is NEVER sent over the network.
 *
 * @see https://haveibeenpwned.com/API/v3#PwnedPasswords
 */
import crypto from 'crypto';
import https from 'https';

export interface BreachedPasswordResult {
  breached: boolean;
  count: number;
  message?: string;
}

/**
 * Check if a password has appeared in known data breaches.
 *
 * @param password  Plaintext password to check
 * @param timeoutMs Maximum time to wait for the HIBP API (default: 5000ms)
 * @returns         `{ breached: true, count }` if found, `{ breached: false }` otherwise
 */
export async function checkBreachedPassword(
  password: string,
  timeoutMs = 5000,
): Promise<BreachedPasswordResult> {
  try {
    const sha1 = crypto
      .createHash('sha1')
      .update(password)
      .digest('hex')
      .toUpperCase();

    const prefix = sha1.substring(0, 5);
    const suffix = sha1.substring(5);

    const responseBody = await fetchHibpRange(prefix, timeoutMs);

    // Each line is: SUFFIX:COUNT
    const lines = responseBody.split('\n');
    for (const line of lines) {
      const [hashSuffix, countStr] = line.trim().split(':');
      if (hashSuffix === suffix) {
        const count = parseInt(countStr || '0', 10);
        return {
          breached: true,
          count,
          message: `This password has appeared in ${count.toLocaleString()} known data breach${count !== 1 ? 'es' : ''}. Please choose a different password.`,
        };
      }
    }

    return { breached: false, count: 0 };
  } catch (error: any) {
    // Fail-open: if the API is unreachable, don't block the user.
    // Log for ops awareness.
    console.warn('[BreachedPassword] HIBP API check failed (fail-open):', error.message);
    return { breached: false, count: 0 };
  }
}

/**
 * Fetch the HIBP range endpoint for a given SHA-1 prefix.
 */
function fetchHibpRange(prefix: string, timeoutMs: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.get(
      `https://api.pwnedpasswords.com/range/${prefix}`,
      {
        headers: {
          'User-Agent': 'GARUDA-NDPS-TPT-PasswordChecker',
        },
        timeout: timeoutMs,
      },
      (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`HIBP API returned status ${res.statusCode}`));
          res.resume(); // Drain the response
          return;
        }

        let data = '';
        res.on('data', (chunk: Buffer) => {
          data += chunk.toString();
        });
        res.on('end', () => resolve(data));
        res.on('error', reject);
      },
    );

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('HIBP API request timed out'));
    });
  });
}
