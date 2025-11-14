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

function validateAccessToken(req: NextApiRequest): boolean {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }
  
  const token = authHeader.split(" ")[1];
  const expectedToken = process.env.WEBHOOK_ACCESS_TOKEN;
  
  if (!expectedToken) {
    console.error('WEBHOOK_ACCESS_TOKEN not configured');
    return false;
  }
  
  return token === expectedToken;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!validateAccessToken(req)) {
    console.error('Invalid access token received');
    return res.status(401).json({ error: 'Invalid access token' });
  }

  try {
    const payload: WebhookPayload = req.body;

    if (payload.event_type !== 'publish_articles') {
      return res.status(400).json({ error: 'Unsupported event type' });
    }

    if (!payload.data?.articles || !Array.isArray(payload.data.articles)) {
      return res.status(400).json({ error: 'Invalid payload: articles array required' });
    }

    const results = {
      success: [] as string[],
      failed: [] as { slug: string; error: string }[],
    };

    for (const article of payload.data.articles) {
      try {
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
