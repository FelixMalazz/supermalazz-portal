import { cache } from 'react';
import { cookies } from 'next/headers';
import { prisma } from './prisma';
import { fetchDiscordRole } from './discord';
import { UserRole, UserSession } from './types';
import { verifySession } from './session';

/**
 * The signed cookie only proves identity, never current role. Role is read from PostgreSQL and
 * re-checked against Discord at most once per window, so a CHEF demoted in Discord loses access
 * within the window instead of at cookie expiry (7 days).
 *
 * ponytail: `users.updatedAt` doubles as the "last role check" marker (a row is only touched at
 * login and at sync), so this needs no schema change. Give it a dedicated `roleSyncedAt` column
 * once profile edits land and need their own schedule.
 */
const ROLE_SYNC_WINDOW_MS = 15 * 60 * 1000;

// One failed Discord call backstops every other request in this process, so an outage does not
// turn each page view into a Discord retry. ponytail: per-process, so a multi-instance deploy
// still hammers Discord once per instance.
const ROLE_SYNC_BACKOFF_MS = 60 * 1000;
let discordRetryAfter = 0;

async function syncRoleFromDiscord(userId: string, currentRole: UserRole): Promise<UserRole> {
  if (Date.now() < discordRetryAfter) return currentRole;

  const fresh = await fetchDiscordRole(userId);
  if (fresh === null) {
    discordRetryAfter = Date.now() + ROLE_SYNC_BACKOFF_MS;
    return currentRole;
  }

  discordRetryAfter = 0;

  // Written even when the role is unchanged on purpose: it refreshes `updatedAt`, the sync marker,
  // so the next Discord check is a full window away instead of running on every request.
  if (fresh !== currentRole) {
    console.log(`Role synced from Discord for ${userId}: ${currentRole} -> ${fresh}`);
  }
  await prisma.user.update({ where: { id: userId }, data: { role: fresh } });
  return fresh;
}

export const getCurrentUser = cache(async (): Promise<UserSession | null> => {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('supermalazz_session')?.value;
  if (!sessionCookie) return null; // Guest / Visitor

  const parsed = verifySession<UserSession & { isDiscordAuth?: boolean }>(sessionCookie);
  if (!parsed?.id || !parsed.role) return null;

  // Database is the authorization source of truth; the cookie is only a fallback so a DB
  // hiccup does not log everyone out.
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: parsed.id },
      select: { id: true, username: true, displayName: true, avatar: true, role: true, updatedAt: true },
    });

    if (dbUser) {
      const role =
        Date.now() - dbUser.updatedAt.getTime() > ROLE_SYNC_WINDOW_MS
          ? await syncRoleFromDiscord(dbUser.id, dbUser.role)
          : dbUser.role;

      return {
        id: dbUser.id,
        username: dbUser.username,
        displayName: dbUser.displayName || dbUser.username,
        avatar: dbUser.avatar || parsed.avatar || '',
        role,
      };
    }
  } catch (error) {
    console.error('Role lookup from database failed, falling back to session cookie:', error);
  }

  return {
    id: parsed.id,
    username: parsed.username,
    displayName: parsed.displayName || parsed.username,
    avatar: parsed.avatar || '',
    role: parsed.role,
  };
});
