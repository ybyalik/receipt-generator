import type { NextApiRequest, NextApiResponse } from 'next';
import { getTemplateBySlug } from '../../../../server/storage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query;
  
  if (typeof slug !== 'string') {
    return res.status(400).json({ error: 'Invalid slug' });
  }
  
  try {
    if (req.method === 'GET') {
      const template = await getTemplateBySlug(slug);
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }
      return res.status(200).json(template);
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
