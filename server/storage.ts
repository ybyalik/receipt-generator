import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { templates } from '../shared/schema';
import type { Template as ReceiptTemplate, Section } from '../lib/types';
import { eq } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

export async function getAllTemplates(): Promise<ReceiptTemplate[]> {
  const result = await db.select().from(templates);
  return result.map(row => ({
    id: row.id.toString(),
    name: row.name,
    slug: row.slug,
    sections: row.sections as Section[],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }));
}

export async function getTemplateById(id: string): Promise<ReceiptTemplate | null> {
  const result = await db.select().from(templates).where(eq(templates.id, parseInt(id)));
  if (result.length === 0) return null;
  
  const row = result[0];
  return {
    id: row.id.toString(),
    name: row.name,
    slug: row.slug,
    sections: row.sections as Section[],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getTemplateBySlug(slug: string): Promise<ReceiptTemplate | null> {
  const result = await db.select().from(templates).where(eq(templates.slug, slug));
  if (result.length === 0) return null;
  
  const row = result[0];
  return {
    id: row.id.toString(),
    name: row.name,
    slug: row.slug,
    sections: row.sections as Section[],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function createTemplate(template: Omit<ReceiptTemplate, 'id'>): Promise<ReceiptTemplate> {
  const result = await db.insert(templates).values({
    name: template.name,
    slug: template.slug,
    sections: template.sections as any,
  }).returning();
  
  const row = result[0];
  return {
    id: row.id.toString(),
    name: row.name,
    slug: row.slug,
    sections: row.sections as Section[],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function updateTemplate(id: string, updates: Partial<Omit<ReceiptTemplate, 'id'>>): Promise<ReceiptTemplate | null> {
  const result = await db.update(templates)
    .set({
      ...(updates.name && { name: updates.name }),
      ...(updates.slug && { slug: updates.slug }),
      ...(updates.sections && { sections: updates.sections as any }),
      updatedAt: new Date(),
    })
    .where(eq(templates.id, parseInt(id)))
    .returning();
  
  if (result.length === 0) return null;
  
  const row = result[0];
  return {
    id: row.id.toString(),
    name: row.name,
    slug: row.slug,
    sections: row.sections as Section[],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function deleteTemplate(id: string): Promise<boolean> {
  const result = await db.delete(templates).where(eq(templates.id, parseInt(id))).returning();
  return result.length > 0;
}
