import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllUsers } from '../../../server/storage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { search } = req.query;
    const searchQuery = search ? String(search) : undefined;
    
    const users = await getAllUsers(searchQuery);
    
    return res.status(200).json(users);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
