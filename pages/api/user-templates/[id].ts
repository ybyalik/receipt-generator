import type { NextApiRequest, NextApiResponse } from 'next';
import { 
  getUserTemplateById, 
  updateUserTemplate, 
  deleteUserTemplate 
} from '../../../server/storage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const id = req.query.id as string;

  try {
    switch (method) {
      case 'GET': {
        const userId = req.query.userId as string;
        if (!userId) {
          return res.status(400).json({ error: 'userId is required' });
        }

        const template = await getUserTemplateById(id, userId);
        if (!template) {
          return res.status(404).json({ error: 'Template not found' });
        }

        return res.status(200).json(template);
      }

      case 'PUT': {
        const { userId, updates } = req.body;
        
        if (!userId) {
          return res.status(400).json({ error: 'userId is required' });
        }

        const updated = await updateUserTemplate(id, userId, updates);
        if (!updated) {
          return res.status(404).json({ error: 'Template not found' });
        }

        return res.status(200).json(updated);
      }

      case 'DELETE': {
        const userId = req.query.userId as string;
        
        if (!userId) {
          return res.status(400).json({ error: 'userId is required' });
        }

        const deleted = await deleteUserTemplate(id, userId);
        if (!deleted) {
          return res.status(404).json({ error: 'Template not found' });
        }

        return res.status(200).json({ message: 'Template deleted successfully' });
      }

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('User template API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
