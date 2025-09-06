import { pgTable, text, timestamp, serial, integer, jsonb, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  role: text('role').default('citizen'), // citizen, government, admin
  department: text('department'), // For government users
  position: text('position'), // For government users
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const clusters = pgTable('clusters', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  keywords: jsonb('keywords'), // Array of key terms
  feedbackCount: integer('feedback_count').default(0),
  avgSentiment: text('avg_sentiment'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const feedbacks = pgTable('feedbacks', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  content: text('content').notNull(),
  originalContent: text('original_content').notNull(), // Raw user input
  processedContent: text('processed_content'), // AI-cleaned content
  category: text('category'), // Auto-assigned category
  clusterId: integer('cluster_id').references(() => clusters.id),
  urgency: text('urgency'), // low, medium, high
  location: text('location'),
  tags: jsonb('tags'), // Array of extracted tags
  sentiment: text('sentiment'), // positive, negative, neutral
  // Blockchain verification fields
  blockchainHash: text('blockchain_hash'), // Transaction hash on blockchain
  blockchainVerified: boolean('blockchain_verified').default(false),
  verificationData: jsonb('verification_data'), // Contains block number, timestamp, etc.
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const blockchainVerifications = pgTable('blockchain_verifications', {
  id: serial('id').primaryKey(),
  feedbackId: integer('feedback_id').notNull().references(() => feedbacks.id),
  transactionHash: text('transaction_hash').notNull(),
  blockNumber: integer('block_number'),
  blockTimestamp: timestamp('block_timestamp'),
  gasUsed: text('gas_used'),
  networkName: text('network_name').default('ethereum'),
  verificationStatus: text('verification_status').default('pending'), // pending, confirmed, failed
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const governmentReports = pgTable('government_reports', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  location: text('location').notNull(),
  reportContent: text('report_content').notNull(), // AI-generated formal report
  executiveSummary: text('executive_summary').notNull(),
  keyFindings: jsonb('key_findings'), // Array of key findings
  recommendations: jsonb('recommendations'), // Array of recommendations
  feedbackIds: jsonb('feedback_ids'), // Array of feedback IDs included in this report
  totalFeedbacks: integer('total_feedbacks').notNull(),
  sentimentBreakdown: jsonb('sentiment_breakdown'), // {positive: X, negative: Y, neutral: Z}
  urgencyBreakdown: jsonb('urgency_breakdown'), // {low: X, medium: Y, high: Z}
  generatedBy: integer('generated_by').references(() => users.id), // Who generated the report
  status: text('status').default('draft'), // draft, published, archived
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
