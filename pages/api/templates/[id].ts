import type { NextApiRequest, NextApiResponse } from 'next';
import { getTemplateById, updateTemplate, deleteTemplate } from '../../../server/storage';
import { isAdmin } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID' });
  }
  
  try {
    if (req.method === 'GET') {
      const template = await getTemplateById(id);
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }
      return res.status(200).json(template);
    }
    
    if (req.method === 'PUT') {
      const { userEmail } = req.body;
      
      if (!isAdmin(userEmail)) {
        return res.status(403).json({ error: 'Unauthorized: Admin access required' });
      }
      
      const updated = await updateTemplate(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Template not found' });
      }
      return res.status(200).json(updated);
    }
    
    if (req.method === 'DELETE') {
      const userEmail = req.query.userEmail as string;
      
      if (!isAdmin(userEmail)) {
        return res.status(403).json({ error: 'Unauthorized: Admin access required' });
      }
      
      const deleted = await deleteTemplate(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Template not found' });
      }
      return res.status(204).end();
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
