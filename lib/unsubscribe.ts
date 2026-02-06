import crypto from 'crypto';

const SECRET = process.env.UNSUBSCRIBE_SECRET || 'fallback-unsubscribe-secret';

export function generateUnsubscribeToken(email: string): string {
  const hmac = crypto.createHmac('sha256', SECRET).update(email).digest('hex');
  return Buffer.from(`${email}:${hmac}`).toString('base64url');
}

export function verifyUnsubscribeToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString();
    const colonIndex = decoded.lastIndexOf(':');
    if (colonIndex === -1) return null;

    const email = decoded.substring(0, colonIndex);
    const hmac = decoded.substring(colonIndex + 1);
    const expectedHmac = crypto.createHmac('sha256', SECRET).update(email).digest('hex');

    if (hmac === expectedHmac) return email;
    return null;
  } catch {
    return null;
  }
}

export function getUnsubscribeUrl(email: string): string {
  const token = generateUnsubscribeToken(email);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://receiptgenerator.net';
  return `${baseUrl}/api/email/unsubscribe?token=${token}`;
}
