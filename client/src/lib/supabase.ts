// Note: This file provides Supabase configuration for future use
// Currently the app uses in-memory storage via the MemStorage class

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

// Environment variables for Supabase configuration
export const supabaseConfig: SupabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL || '',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
};

// Utility function to check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseConfig.url && supabaseConfig.anonKey);
};

// Database URL from environment for server-side usage
export const getDatabaseUrl = (): string => {
  return process.env.DATABASE_URL || '';
};

// Table names for consistency
export const TABLES = {
  users: 'users',
  mains: 'mains',
  classes: 'classes',
  lessons: 'lessons',
  userProgress: 'user_progress',
} as const;

// Row Level Security (RLS) policies would be defined in Supabase dashboard:
/*
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE mains ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid()::text = id);

-- Users can update their own data  
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = id);

-- Everyone can read published content
CREATE POLICY "Anyone can read published mains" ON mains
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read published classes" ON classes
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read published lessons" ON lessons
  FOR SELECT USING (is_published = true);

-- Only admins can modify content
CREATE POLICY "Admins can manage mains" ON mains
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can manage classes" ON classes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can manage lessons" ON lessons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.is_admin = true
    )
  );

-- Users can manage their own progress
CREATE POLICY "Users can manage own progress" ON user_progress
  FOR ALL USING (auth.uid()::text = user_id);
*/

export default {
  supabaseConfig,
  isSupabaseConfigured,
  getDatabaseUrl,
  TABLES,
};
