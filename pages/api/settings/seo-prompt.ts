import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../server/storage';
import { settings } from '../../../shared/schema';
import { eq } from 'drizzle-orm';

const DEFAULT_SEO_PROMPT = `You are an SEO content writer. Given a receipt template name and description, create engaging, SEO-optimized content that:

1. Explains what this receipt template is used for
2. Highlights key features and sections included
3. Describes who would benefit from using it
4. Includes relevant keywords naturally
5. Is written in a friendly, professional tone

Template Details:
- Name: {templateName}
- Sections: {sections}

Generate comprehensive HTML content (using <h2>, <h3>, <p>, <ul>, <li> tags) that would help users understand this template and improve SEO. Keep it between 300-500 words.`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const result = await db.select().from(settings).where(eq(settings.key, 'seo_prompt')).limit(1);
      
      const prompt = result.length > 0 ? result[0].value : DEFAULT_SEO_PROMPT;
      
      return res.status(200).json({ 
        prompt,
        isDefault: result.length === 0
      });
    } catch (error) {
      console.error('Error fetching SEO prompt:', error);
      return res.status(500).json({ error: 'Failed to fetch SEO prompt' });
    }
  } 
  
  else if (req.method === 'PUT') {
    try {
      const { prompt } = req.body;

      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'Valid prompt is required' });
      }

      const existing = await db.select().from(settings).where(eq(settings.key, 'seo_prompt')).limit(1);

      if (existing.length > 0) {
        await db.update(settings)
          .set({ 
            value: prompt,
            updatedAt: new Date()
          })
          .where(eq(settings.key, 'seo_prompt'));
      } else {
        await db.insert(settings).values({
          key: 'seo_prompt',
          value: prompt,
        });
      }

      return res.status(200).json({ 
        success: true,
        message: 'SEO prompt updated successfully'
      });
    } catch (error) {
      console.error('Error updating SEO prompt:', error);
      return res.status(500).json({ error: 'Failed to update SEO prompt' });
    }
  }
  
  else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
