import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../server/storage';
import { blogPosts } from '../../../shared/schema';
import { eq } from 'drizzle-orm';

interface Article {
  id: string;
  title: string;
  content_markdown: string;
  content_html: string;
  meta_description: string;
  created_at: string;
  image_url: string;
  slug: string;
  tags: string[];
}

interface WebhookPayload {
  event_type: string;
  timestamp: string;
  data: {
    articles: Article[];
  };
}

function validateAccessToken(req: NextApiRequest): { valid: boolean; error?: string } {
  const expectedToken = process.env.WEBHOOK_ACCESS_TOKEN;
  
  if (!expectedToken) {
    return { valid: false, error: 'Server misconfiguration: WEBHOOK_ACCESS_TOKEN not set' };
  }
  
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { valid: false, error: 'Missing or invalid Authorization header' };
  }
  
  const token = authHeader.split(" ")[1];
  
  if (token !== expectedToken) {
    return { valid: false, error: 'Invalid access token' };
  }
  
  return { valid: true };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authResult = validateAccessToken(req);
  if (!authResult.valid) {
    const statusCode = authResult.error?.includes('misconfiguration') ? 503 : 401;
    console.error('Authentication failed:', authResult.error);
    return res.status(statusCode).json({ error: authResult.error });
  }

  try {
    const payload: WebhookPayload = req.body;

    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ error: 'Invalid payload: expected JSON object' });
    }

    if (payload.event_type !== 'publish_articles') {
      return res.status(400).json({ error: 'Unsupported event type' });
    }

    if (!payload.data?.articles || !Array.isArray(payload.data.articles)) {
      return res.status(400).json({ error: 'Invalid payload: articles array required' });
    }

    if (payload.data.articles.length === 0) {
      return res.status(400).json({ error: 'Invalid payload: articles array is empty' });
    }

    if (payload.data.articles.length > 50) {
      return res.status(400).json({ error: 'Invalid payload: too many articles (max 50 per request)' });
    }

    const results = {
      success: [] as string[],
      failed: [] as { slug: string; error: string }[],
    };

    for (const article of payload.data.articles) {
      try {
        if (!article.title || !article.slug || !article.content_html) {
          throw new Error('Missing required fields: title, slug, or content_html');
        }

        if (article.slug.length > 200) {
          throw new Error('Slug too long (max 200 characters)');
        }

        const existingPost = await db
          .select()
          .from(blogPosts)
          .where(eq(blogPosts.slug, article.slug))
          .limit(1);

        if (existingPost.length > 0) {
          await db
            .update(blogPosts)
            .set({
              title: article.title,
              content: article.content_html,
              featuredImage: article.image_url || null,
              tags: article.tags || [],
              metaDescription: article.meta_description || null,
              status: 'published',
              publishedAt: new Date(article.created_at),
              updatedAt: new Date(),
            })
            .where(eq(blogPosts.slug, article.slug));

          results.success.push(article.slug);
          console.log(`Updated article: ${article.slug}`);
        } else {
          await db.insert(blogPosts).values({
            title: article.title,
            slug: article.slug,
            content: article.content_html,
            featuredImage: article.image_url || null,
            tags: article.tags || [],
            metaDescription: article.meta_description || null,
            status: 'published',
            publishedAt: new Date(article.created_at),
            createdAt: new Date(article.created_at),
            updatedAt: new Date(),
          });

          results.success.push(article.slug);
          console.log(`Created article: ${article.slug}`);
        }
      } catch (error: any) {
        console.error(`Failed to process article ${article.slug}:`, error);
        results.failed.push({
          slug: article.slug,
          error: error.message || 'Unknown error',
        });
      }
    }

    const statusCode = results.failed.length > 0 ? 207 : 200;
    
    return res.status(statusCode).json({
      message: 'Webhook processed',
      processed: payload.data.articles.length,
      successful: results.success.length,
      failed: results.failed.length,
      results: results,
    });

  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
