import { pgTable, serial, text, jsonb, timestamp, integer, boolean } from 'drizzle-orm/pg-core';

export const templates = pgTable('templates', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  sections: jsonb('sections').notNull(),
  settings: jsonb('settings').notNull(),
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

export const sectionTemplates = pgTable('section_templates', {
  id: serial('id').primaryKey(),
  sectionType: text('section_type').notNull(), // 'header', 'custom_message', 'items_list', 'payment', 'date_time', 'barcode'
  name: text('name').notNull(), // User-friendly name
  defaultData: jsonb('default_data').notNull(), // The default section configuration
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Template = typeof templates.$inferSelect;
export type NewTemplate = typeof templates.$inferInsert;
export type UserTemplate = typeof userTemplates.$inferSelect;
export type NewUserTemplate = typeof userTemplates.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type SectionTemplate = typeof sectionTemplates.$inferSelect;
export type NewSectionTemplate = typeof sectionTemplates.$inferInsert;
