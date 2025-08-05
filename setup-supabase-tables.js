// Setup Supabase tables manually
import postgres from "postgres";

// Clean the DATABASE_URL
let cleanUrl = process.env.DATABASE_URL || '';
cleanUrl = cleanUrl.replace(/^psql\s+"/, '').replace(/"$/, '');

console.log('Connecting to:', cleanUrl.replace(/:[^:@]*@/, ':****@'));

const client = postgres(cleanUrl);

const createTables = async () => {
  try {
    console.log('Creating tables...');
    
    // Create users table
    await client`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL UNIQUE,
        full_name TEXT NOT NULL,
        is_admin BOOLEAN DEFAULT false NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    console.log('✅ Users table created');

    // Create mains table
    await client`
      CREATE TABLE IF NOT EXISTS mains (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT,
        icon TEXT DEFAULT 'fas fa-book',
        "order" INTEGER NOT NULL DEFAULT 0,
        created_by VARCHAR NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    console.log('✅ Mains table created');

    // Create classes table
    await client`
      CREATE TABLE IF NOT EXISTS classes (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT,
        main_id VARCHAR NOT NULL REFERENCES mains(id) ON DELETE CASCADE,
        parent_class_id VARCHAR REFERENCES classes(id) ON DELETE CASCADE,
        "order" INTEGER NOT NULL DEFAULT 0,
        created_by VARCHAR NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    console.log('✅ Classes table created');

    // Create lessons table
    await client`
      CREATE TABLE IF NOT EXISTS lessons (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        bible_reference TEXT,
        image_url TEXT,
        audio_url TEXT,
        duration INTEGER,
        class_id VARCHAR NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
        "order" INTEGER NOT NULL DEFAULT 0,
        is_published BOOLEAN DEFAULT false NOT NULL,
        created_by VARCHAR NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    console.log('✅ Lessons table created');

    // Create user_progress table
    await client`
      CREATE TABLE IF NOT EXISTS user_progress (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        lesson_id VARCHAR NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
        completed BOOLEAN DEFAULT false NOT NULL,
        bookmarked BOOLEAN DEFAULT false NOT NULL,
        study_time INTEGER DEFAULT 0,
        notes TEXT,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    console.log('✅ User progress table created');

    console.log('🎉 All tables created successfully!');
    
    // Test with a simple query
    const result = await client`SELECT NOW()`;
    console.log('✅ Database connection working:', result[0].now);
    
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
  } finally {
    await client.end();
  }
};

createTables();