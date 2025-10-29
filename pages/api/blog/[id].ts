import type { NextApiRequest, NextApiResponse } from 'next';
import { getBlogPostById, updateBlogPost, deleteBlogPost } from '../../../server/storage';

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
  const { id } = req.query;
  const postId = parseInt(id as string);
  
  if (isNaN(postId)) {
    return res.status(400).json({ error: 'Invalid post ID' });
  }

  if (req.method === 'GET') {
    try {
      const post = await getBlogPostById(postId);
      if (!post) {
        return res.status(404).json({ error: 'Blog post not found' });
      }
      res.status(200).json(post);
    } catch (error) {
      console.error('Error fetching blog post:', error);
      res.status(500).json({ error: 'Failed to fetch blog post' });
    }
  } else if (req.method === 'PUT') {
    // Check admin authorization for updating posts
    const { userEmail } = req.body;
    if (!isAdmin(userEmail)) {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }
    
    try {
      const { title, content, featuredImage, status } = req.body;
      
      const updates: any = {};
      if (title) {
        updates.title = title;
        updates.slug = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
      if (content !== undefined) updates.content = content;
      if (featuredImage !== undefined) updates.featuredImage = featuredImage;
      if (status) updates.status = status;
      
      const updatedPost = await updateBlogPost(postId, updates);
      if (!updatedPost) {
        return res.status(404).json({ error: 'Blog post not found' });
      }
      res.status(200).json(updatedPost);
    } catch (error) {
      console.error('Error updating blog post:', error);
      res.status(500).json({ error: 'Failed to update blog post' });
    }
  } else if (req.method === 'DELETE') {
    // Check admin authorization for deleting posts
    const { userEmail } = req.body;
    if (!isAdmin(userEmail)) {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }
    
    try {
      const deleted = await deleteBlogPost(postId);
      if (!deleted) {
        return res.status(404).json({ error: 'Blog post not found' });
      }
      res.status(200).json({ message: 'Blog post deleted successfully' });
    } catch (error) {
      console.error('Error deleting blog post:', error);
      res.status(500).json({ error: 'Failed to delete blog post' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
