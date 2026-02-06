import type { NextApiRequest, NextApiResponse } from 'next';
import { saveAiResult, getAiResult } from '../../server/storage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      const { userId, sections, settings } = req.body;
      if (!sections || !settings) {
        return res.status(400).json({ error: 'sections and settings are required' });
      }
      const result = await saveAiResult({ userId, sections, settings });
      return res.status(201).json({ id: result.id });
    }

    if (req.method === 'GET') {
      const id = parseInt(req.query.id as string, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Valid id is required' });
      }
      const result = await getAiResult(id);
      if (!result) {
        return res.status(404).json({ error: 'AI result not found' });
      }
      return res.status(200).json(result);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('AI results API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
