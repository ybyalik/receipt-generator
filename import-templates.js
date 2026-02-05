// Import Templates Script
// Usage:
// 1. Save your templates JSON to templates-data.json
// 2. Run: node import-templates.js

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function importTemplates() {
  // Read templates from JSON file
  const templatesPath = path.join(__dirname, 'templates-data.json');

  if (!fs.existsSync(templatesPath)) {
    console.error('Error: templates-data.json not found!');
    console.log('Please save your templates JSON array to templates-data.json');
    process.exit(1);
  }

  let templates;
  try {
    const fileContent = fs.readFileSync(templatesPath, 'utf8');
    templates = JSON.parse(fileContent);
  } catch (err) {
    console.error('Error parsing templates-data.json:', err.message);
    process.exit(1);
  }

  if (!Array.isArray(templates) || templates.length === 0) {
    console.error('Error: templates-data.json must contain a non-empty array');
    process.exit(1);
  }

  console.log(`Found ${templates.length} templates to import`);

  // Connect to database
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  const client = await pool.connect();

  try {
    console.log('Starting templates import...\n');

    let successCount = 0;
    let errorCount = 0;

    for (const template of templates) {
      try {
        const query = `
          INSERT INTO templates (id, name, slug, sections, settings, seo_content, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            slug = EXCLUDED.slug,
            sections = EXCLUDED.sections,
            settings = EXCLUDED.settings,
            seo_content = EXCLUDED.seo_content,
            updated_at = EXCLUDED.updated_at
        `;

        await client.query(query, [
          template.id,
          template.name,
          template.slug,
          JSON.stringify(template.sections),
          JSON.stringify(template.settings),
          template.seo_content || null,
          template.created_at,
          template.updated_at
        ]);

        console.log(`✓ Imported: ${template.name} (ID: ${template.id})`);
        successCount++;
      } catch (err) {
        console.error(`✗ Failed: ${template.name} (ID: ${template.id}) - ${err.message}`);
        errorCount++;
      }
    }

    // Reset the sequence to max ID
    await client.query(`SELECT setval('templates_id_seq', (SELECT COALESCE(MAX(id), 1) FROM templates))`);

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

importTemplates().catch(console.error);
