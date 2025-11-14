import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { getTemplateById, updateTemplate, db } from '../../../server/storage';
import { settings } from '../../../shared/schema';
import { eq } from 'drizzle-orm';

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const DEFAULT_PROMPT = `Generate SEO-optimized content for a receipt template titled "{templateName}".

Template Details:
- Name: {templateName}
- Industry/Type: {industry}

Create engaging, informative content (300-500 words) that:
1. Explains what this receipt template is for
2. Describes who would use it (target audience)
3. Highlights key features and sections
4. Includes relevant keywords naturally
5. Provides helpful tips for using this type of receipt
6. Uses clear headings and well-structured paragraphs

Format the content in HTML using these tags only:
- <h2> for main headings
- <h3> for subheadings
- <p> for paragraphs
- <strong> for emphasis
- <ul> and <li> for bullet lists

Make it professional, helpful, and SEO-friendly.`;

async function getPromptTemplate(): Promise<string> {
  try {
    const result = await db
      .select()
      .from(settings)
      .where(eq(settings.key, 'seo_generation_prompt'))
      .limit(1);
    
    return result.length > 0 ? result[0].value : DEFAULT_PROMPT;
  } catch (error) {
    console.error('Error fetching prompt template:', error);
    return DEFAULT_PROMPT;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { templateId } = req.body;

  if (!templateId) {
    return res.status(400).json({ error: 'Template ID is required' });
  }

  try {
    const template = await getTemplateById(templateId.toString());
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const promptTemplate = await getPromptTemplate();
    const industry = template.name.replace(/Receipt$/i, '').trim();
    
    const prompt = promptTemplate
      .replace(/\{templateName\}/g, template.name)
      .replace(/\{industry\}/g, industry);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an SEO content writer specializing in creating helpful, keyword-rich content for business templates. Write clear, professional content in HTML format.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const content = response.choices[0].message.content?.trim() || '';
    
    if (!content) {
      throw new Error('No content generated');
    }

    await updateTemplate(templateId.toString(), {
      seoContent: content,
    });

    return res.status(200).json({ 
      success: true,
      content 
    });

  } catch (error: any) {
    console.error('Error generating SEO content:', error);
    return res.status(500).json({ 
      error: 'Failed to generate SEO content',
      details: error.message 
    });
  }
}
