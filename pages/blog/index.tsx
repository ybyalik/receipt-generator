import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import Link from 'next/link';
import type { BlogPost } from '../../shared/schema';
import { format } from 'date-fns';

function stripHtml(html: string): string {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text;
}

function getExcerpt(html: string, maxLength: number = 150): string {
  const text = stripHtml(html);
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

export default function BlogIndex() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/blog?published=true');
      const data = await res.json();
      setPosts(data);
    } catch (error) {
      console.error('Failed to fetch blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gray-600">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-6 sm:mb-8">Blog</h1>

          {posts.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              No blog posts published yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
                    {post.featuredImage && (
                      <div className="aspect-video w-full overflow-hidden">
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6 flex-grow flex flex-col">
                      <h2 className="text-xl font-bold text-navy-900 mb-2 hover:text-navy-700 transition-colors">
                        {post.title}
                      </h2>
                      <p className="text-sm text-gray-600 mb-4">
                        {post.publishedAt && format(new Date(post.publishedAt), 'MMMM d, yyyy')}
                      </p>
                      <p className="text-gray-700 line-clamp-3 flex-grow">
                        {getExcerpt(post.content, 180)}
                      </p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
