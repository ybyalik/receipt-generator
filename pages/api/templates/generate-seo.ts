import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../server/storage';
import { templates, settings } from '../../../shared/schema';
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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { templateId } = req.body;

    if (!templateId) {
      return res.status(400).json({ error: 'Template ID is required' });
    }

    const template = await db.select().from(templates).where(eq(templates.id, templateId)).limit(1);

    if (!template || template.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const templateData = template[0];

    const settingsData = await db.select().from(settings).where(eq(settings.key, 'seo_prompt')).limit(1);
    
    const seoPrompt = settingsData.length > 0 ? settingsData[0].value : DEFAULT_SEO_PROMPT;

    const sectionsDescription = Array.isArray(templateData.sections)
      ? templateData.sections.map((s: any) => s.title || s.type).join(', ')
      : 'Various receipt sections';

    const finalPrompt = seoPrompt
      .replace('{templateName}', templateData.name)
      .replace('{sections}', sectionsDescription);

    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an SEO content expert specializing in creating optimized, engaging content for web pages.',
        },
        {
          role: 'user',
          content: finalPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const generatedContent = completion.choices[0]?.message?.content || '';

    return res.status(200).json({ 
      success: true, 
      content: generatedContent,
      promptUsed: finalPrompt
    });

  } catch (error) {
    console.error('Error generating SEO content:', error);
    return res.status(500).json({ error: 'Failed to generate SEO content' });
  }
}
