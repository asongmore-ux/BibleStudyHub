import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, mains, classes, lessons, userProgress } from '../shared/schema.js';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create postgres client
const client = postgres(process.env.DATABASE_URL);

// Create drizzle instance
export const db = drizzle(client, {
  schema: {
    users,
    mains,
    classes,
    lessons,
    userProgress,
  },
});

export type Database = typeof db;