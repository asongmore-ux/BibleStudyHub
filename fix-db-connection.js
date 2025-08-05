// Quick script to test and fix database connection
import fs from 'fs';
import { Pool } from '@neondatabase/serverless';

console.log('Current DATABASE_URL:', process.env.DATABASE_URL);

// Try to decode and clean the URL
if (process.env.DATABASE_URL) {
  let cleanUrl = decodeURIComponent(process.env.DATABASE_URL);
  console.log('Decoded URL:', cleanUrl);
  
  // Remove any psql command prefix if present
  cleanUrl = cleanUrl.replace(/^psql\s+"/, '').replace(/"$/, '');
  console.log('Cleaned URL:', cleanUrl);
  
  // Test the connection
  const pool = new Pool({ connectionString: cleanUrl });
  
  pool.query('SELECT NOW()').then(() => {
    console.log('✅ Database connection successful with cleaned URL!');
    console.log('Please update your Replit secrets with this cleaned URL:');
    console.log(cleanUrl);
  }).catch(err => {
    console.log('❌ Connection still failed:', err.message);
  });
} else {
  console.log('❌ No DATABASE_URL found');
}