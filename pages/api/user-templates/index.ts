import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserTemplates, createUserTemplate } from '../../../server/storage';
import { verifyAuthToken } from '../../../lib/firebase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  // Verify Firebase auth token
  const decodedToken = await verifyAuthToken(req.headers.authorization);
  if (!decodedToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    switch (method) {
      case 'GET': {
        // Use the verified UID, not a client-supplied one
        const templates = await getUserTemplates(decodedToken.uid);
        return res.status(200).json(templates);
      }

      case 'POST': {
        const { template, baseTemplateId } = req.body;

        if (!template) {
          return res.status(400).json({ error: 'template is required' });
        }

        const newTemplate = await createUserTemplate(decodedToken.uid, template, baseTemplateId);
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
