import type { NextApiRequest, NextApiResponse } from 'next';
import { getSectionTemplateById, updateSectionTemplate, deleteSectionTemplate } from '../../../../server/storage';

// Helper to check admin authorization
async function isAdmin(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
  return adminEmails.includes(email);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: 'Invalid ID' });
    return;
  }

  const templateId = parseInt(id);
  
  // Get user email from request header or body
  const userEmail = req.headers['x-user-email'] as string || req.body?.userEmail;
  
  // Check admin authorization
  if (!await isAdmin(userEmail)) {
    res.status(403).json({ error: 'Unauthorized - Admin access required' });
    return;
  }

  if (req.method === 'GET') {
    try {
      const template = await getSectionTemplateById(templateId);
      
      if (!template) {
        res.status(404).json({ error: 'Section template not found' });
        return;
      }

      res.status(200).json(template);
    } catch (error) {
      console.error('Error fetching section template:', error);
      res.status(500).json({ error: 'Failed to fetch section template' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { sectionType, name, defaultData } = req.body;
      
      const updates: any = {};
      if (sectionType !== undefined) updates.sectionType = sectionType;
      if (name !== undefined) updates.name = name;
      if (defaultData !== undefined) updates.defaultData = defaultData;

      const template = await updateSectionTemplate(templateId, updates);
      
      if (!template) {
        res.status(404).json({ error: 'Section template not found' });
        return;
      }

      res.status(200).json(template);
    } catch (error) {
      console.error('Error updating section template:', error);
      res.status(500).json({ error: 'Failed to update section template' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const deleted = await deleteSectionTemplate(templateId);
      
      if (!deleted) {
        res.status(404).json({ error: 'Section template not found' });
        return;
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting section template:', error);
      res.status(500).json({ error: 'Failed to delete section template' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
