import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllBlogPosts, getPublishedBlogPosts, getBlogPostById, createBlogPost, updateBlogPost, deleteBlogPost } from '../../server/storage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET': {
        const { published, id } = req.query;

        if (id) {
          const post = await getBlogPostById(parseInt(id as string));
          if (!post) {
            return res.status(404).json({ error: 'Blog post not found' });
          }
          return res.status(200).json(post);
        }

        const posts = published === 'true'
          ? await getPublishedBlogPosts()
          : await getAllBlogPosts();
        return res.status(200).json(posts);
      }

      case 'POST': {
        const post = await createBlogPost(req.body);
        return res.status(201).json(post);
      }

      case 'PUT': {
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({ error: 'Blog post ID is required' });
        }
        const updated = await updateBlogPost(parseInt(id as string), req.body);
        if (!updated) {
          return res.status(404).json({ error: 'Blog post not found' });
        }
        return res.status(200).json(updated);
      }

      case 'DELETE': {
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({ error: 'Blog post ID is required' });
        }
        const deleted = await deleteBlogPost(parseInt(id as string));
        if (!deleted) {
          return res.status(404).json({ error: 'Blog post not found' });
        }
        return res.status(200).json({ success: true });
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Blog API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
