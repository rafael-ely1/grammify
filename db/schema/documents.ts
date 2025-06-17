import { pgTable, uuid, timestamp, text, jsonb } from 'drizzle-orm/pg-core'

export const documents = pgTable('documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  userId: uuid('user_id').notNull(),
  title: text('title'),
  content: text('content').default('').notNull(),
  suggestions: jsonb('suggestions').array(),
  stats: jsonb('stats')
}) 