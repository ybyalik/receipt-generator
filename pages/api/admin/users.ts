import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllUsers } from '../../../server/storage';
import { isAdminEmail } from '../../../server/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userEmail, search } = req.query;
  
  if (!userEmail || typeof userEmail !== 'string') {
    return res.status(401).json({ error: 'Unauthorized: No user email provided' });
  }

  if (!isAdminEmail(userEmail)) {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  try {
    const searchQuery = search ? String(search) : undefined;
    
    const users = await getAllUsers(searchQuery);
    
    return res.status(200).json(users);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
