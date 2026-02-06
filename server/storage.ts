import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { templates, userTemplates, users, blogPosts, aiResults, emailCaptures, emailSequenceSteps, emailSendLog, settings } from '../shared/schema';
import type { Template as ReceiptTemplate, Section } from '../lib/types';
import type { User, NewUser, BlogPost, NewBlogPost } from '../shared/schema';
import { eq, and, like, or, desc, asc, sql, not, inArray } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client);

export async function getAllTemplates(): Promise<ReceiptTemplate[]> {
  const result = await db.select().from(templates);
  return result.map(row => ({
    id: row.id.toString(),
    name: row.name,
    slug: row.slug,
    sections: row.sections as Section[],
    settings: row.settings as any,
    seoContent: (row as any).seoContent || undefined,
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
    seoContent: (row as any).seoContent || undefined,
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
    seoContent: (row as any).seoContent || undefined,
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
    seoContent: (template as any).seoContent || null,
  }).returning();
  
  const row = result[0];
  return {
    id: row.id.toString(),
    name: row.name,
    slug: row.slug,
    sections: row.sections as Section[],
    settings: row.settings as any,
    seoContent: (row as any).seoContent || undefined,
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
      ...((updates as any).seoContent !== undefined && { seoContent: (updates as any).seoContent }),
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
    seoContent: (row as any).seoContent || undefined,
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

export async function getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | null> {
  const result = await db.select().from(users).where(eq(users.stripeCustomerId, stripeCustomerId));
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

export async function updateUserSubscriptionByStripeCustomerId(
  stripeCustomerId: string,
  subscriptionData: {
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
    .where(eq(users.stripeCustomerId, stripeCustomerId))
    .returning();
  console.log(`updateUserSubscriptionByStripeCustomerId: Updated ${result.length} row(s) for customer ${stripeCustomerId}`);
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

// AI Results Functions
export async function saveAiResult(data: { userId?: string; sections: any; settings: any }) {
  const result = await db.insert(aiResults).values({
    userId: data.userId || null,
    sections: data.sections,
    settings: data.settings,
  }).returning();
  return result[0];
}

export async function getAiResult(id: number) {
  const result = await db.select().from(aiResults).where(eq(aiResults.id, id));
  return result.length > 0 ? result[0] : null;
}

export async function captureEmail(email: string, source: string = 'download') {
  const result = await db.insert(emailCaptures).values({ email, source }).returning();
  return result[0];
}

// ─── Email Campaign Functions ────────────────────────────────────

export async function getEmailCampaignEnabled(): Promise<boolean> {
  const result = await db.select().from(settings)
    .where(eq(settings.key, 'email_campaign_enabled')).limit(1);
  return result.length > 0 && result[0].value === 'true';
}

export async function setEmailCampaignEnabled(enabled: boolean): Promise<void> {
  const existing = await db.select().from(settings)
    .where(eq(settings.key, 'email_campaign_enabled')).limit(1);
  if (existing.length > 0) {
    await db.update(settings)
      .set({ value: enabled ? 'true' : 'false', updatedAt: new Date() })
      .where(eq(settings.key, 'email_campaign_enabled'));
  } else {
    await db.insert(settings).values({ key: 'email_campaign_enabled', value: enabled ? 'true' : 'false' });
  }
}

export async function getEmailSequenceSteps() {
  return db.select().from(emailSequenceSteps).orderBy(asc(emailSequenceSteps.stepNumber));
}

export async function getEmailSequenceStep(id: number) {
  const result = await db.select().from(emailSequenceSteps).where(eq(emailSequenceSteps.id, id));
  return result.length > 0 ? result[0] : null;
}

export async function createEmailSequenceStep(data: {
  stepNumber: number;
  delayMinutes: number;
  subject: string;
  htmlBody: string;
}) {
  const result = await db.insert(emailSequenceSteps).values(data).returning();
  return result[0];
}

export async function updateEmailSequenceStep(id: number, updates: {
  stepNumber?: number;
  delayMinutes?: number;
  subject?: string;
  htmlBody?: string;
  isActive?: boolean;
}) {
  const result = await db.update(emailSequenceSteps)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(emailSequenceSteps.id, id))
    .returning();
  return result.length > 0 ? result[0] : null;
}

export async function deleteEmailSequenceStep(id: number) {
  const result = await db.delete(emailSequenceSteps).where(eq(emailSequenceSteps.id, id));
  return true;
}

export async function getEligibleEmailsForStep(stepNumber: number, delayMinutes: number, limit: number = 50) {
  const cutoffISO = new Date(Date.now() - delayMinutes * 60 * 1000).toISOString();

  // Use raw SQL for DISTINCT ON which isn't well-supported in Drizzle with postgres.js
  const previousStepCondition = stepNumber > 1
    ? sql`AND ec.email IN (SELECT email FROM email_send_log WHERE step_number = ${stepNumber - 1} AND status = 'sent')`
    : sql``;

  const result = await db.execute(sql`
    SELECT DISTINCT ON (ec.email) ec.id, ec.email, ec.created_at as "createdAt"
    FROM email_captures ec
    WHERE ec.unsubscribed = false
      AND ec.created_at <= ${cutoffISO}::timestamptz
      AND ec.email NOT IN (SELECT email FROM users WHERE is_premium = true)
      AND ec.email NOT IN (SELECT email FROM email_send_log WHERE step_number = ${stepNumber})
      ${previousStepCondition}
    ORDER BY ec.email, ec.created_at ASC
    LIMIT ${limit}
  `);

  return (result.rows || result) as { id: number; email: string; createdAt: Date }[];
}

export async function logEmailSend(data: {
  emailCaptureId: number;
  email: string;
  stepNumber: number;
  status: string;
  resendMessageId?: string;
  errorMessage?: string;
}) {
  const result = await db.insert(emailSendLog).values(data).returning();
  return result[0];
}

export async function getEmailCampaignStats() {
  const totalLeads = await db.select({ count: sql<number>`count(distinct email)` })
    .from(emailCaptures);
  const unsubscribedCount = await db.select({ count: sql<number>`count(distinct email)` })
    .from(emailCaptures)
    .where(eq(emailCaptures.unsubscribed, true));
  const totalSent = await db.select({ count: sql<number>`count(*)` })
    .from(emailSendLog)
    .where(eq(emailSendLog.status, 'sent'));
  const totalFailed = await db.select({ count: sql<number>`count(*)` })
    .from(emailSendLog)
    .where(eq(emailSendLog.status, 'failed'));

  // Count captured emails that are also premium users
  const premiumUsers = await db.select({ email: users.email })
    .from(users)
    .where(eq(users.isPremium, true));
  const premiumEmails = premiumUsers.map(u => u.email);

  let purchaserCount = 0;
  if (premiumEmails.length > 0) {
    const result = await db.select({ count: sql<number>`count(distinct email)` })
      .from(emailCaptures)
      .where(inArray(emailCaptures.email, premiumEmails));
    purchaserCount = Number(result[0]?.count || 0);
  }

  return {
    totalLeads: Number(totalLeads[0]?.count || 0),
    unsubscribed: Number(unsubscribedCount[0]?.count || 0),
    purchasers: purchaserCount,
    totalSent: Number(totalSent[0]?.count || 0),
    totalFailed: Number(totalFailed[0]?.count || 0),
  };
}

export async function getRecentSendLogs(limit: number = 50) {
  return db.select().from(emailSendLog)
    .orderBy(desc(emailSendLog.sentAt))
    .limit(limit);
}

export async function getEmailCaptureLeads(limit: number = 100, offset: number = 0) {
  const result = await db.execute(sql`
    SELECT DISTINCT ON (email) id, email, source, unsubscribed, created_at as "createdAt"
    FROM email_captures
    ORDER BY email, created_at ASC
    LIMIT ${limit} OFFSET ${offset}
  `);
  return (result.rows || result) as { id: number; email: string; source: string; unsubscribed: boolean; createdAt: Date }[];
}

export async function unsubscribeEmail(email: string): Promise<void> {
  await db.update(emailCaptures)
    .set({ unsubscribed: true })
    .where(eq(emailCaptures.email, email));
}
