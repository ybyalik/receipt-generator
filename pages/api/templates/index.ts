import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllTemplates, createTemplate } from '../../../server/storage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const templates = await getAllTemplates();
      return res.status(200).json(templates);
    }
    
    if (req.method === 'POST') {
      const newTemplate = await createTemplate(req.body);
      return res.status(201).json(newTemplate);
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
