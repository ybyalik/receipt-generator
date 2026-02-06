import type { NextPage, GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import { getAllTemplates } from '../server/storage';
import { getPublishedBlogPosts } from '../server/storage';
import type { Template, BlogPost } from '../shared/schema';

interface SitemapPageProps {
  templates: Template[];
  blogPosts: BlogPost[];
}

const Sitemap: NextPage<SitemapPageProps> = ({ templates, blogPosts }) => {
  return (
    <Layout breadcrumbs={[{ label: 'Sitemap' }]}>
      <Head>
        <title>Sitemap - Receipt Generator</title>
        <meta name="description" content="Complete sitemap of Receipt Generator. Find all pages including templates, blog posts, and more." />
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">Sitemap</h1>

        <div className="space-y-10">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Main Pages</h2>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-teal-600 hover:text-teal-700 hover:underline">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/templates" className="text-teal-600 hover:text-teal-700 hover:underline">
                  Templates
                </Link>
              </li>
              <li>
                <Link href="/ai" className="text-teal-600 hover:text-teal-700 hover:underline">
                  AI Receipt Generator
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-teal-600 hover:text-teal-700 hover:underline">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-teal-600 hover:text-teal-700 hover:underline">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-teal-600 hover:text-teal-700 hover:underline">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-teal-600 hover:text-teal-700 hover:underline">
                  About Us
                </Link>
              </li>
            </ul>
          </section>

          {templates.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Receipt Templates</h2>
              <ul className="space-y-2 columns-1 sm:columns-2 lg:columns-3">
                {templates.map((template) => (
                  <li key={template.id} className="break-inside-avoid">
                    <Link 
                      href={`/template/${template.slug}`} 
                      className="text-teal-600 hover:text-teal-700 hover:underline"
                    >
                      {template.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {blogPosts.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Blog Posts</h2>
              <ul className="space-y-2">
                {blogPosts.map((post) => (
                  <li key={post.id}>
                    <Link 
                      href={`/blog/${post.slug}`} 
                      className="text-teal-600 hover:text-teal-700 hover:underline"
                    >
                      {post.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Legal</h2>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-teal-600 hover:text-teal-700 hover:underline">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-teal-600 hover:text-teal-700 hover:underline">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps<SitemapPageProps> = async () => {
  try {
    const [templates, blogPosts] = await Promise.all([
      getAllTemplates(),
      getPublishedBlogPosts(),
    ]);

    return {
      props: {
        templates: JSON.parse(JSON.stringify(templates)),
        blogPosts: JSON.parse(JSON.stringify(blogPosts)),
      },
    };
  } catch (error) {
    console.error('Failed to fetch sitemap data:', error);
    return {
      props: {
        templates: [],
        blogPosts: [],
      },
    };
  }
};

export default Sitemap;
