-- Bible Study Hub Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create mains table (Bible study topics)
CREATE TABLE IF NOT EXISTS mains (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'fas fa-book',
  "order" INTEGER NOT NULL DEFAULT 0,
  created_by VARCHAR NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create classes table (Bible books or themes)
CREATE TABLE IF NOT EXISTS classes (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  main_id VARCHAR NOT NULL REFERENCES mains(id) ON DELETE CASCADE,
  parent_class_id VARCHAR REFERENCES classes(id) ON DELETE CASCADE,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_by VARCHAR NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create lessons table (Individual studies)
CREATE TABLE IF NOT EXISTS lessons (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  bible_reference TEXT,
  image_url TEXT,
  audio_url TEXT,
  duration INTEGER, -- in minutes
  class_id VARCHAR NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  "order" INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN DEFAULT false NOT NULL,
  created_by VARCHAR NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create user progress table (track student learning)
CREATE TABLE IF NOT EXISTS user_progress (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id VARCHAR NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false NOT NULL,
  bookmarked BOOLEAN DEFAULT false NOT NULL,
  study_time INTEGER DEFAULT 0, -- in minutes
  notes TEXT,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mains_order ON mains("order");
CREATE INDEX IF NOT EXISTS idx_classes_main_id ON classes(main_id);
CREATE INDEX IF NOT EXISTS idx_classes_order ON classes("order");
CREATE INDEX IF NOT EXISTS idx_lessons_class_id ON lessons(class_id);
CREATE INDEX IF NOT EXISTS idx_lessons_published ON lessons(is_published);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons("order");
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson_id ON user_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_completed ON user_progress(completed);
CREATE INDEX IF NOT EXISTS idx_user_progress_bookmarked ON user_progress(bookmarked);

-- Insert sample data for testing
-- First create an admin user
INSERT INTO users (email, full_name, is_admin) 
VALUES ('admin@biblestudyhub.com', 'Bible Study Admin', true)
ON CONFLICT (email) DO NOTHING;

-- Create sample main topic
INSERT INTO mains (title, description, icon, "order", created_by)
SELECT 'People of God in the Bible', 
       'Explore the lives and characteristics of various people mentioned in Biblical history.',
       'fas fa-users',
       1,
       u.id
FROM users u WHERE u.email = 'admin@biblestudyhub.com'
ON CONFLICT DO NOTHING;

-- Create sample classes
INSERT INTO classes (title, description, main_id, "order", created_by)
SELECT 'Righteous People',
       'Learn from the faith and obedience of righteous individuals throughout Biblical history.',
       m.id,
       1,
       u.id
FROM users u, mains m 
WHERE u.email = 'admin@biblestudyhub.com' 
AND m.title = 'People of God in the Bible'
ON CONFLICT DO NOTHING;

INSERT INTO classes (title, description, main_id, "order", created_by)
SELECT 'Wicked People',
       'Understand the consequences of turning away from God through Biblical examples.',
       m.id,
       2,
       u.id
FROM users u, mains m 
WHERE u.email = 'admin@biblestudyhub.com' 
AND m.title = 'People of God in the Bible'
ON CONFLICT DO NOTHING;

-- Create sample lessons
INSERT INTO lessons (title, content, excerpt, bible_reference, duration, class_id, "order", is_published, created_by)
SELECT 'Abraham: The Father of Faith',
       '<h2>Abraham''s Journey of Faith</h2><p>Abraham''s story begins in Genesis 12, where God calls him to leave his homeland and journey to a land that God would show him. This act of obedience demonstrates the essence of faith - trusting God even when we cannot see the full picture.</p><h3>Key Lessons from Abraham''s Life:</h3><ul><li><strong>Obedience to God''s Call:</strong> When God called Abraham to leave Ur of the Chaldeans, he obeyed without hesitation (Genesis 12:1-4).</li><li><strong>Faith in God''s Promises:</strong> Despite being childless at an advanced age, Abraham believed God''s promise to make him the father of many nations (Romans 4:16-21).</li><li><strong>Willingness to Sacrifice:</strong> Abraham''s willingness to sacrifice Isaac shows his complete trust in God''s character and promises (Genesis 22:1-19).</li></ul><p>Abraham''s life teaches us that faith is not merely intellectual belief, but active trust that results in obedience to God''s will.</p>',
       'Discover how Abraham''s unwavering faith and obedience to God''s call made him the father of many nations.',
       'Genesis 12-22',
       15,
       c.id,
       1,
       true,
       u.id
FROM users u, classes c 
WHERE u.email = 'admin@biblestudyhub.com' 
AND c.title = 'Righteous People'
ON CONFLICT DO NOTHING;

INSERT INTO lessons (title, content, excerpt, bible_reference, duration, class_id, "order", is_published, created_by)
SELECT 'Moses: The Great Lawgiver',
       '<h2>Moses: Leader, Prophet, and Lawgiver</h2><p>Moses stands as one of the most significant figures in Biblical history. Chosen by God to lead the Israelites out of Egyptian bondage, Moses'' life demonstrates God''s power working through willing servants.</p><h3>Moses'' Journey:</h3><ul><li><strong>The Burning Bush:</strong> God''s call to Moses at the burning bush (Exodus 3:1-17)</li><li><strong>The Ten Plagues:</strong> God''s power demonstrated through Moses (Exodus 7-12)</li><li><strong>The Exodus:</strong> Leading God''s people out of slavery (Exodus 12-15)</li><li><strong>Receiving the Law:</strong> The Ten Commandments and the Mosaic Law (Exodus 19-24)</li></ul><p>Moses'' story teaches us about God''s faithfulness, the importance of obedience, and how God can use anyone for His purposes regardless of their perceived limitations.</p>',
       'Learn about Moses'' role as leader, prophet, and lawgiver who brought God''s people out of Egypt.',
       'Exodus 1-40',
       22,
       c.id,
       2,
       true,
       u.id
FROM users u, classes c 
WHERE u.email = 'admin@biblestudyhub.com' 
AND c.title = 'Righteous People'
ON CONFLICT DO NOTHING;