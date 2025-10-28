import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllTemplates, createTemplate } from '../../../server/storage';
import { isAdmin } from '../../../lib/auth';
import { mockTemplates } from '../../../lib/mockTemplates';

let seeded = false;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      let templates = await getAllTemplates();
      
      if (templates.length === 0 && !seeded) {
        seeded = true;
        for (const mockTemplate of mockTemplates) {
          await createTemplate(mockTemplate);
        }
        templates = await getAllTemplates();
      }
      
      return res.status(200).json(templates);
    }
    
    if (req.method === 'POST') {
      const { userEmail, ...templateData } = req.body;
      
      if (!isAdmin(userEmail)) {
        return res.status(403).json({ error: 'Unauthorized: Admin access required' });
      }
      
      const newTemplate = await createTemplate(templateData);
      return res.status(201).json(newTemplate);
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
