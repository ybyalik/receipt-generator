import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllSectionTemplates, createSectionTemplate } from '../../../../server/storage';

// Helper to check admin authorization
async function isAdmin(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
  return adminEmails.includes(email);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get user email from request header or body
  const userEmail = req.headers['x-user-email'] as string || req.body?.userEmail;
  
  // Check admin authorization
  if (!await isAdmin(userEmail)) {
    res.status(403).json({ error: 'Unauthorized - Admin access required' });
    return;
  }

  if (req.method === 'GET') {
    try {
      const templates = await getAllSectionTemplates();
      res.status(200).json(templates);
    } catch (error) {
      console.error('Error fetching section templates:', error);
      res.status(500).json({ error: 'Failed to fetch section templates' });
    }
  } else if (req.method === 'POST') {
    try {
      const { sectionType, name, defaultData } = req.body;
      
      if (!sectionType || !name || !defaultData) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const template = await createSectionTemplate({
        sectionType,
        name,
        defaultData,
      });
      
      res.status(201).json(template);
    } catch (error) {
      console.error('Error creating section template:', error);
      res.status(500).json({ error: 'Failed to create section template' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
