# Manual Supabase Setup Guide

There's a network connectivity issue between Replit and your Supabase database. Let's set it up manually in your Supabase dashboard.

## Step 1: Run SQL in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the entire contents of `supabase-setup.sql` 
5. Click "Run" to execute the SQL

This will create:
- ✅ All database tables (users, mains, classes, lessons, user_progress)
- ✅ Proper relationships between tables
- ✅ Performance indexes
- ✅ Sample data for testing

## Step 2: Verify Tables Created

In your Supabase dashboard:
1. Go to "Table Editor"
2. You should see these tables:
   - `users` - User accounts and admin status
   - `mains` - Bible study topics 
   - `classes` - Books or themes under each main
   - `lessons` - Individual studies
   - `user_progress` - Student learning tracking

## Step 3: Test Your Database

1. In "Table Editor", click on the `users` table
2. You should see a sample admin user: `admin@biblestudyhub.com`
3. Check the `mains` table for "People of God in the Bible"
4. Check `classes` for "Righteous People" and "Wicked People"
5. Check `lessons` for "Abraham" and "Moses" lessons

## Step 4: Fix Connection String

Your current DATABASE_URL has formatting issues. Let's get the correct one:

1. In Supabase dashboard, go to "Settings" → "Database"
2. Under "Connection string", look for **"Connection pooling"**
3. Copy the **URI** (not the psql command)
4. It should look like: `postgresql://postgres.xxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres`

## Step 5: Update Replit Secrets

1. In your Replit project, click the lock icon (Secrets)
2. Edit the DATABASE_URL secret
3. Replace it with the clean URI from Step 4
4. Make sure to replace `[YOUR-PASSWORD]` with your actual password

## Step 6: Enable PostgreSQL Storage

Once the connection string is fixed, I'll switch your app from memory storage to PostgreSQL storage so all your data persists in Supabase.

## What This Gives You

✅ **Persistent Data**: All content saved in Supabase  
✅ **Real-time Features**: Updates appear instantly  
✅ **Professional Dashboard**: Manage data through Supabase interface  
✅ **Scalable**: Handles many students and lessons  
✅ **Backup & Recovery**: Supabase handles data safety  

Ready to proceed? Just confirm you've run the SQL and I'll help you test the connection!