import { pgTable, serial, text, jsonb, timestamp, integer, boolean } from 'drizzle-orm/pg-core';

export const templates = pgTable('templates', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  sections: jsonb('sections').notNull(),
  settings: jsonb('settings').notNull(),
  seoContent: text('seo_content'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const userTemplates = pgTable('user_templates', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  baseTemplateId: integer('base_template_id'),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  sections: jsonb('sections').notNull(),
  settings: jsonb('settings').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  firebaseUid: text('firebase_uid').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name'),
  photoURL: text('photo_url'),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  subscriptionPlan: text('subscription_plan'), // 'weekly', 'monthly', 'yearly'
  subscriptionStatus: text('subscription_status'), // 'active', 'canceled', 'past_due', 'trialing'
  subscriptionEndsAt: timestamp('subscription_ends_at'),
  isPremium: boolean('is_premium').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const blogPosts = pgTable('blog_posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content').notNull(),
  featuredImage: text('featured_image'),
  tags: jsonb('tags'),
  metaDescription: text('meta_description'),
  status: text('status').notNull().default('draft'), // 'draft' | 'published'
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const aiResults = pgTable('ai_results', {
  id: serial('id').primaryKey(),
  userId: text('user_id'),
  sections: jsonb('sections').notNull(),
  settings: jsonb('settings').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const emailCaptures = pgTable('email_captures', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  source: text('source').notNull().default('download'),
  unsubscribed: boolean('unsubscribed').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const emailSequenceSteps = pgTable('email_sequence_steps', {
  id: serial('id').primaryKey(),
  stepNumber: integer('step_number').notNull(),
  delayMinutes: integer('delay_minutes').notNull(),
  subject: text('subject').notNull(),
  htmlBody: text('html_body').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const emailSendLog = pgTable('email_send_log', {
  id: serial('id').primaryKey(),
  emailCaptureId: integer('email_capture_id').notNull(),
  email: text('email').notNull(),
  stepNumber: integer('step_number').notNull(),
  status: text('status').notNull(),
  resendMessageId: text('resend_message_id'),
  errorMessage: text('error_message'),
  sentAt: timestamp('sent_at').defaultNow().notNull(),
});

export const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Base inferred types
type TemplateBase = typeof templates.$inferSelect;

// Extended Template type with seoContent included explicitly
export type Template = TemplateBase & {
  seoContent?: string | null;
};

export type NewTemplate = typeof templates.$inferInsert;
export type UserTemplate = typeof userTemplates.$inferSelect;
export type NewUserTemplate = typeof userTemplates.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;
export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;
export type AIResult = typeof aiResults.$inferSelect;
export type NewAIResult = typeof aiResults.$inferInsert;
export type EmailCapture = typeof emailCaptures.$inferSelect;
export type NewEmailCapture = typeof emailCaptures.$inferInsert;
export type EmailSequenceStep = typeof emailSequenceSteps.$inferSelect;
export type NewEmailSequenceStep = typeof emailSequenceSteps.$inferInsert;
export type EmailSendLogEntry = typeof emailSendLog.$inferSelect;
export type NewEmailSendLogEntry = typeof emailSendLog.$inferInsert;
