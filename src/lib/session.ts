import crypto from 'crypto';

// Secret key for HMAC signing, fallback to a stable deterministic secret if env not set
const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  process.env.DISCORD_CLIENT_SECRET ||
  'supermalazz_secure_signature_salt_2026_tongkrongan';

/**
 * Sign data object into a tamper-proof string: <base64Payload>.<hmacSignature>
 */
export function signSession(data: any): string {
  const payload = Buffer.from(JSON.stringify(data)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url');
  return `${payload}.${signature}`;
}

/**
 * Verify and decode signed session string.
 * Returns decoded payload if valid, or null if tampered.
 * Also supports legacy raw JSON for smooth session migration.
 */
export function verifySession<T = any>(signedToken: string): T | null {
  if (!signedToken || typeof signedToken !== 'string') return null;

  // Check if it's in <payload>.<signature> format
  const parts = signedToken.split('.');
  if (parts.length === 2) {
    const [payload, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(payload)
      .digest('base64url');

    // Timing-safe comparison to prevent timing attacks
    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (
      sigBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      try {
        const decoded = Buffer.from(payload, 'base64url').toString('utf8');
        return JSON.parse(decoded) as T;
      } catch {
        return null;
      }
    }
    // Signature mismatch / tampered cookie
    return null;
  }

  // Graceful fallback for legacy JSON session cookies (will be upgraded on next login)
  try {
    const parsed = JSON.parse(signedToken);
    if (parsed && typeof parsed === 'object' && parsed.id) {
      return parsed as T;
    }
  } catch {
    // invalid json
  }

  return null;
}
