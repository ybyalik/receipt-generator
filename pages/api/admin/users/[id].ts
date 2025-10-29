import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserById, updateUser, deleteUser } from '../../../../server/storage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  const userId = parseInt(id);

  try {
    switch (req.method) {
      case 'GET': {
        const user = await getUserById(userId);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        return res.status(200).json(user);
      }

      case 'PUT': {
        const updates = req.body;
        const updatedUser = await updateUser(userId, updates);
        
        if (!updatedUser) {
          return res.status(404).json({ error: 'User not found' });
        }
        
        return res.status(200).json(updatedUser);
      }

      case 'DELETE': {
        const deleted = await deleteUser(userId);
        
        if (!deleted) {
          return res.status(404).json({ error: 'User not found' });
        }
        
        return res.status(200).json({ message: 'User deleted successfully' });
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Error managing user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
