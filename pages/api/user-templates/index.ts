import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserTemplates, createUserTemplate } from '../../../server/storage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET': {
        const userId = req.query.userId as string;
        if (!userId) {
          return res.status(400).json({ error: 'userId is required' });
        }
        
        const templates = await getUserTemplates(userId);
        return res.status(200).json(templates);
      }

      case 'POST': {
        const { userId, template, baseTemplateId } = req.body;
        
        if (!userId || !template) {
          return res.status(400).json({ error: 'userId and template are required' });
        }

        const newTemplate = await createUserTemplate(userId, template, baseTemplateId);
        return res.status(201).json(newTemplate);
      }

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('User templates API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
