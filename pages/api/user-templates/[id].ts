import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getUserTemplateById,
  updateUserTemplate,
  deleteUserTemplate
} from '../../../server/storage';
import { verifyAuthToken } from '../../../lib/firebase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const id = req.query.id as string;

  // Verify Firebase auth token
  const decodedToken = await verifyAuthToken(req.headers.authorization);
  if (!decodedToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    switch (method) {
      case 'GET': {
        const template = await getUserTemplateById(id, decodedToken.uid);
        if (!template) {
          return res.status(404).json({ error: 'Template not found' });
        }
        return res.status(200).json(template);
      }

      case 'PUT': {
        const { updates } = req.body;
        const updated = await updateUserTemplate(id, decodedToken.uid, updates);
        if (!updated) {
          return res.status(404).json({ error: 'Template not found' });
        }
        return res.status(200).json(updated);
      }

      case 'DELETE': {
        const deleted = await deleteUserTemplate(id, decodedToken.uid);
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
