import { cookies } from 'next/headers';
import { UserRole, UserSession } from './types';

export async function getCurrentUser(): Promise<UserSession | null> {
  const cookieStore = await cookies();

  // Check real Discord OAuth2 session cookie
  const sessionCookie = cookieStore.get('supermalazz_session')?.value;
  if (sessionCookie) {
    try {
      const parsed = JSON.parse(sessionCookie);
      if (parsed && parsed.id && parsed.role) {
        return {
          id: parsed.id,
          username: parsed.username,
          displayName: parsed.displayName || parsed.username,
          avatar: parsed.avatar || '',
          role: parsed.role as UserRole,
        };
      }
    } catch (e) {
      // JSON parse error
    }
  }

  return null; // Guest / Visitor
}
