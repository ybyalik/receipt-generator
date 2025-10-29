import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { templates, userTemplates, users, blogPosts } from '../shared/schema';
import type { Template as ReceiptTemplate, Section } from '../lib/types';
import type { User, NewUser, BlogPost, NewBlogPost } from '../shared/schema';
import { eq, and, like, or, desc } from 'drizzle-orm';

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
    settings: row.settings as any,
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
    settings: row.settings as any,
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
    settings: row.settings as any,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function createTemplate(template: Omit<ReceiptTemplate, 'id'>): Promise<ReceiptTemplate> {
  const result = await db.insert(templates).values({
    name: template.name,
    slug: template.slug,
    sections: template.sections as any,
    settings: template.settings as any,
  }).returning();
  
  const row = result[0];
  return {
    id: row.id.toString(),
    name: row.name,
    slug: row.slug,
    sections: row.sections as Section[],
    settings: row.settings as any,
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
      ...(updates.settings && { settings: updates.settings as any }),
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
    settings: row.settings as any,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function deleteTemplate(id: string): Promise<boolean> {
  const result = await db.delete(templates).where(eq(templates.id, parseInt(id))).returning();
  return result.length > 0;
}

// User Templates CRUD operations
export async function getUserTemplates(userId: string): Promise<ReceiptTemplate[]> {
  const result = await db.select().from(userTemplates).where(eq(userTemplates.userId, userId));
  return result.map(row => ({
    id: row.id.toString(),
    name: row.name,
    slug: row.slug,
    sections: row.sections as Section[],
    settings: row.settings as any,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }));
}

export async function getUserTemplateById(id: string, userId: string): Promise<ReceiptTemplate | null> {
  const result = await db.select().from(userTemplates).where(
    and(eq(userTemplates.id, parseInt(id)), eq(userTemplates.userId, userId))
  );
  if (result.length === 0) return null;
  
  const row = result[0];
  return {
    id: row.id.toString(),
    name: row.name,
    slug: row.slug,
    sections: row.sections as Section[],
    settings: row.settings as any,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function createUserTemplate(
  userId: string,
  template: Omit<ReceiptTemplate, 'id'>,
  baseTemplateId?: string
): Promise<ReceiptTemplate> {
  const result = await db.insert(userTemplates).values({
    userId,
    baseTemplateId: baseTemplateId ? parseInt(baseTemplateId) : null,
    name: template.name,
    slug: template.slug,
    sections: template.sections as any,
    settings: template.settings as any,
  }).returning();
  
  const row = result[0];
  return {
    id: row.id.toString(),
    name: row.name,
    slug: row.slug,
    sections: row.sections as Section[],
    settings: row.settings as any,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function updateUserTemplate(
  id: string,
  userId: string,
  updates: Partial<Omit<ReceiptTemplate, 'id'>>
): Promise<ReceiptTemplate | null> {
  const result = await db.update(userTemplates)
    .set({
      ...(updates.name && { name: updates.name }),
      ...(updates.slug && { slug: updates.slug }),
      ...(updates.sections && { sections: updates.sections as any }),
      ...(updates.settings && { settings: updates.settings as any }),
      updatedAt: new Date(),
    })
    .where(and(eq(userTemplates.id, parseInt(id)), eq(userTemplates.userId, userId)))
    .returning();
  
  if (result.length === 0) return null;
  
  const row = result[0];
  return {
    id: row.id.toString(),
    name: row.name,
    slug: row.slug,
    sections: row.sections as Section[],
    settings: row.settings as any,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function deleteUserTemplate(id: string, userId: string): Promise<boolean> {
  const result = await db.delete(userTemplates)
    .where(and(eq(userTemplates.id, parseInt(id)), eq(userTemplates.userId, userId)))
    .returning();
  return result.length > 0;
}

// User management functions
export async function getUserByFirebaseUid(firebaseUid: string): Promise<User | null> {
  const result = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid));
  return result.length > 0 ? result[0] : null;
}

export async function getUserById(id: number): Promise<User | null> {
  const result = await db.select().from(users).where(eq(users.id, id));
  return result.length > 0 ? result[0] : null;
}

export async function getAllUsers(searchQuery?: string): Promise<User[]> {
  if (searchQuery) {
    const result = await db.select().from(users).where(
      or(
        like(users.email, `%${searchQuery}%`),
        like(users.displayName, `%${searchQuery}%`)
      )
    );
    return result;
  }
  const result = await db.select().from(users);
  return result;
}

export async function createUser(userData: NewUser): Promise<User> {
  const result = await db.insert(users).values(userData).returning();
  return result[0];
}

export async function updateUser(id: number, updates: Partial<User>): Promise<User | null> {
  const result = await db.update(users)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id))
    .returning();
  return result.length > 0 ? result[0] : null;
}

export async function updateUserSubscription(
  firebaseUid: string,
  subscriptionData: {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    subscriptionPlan?: string;
    subscriptionStatus?: string;
    subscriptionEndsAt?: Date;
    isPremium?: boolean;
  }
): Promise<User | null> {
  const result = await db.update(users)
    .set({
      ...subscriptionData,
      updatedAt: new Date(),
    })
    .where(eq(users.firebaseUid, firebaseUid))
    .returning();
  return result.length > 0 ? result[0] : null;
}

export async function deleteUser(id: number): Promise<boolean> {
  const result = await db.delete(users).where(eq(users.id, id)).returning();
  return result.length > 0;
}

// Blog Posts Functions
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const result = await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
  return result;
}

export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  const result = await db.select().from(blogPosts)
    .where(eq(blogPosts.status, 'published'))
    .orderBy(desc(blogPosts.publishedAt));
  return result;
}

export async function getBlogPostById(id: number): Promise<BlogPost | null> {
  const result = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
  return result.length > 0 ? result[0] : null;
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const result = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
  return result.length > 0 ? result[0] : null;
}

export async function createBlogPost(post: NewBlogPost): Promise<BlogPost> {
  const result = await db.insert(blogPosts).values({
    ...post,
    publishedAt: post.status === 'published' ? new Date() : null,
  }).returning();
  return result[0];
}

export async function updateBlogPost(id: number, updates: Partial<NewBlogPost>): Promise<BlogPost | null> {
  const currentPost = await getBlogPostById(id);
  const wasPublished = currentPost?.status === 'published';
  const isNowPublished = updates.status === 'published';
  
  const result = await db.update(blogPosts)
    .set({
      ...updates,
      updatedAt: new Date(),
      publishedAt: !wasPublished && isNowPublished ? new Date() : currentPost?.publishedAt,
    })
    .where(eq(blogPosts.id, id))
    .returning();
  return result.length > 0 ? result[0] : null;
}

export async function deleteBlogPost(id: number): Promise<boolean> {
  const result = await db.delete(blogPosts).where(eq(blogPosts.id, id)).returning();
  return result.length > 0;
}
