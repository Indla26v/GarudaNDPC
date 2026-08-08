/**
 * GARUDA — Password History Utility
 *
 * Prevents users from reusing their last N passwords.
 * Stores bcrypt hashes in the `password_history` table and compares
 * new passwords against them before allowing a change.
 */
import bcrypt from 'bcrypt';
import prisma from '../config/prisma';

/** Number of previous passwords to retain for reuse checks. */
const PASSWORD_HISTORY_DEPTH = 5;

export interface PasswordHistoryResult {
  reused: boolean;
  message?: string;
}

/**
 * Check whether `newPassword` matches any of the user's last N stored hashes.
 *
 * @param userId      The user whose history to check
 * @param newPassword The plaintext password being proposed
 * @returns           `{ reused: true, message }` if the password was used before
 */
export async function checkPasswordHistory(
  userId: bigint | number | string,
  newPassword: string,
): Promise<PasswordHistoryResult> {
  try {
    const history = await prisma.password_history.findMany({
      where: { user_id: BigInt(userId) },
      orderBy: { created_at: 'desc' },
      take: PASSWORD_HISTORY_DEPTH,
      select: { password_hash: true },
    });

    for (const entry of history) {
      const match = await bcrypt.compare(newPassword, entry.password_hash);
      if (match) {
        return {
          reused: true,
          message: `You cannot reuse any of your last ${PASSWORD_HISTORY_DEPTH} passwords. Please enter a new password.`,
        };
      }
    }

    return { reused: false };
  } catch (error: any) {
    // Fail-open: if the history check fails, allow the password change
    // but log the error for investigation.
    console.error('[PasswordHistory] Check failed:', error.message);
    return { reused: false };
  }
}

/**
 * Record a password hash in the user's history.
 * Automatically prunes entries beyond `PASSWORD_HISTORY_DEPTH`.
 *
 * Call this **after** successfully updating the user's `password_hash`.
 *
 * @param userId The user whose history to update
 * @param hash   The bcrypt hash that was just set as their password
 */
export async function recordPasswordHash(
  userId: bigint | number | string,
  hash: string,
): Promise<void> {
  try {
    const uid = BigInt(userId);

    // Insert the new hash
    await prisma.password_history.create({
      data: {
        user_id: uid,
        password_hash: hash,
      },
    });

    // Prune old entries beyond the retention depth
    const allEntries = await prisma.password_history.findMany({
      where: { user_id: uid },
      orderBy: { created_at: 'desc' },
      select: { id: true },
    });

    if (allEntries.length > PASSWORD_HISTORY_DEPTH) {
      const idsToDelete = allEntries
        .slice(PASSWORD_HISTORY_DEPTH)
        .map((e) => e.id);

      await prisma.password_history.deleteMany({
        where: { id: { in: idsToDelete } },
      });
    }
  } catch (error: any) {
    // Non-fatal: don't block the password change if history recording fails
    console.error('[PasswordHistory] Record failed:', error.message);
  }
}
