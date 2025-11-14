import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../server/storage';
import { settings } from '../../../shared/schema';
import { eq } from 'drizzle-orm';

const SEO_PROMPT_KEY = 'seo_generation_prompt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const result = await db
        .select()
        .from(settings)
        .where(eq(settings.key, SEO_PROMPT_KEY))
        .limit(1);

      if (result.length > 0) {
        return res.status(200).json({ prompt: result[0].value });
      } else {
        return res.status(200).json({ prompt: null });
      }
    } catch (error) {
      console.error('Error fetching SEO prompt:', error);
      return res.status(500).json({ error: 'Failed to fetch settings' });
    }
  }

  if (req.method === 'POST') {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
      const existing = await db
        .select()
        .from(settings)
        .where(eq(settings.key, SEO_PROMPT_KEY))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(settings)
          .set({ value: prompt, updatedAt: new Date() })
          .where(eq(settings.key, SEO_PROMPT_KEY));
      } else {
        await db.insert(settings).values({
          key: SEO_PROMPT_KEY,
          value: prompt,
        });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error saving SEO prompt:', error);
      return res.status(500).json({ error: 'Failed to save settings' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
