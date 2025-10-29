import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import Link from 'next/link';
import type { BlogPost } from '../../shared/schema';
import { format } from 'date-fns';

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
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-navy-900 mb-8">Blog</h1>

          {posts.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              No blog posts published yet.
            </div>
          ) : (
            <div className="space-y-8">
              {posts.map((post) => (
                <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  {post.featuredImage && (
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <Link href={`/blog/${post.slug}`}>
                      <h2 className="text-2xl font-bold text-navy-900 mb-2 hover:text-navy-700 transition-colors cursor-pointer">
                        {post.title}
                      </h2>
                    </Link>
                    <p className="text-sm text-gray-600 mb-4">
                      {post.publishedAt && format(new Date(post.publishedAt), 'MMMM d, yyyy')}
                    </p>
                    <div 
                      className="text-gray-700 line-clamp-3 mb-4"
                      dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                    <Link href={`/blog/${post.slug}`}>
                      <span className="text-navy-600 hover:text-navy-800 font-medium cursor-pointer">
                        Read more →
                      </span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
