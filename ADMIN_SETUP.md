# Admin Setup Guide

## Two Ways to Create Your First Admin

### Method 1: Setup Admin API (Recommended for School)
This creates the first admin when the database is empty.

**Steps:**
1. Deploy your app to Vercel first
2. Visit your deployed URL
3. Instead of clicking "Register", go directly to: `https://your-app.vercel.app/admin-setup`
4. Fill in your details - this will automatically make you an admin
5. This only works once - when no users exist in the database

### Method 2: Database Direct Insert (Technical)
For advanced users who can access the database directly.

**Steps:**
1. Go to your Neon dashboard → SQL Editor
2. Run this command:
```sql
INSERT INTO users (email, full_name, is_admin) 
VALUES ('your-email@school.edu', 'Your Full Name', true);
```
3. Now you can log in with that email and any password

## After Creating Admin

Once you have admin access:
1. **Log in** with your admin account
2. **Create Main Topics** (e.g., "Old Testament", "New Testament")  
3. **Add Classes** under each main topic (e.g., "Genesis", "Matthew")
4. **Create Lessons** within each class
5. **Publish Content** for students to access

## Student Access

Regular students can:
- Register normally on your site
- Browse published content
- Track their progress
- Bookmark lessons

## Important Notes

- **First Admin**: Only the first user can be auto-created as admin
- **Password**: Currently any password works (simplified for school demo)
- **Security**: In production, you'd add proper password hashing
- **Database**: All data is stored securely in Neon PostgreSQL

## For Your School Master

Give them this URL: `https://your-app.vercel.app`

Admin login: `your-email@school.edu`
Demo features:
- Content management system
- Student progress tracking  
- Hierarchical lesson organization
- Responsive design for mobile/desktop