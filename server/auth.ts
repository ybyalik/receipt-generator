import { NextApiRequest, NextApiResponse } from 'next';

export function getAdminEmails(): string[] {
  const adminEmailsEnv = process.env.NEXT_PUBLIC_ADMIN_EMAILS || '';
  return adminEmailsEnv.split(',').map(email => email.trim()).filter(Boolean);
}

export function isAdminEmail(email: string): boolean {
  const adminEmails = getAdminEmails();
  return adminEmails.includes(email);
}

export function requireAdminEmail(req: NextApiRequest, res: NextApiResponse): boolean {
  const { userEmail } = req.body;
  
  if (!userEmail) {
    res.status(401).json({ error: 'Unauthorized: No user email provided' });
    return false;
  }

  if (!isAdminEmail(userEmail)) {
    res.status(403).json({ error: 'Forbidden: Admin access required' });
    return false;
  }

  return true;
}
