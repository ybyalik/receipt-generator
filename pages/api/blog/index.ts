import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllBlogPosts, getPublishedBlogPosts, createBlogPost } from '../../../server/storage';
import type { BlogPost } from '../../../shared/schema';

// Helper function to check if user is admin (MVP-level check)
function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
  return adminEmails.includes(email);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const { published } = req.query;
      const posts = published === 'true' 
        ? await getPublishedBlogPosts()
        : await getAllBlogPosts();
      res.status(200).json(posts);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      res.status(500).json({ error: 'Failed to fetch blog posts' });
    }
  } else if (req.method === 'POST') {
    // Check admin authorization for creating posts
    const { userEmail } = req.body;
    if (!isAdmin(userEmail)) {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }
    try {
      const { title, content, featuredImage, status } = req.body;
      
      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
      }
      
      // Generate slug from title
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      const newPost = await createBlogPost({
        title,
        slug,
        content,
        featuredImage: featuredImage || null,
        status: status || 'draft',
      });
      
      res.status(201).json(newPost);
    } catch (error) {
      console.error('Error creating blog post:', error);
      res.status(500).json({ error: 'Failed to create blog post' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
