import type { NextApiRequest, NextApiResponse } from 'next';
import { captureEmail } from '../../server/storage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, source } = req.body;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  try {
    await captureEmail(email, source || 'download');
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error capturing email:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
