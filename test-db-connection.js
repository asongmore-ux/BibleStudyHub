import postgres from 'postgres';

async function testConnection() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found');
    return;
  }

  console.log('🔗 Testing database connection...');
  console.log('Database URL format:', process.env.DATABASE_URL.substring(0, 30) + '...');

  try {
    const sql = postgres(process.env.DATABASE_URL);
    
    // Test basic connection
    const result = await sql`SELECT 1 as test`;
    console.log('✅ Database connection successful!');
    console.log('Test query result:', result);
    
    // Test if tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('📊 Existing tables:', tables.map(t => t.table_name));
    
    await sql.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check if DATABASE_URL is correct');
    console.log('2. Verify Supabase project is running');
    console.log('3. Check if password contains special characters that need URL encoding');
    console.log('4. Ensure connection pooling is enabled in Supabase settings');
  }
}

testConnection();