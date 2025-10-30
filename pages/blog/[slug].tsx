import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../components/Layout';
import type { BlogPost } from '../../shared/schema';
import { format } from 'date-fns';

export default function BlogPost() {
  const router = useRouter();
  const { slug } = router.query;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      const res = await fetch('/api/blog?published=true');
      const data: BlogPost[] = await res.json();
      const foundPost = data.find(p => p.slug === slug);
      
      if (foundPost) {
        setPost(foundPost);
      } else {
        setError(true);
      }
    } catch (error) {
      console.error('Failed to fetch blog post:', error);
      setError(true);
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

  if (error || !post) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Post not found</h1>
            <p className="text-gray-600 mb-4">The blog post you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/blog" className="text-navy-600 hover:text-navy-800">
              ← Back to blog
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // Extract plain text from HTML content for meta description
  const getMetaDescription = (htmlContent: string): string => {
    const text = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return text.length > 155 ? text.substring(0, 155) + '...' : text;
  };

  return (
    <Layout>
      <Head>
        <title>{post.title} | Blog</title>
        <meta name="description" content={getMetaDescription(post.content)} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={getMetaDescription(post.content)} />
        <meta property="og:type" content="article" />
        {post.featuredImage && <meta property="og:image" content={post.featuredImage} />}
        {post.publishedAt && <meta property="article:published_time" content={new Date(post.publishedAt).toISOString()} />}
      </Head>

      <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
        <article className="max-w-3xl mx-auto px-4">
          <Link href="/blog" className="text-navy-600 hover:text-navy-800 mb-4 sm:mb-6 inline-block">
            ← Back to blog
          </Link>

          {post.featuredImage && (
            <div className="aspect-video w-full overflow-hidden rounded-lg mb-4 sm:mb-6">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <h1 className="text-2xl sm:text-4xl font-bold text-navy-900 mb-3 sm:mb-4">{post.title}</h1>
          
          <p className="text-gray-600 mb-8">
            {post.publishedAt && format(new Date(post.publishedAt), 'MMMM d, yyyy')}
          </p>

          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </div>
    </Layout>
  );
}
