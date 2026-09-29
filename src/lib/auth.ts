import { cookies } from 'next/headers';
import { UserRole, UserSession } from './types';
import { verifySession } from './session';

export async function getCurrentUser(): Promise<UserSession | null> {
  const cookieStore = await cookies();

  // Check real Discord OAuth2 session cookie with cryptographic verification
  const sessionCookie = cookieStore.get('supermalazz_session')?.value;
  if (sessionCookie) {
    const parsed = verifySession<any>(sessionCookie);
    if (parsed && parsed.id && parsed.role) {
      return {
        id: parsed.id,
        username: parsed.username,
        displayName: parsed.displayName || parsed.username,
        avatar: parsed.avatar || '',
        role: parsed.role as UserRole,
      };
    }
  }

  return null; // Guest / Visitor
}
