// Import Blog Posts Script
// Usage:
// 1. Save your blog posts JSON to blog-posts-data.json
// 2. Run: node import-blog-posts.js

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function importBlogPosts() {
  // Read blog posts from JSON file
  const blogPostsPath = path.join(__dirname, 'blog-posts-data.json');

  if (!fs.existsSync(blogPostsPath)) {
    console.error('Error: blog-posts-data.json not found!');
    console.log('Please save your blog posts JSON array to blog-posts-data.json');
    process.exit(1);
  }

  let blogPosts;
  try {
    const fileContent = fs.readFileSync(blogPostsPath, 'utf8');
    blogPosts = JSON.parse(fileContent);
  } catch (err) {
    console.error('Error parsing blog-posts-data.json:', err.message);
    process.exit(1);
  }

  if (!Array.isArray(blogPosts) || blogPosts.length === 0) {
    console.error('Error: blog-posts-data.json must contain a non-empty array');
    process.exit(1);
  }

  console.log(`Found ${blogPosts.length} blog posts to import`);

  // Connect to database
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  const client = await pool.connect();

  try {
    console.log('Starting blog posts import...\n');

    let successCount = 0;
    let errorCount = 0;

    for (const post of blogPosts) {
      try {
        // Table schema: id, title, slug, content, featured_image, tags, meta_description, status, published_at, created_at, updated_at
        const query = `
          INSERT INTO blog_posts (id, title, slug, content, featured_image, tags, meta_description, status, published_at, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            slug = EXCLUDED.slug,
            content = EXCLUDED.content,
            featured_image = EXCLUDED.featured_image,
            tags = EXCLUDED.tags,
            meta_description = EXCLUDED.meta_description,
            status = EXCLUDED.status,
            published_at = EXCLUDED.published_at,
            updated_at = EXCLUDED.updated_at
        `;

        await client.query(query, [
          post.id,
          post.title,
          post.slug,
          post.content,
          post.featured_image || null,
          post.tags ? JSON.stringify(post.tags) : null,
          post.meta_description || null,
          post.status || 'draft',
          post.published_at || null,
          post.created_at,
          post.updated_at
        ]);

        console.log(`✓ Imported: ${post.title} (ID: ${post.id})`);
        successCount++;
      } catch (err) {
        console.error(`✗ Failed: ${post.title} (ID: ${post.id}) - ${err.message}`);
        errorCount++;
      }
    }

    // Reset the sequence to max ID
    await client.query(`SELECT setval('blog_posts_id_seq', (SELECT COALESCE(MAX(id), 1) FROM blog_posts))`);

    console.log('\n========================================');
    console.log(`Import complete!`);
    console.log(`Success: ${successCount}`);
    console.log(`Failed: ${errorCount}`);
    console.log('========================================');

  } catch (error) {
    console.error('Error during import:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

importBlogPosts().catch(console.error);
