# Complete Vercel Deployment Guide for Bible Study Hub

## Step 1: Prepare Your Database (Neon)

### Create Neon Database
1. Go to https://neon.tech and sign up (free account)
2. Click "Create Project"
3. Choose a name like "bible-study-hub"
4. Select a region close to you
5. Copy the connection string (starts with `postgresql://`)

### Set Up Database Schema
1. In your Replit project, create a `.env` file:
```
DATABASE_URL="your-neon-connection-string-here"
SESSION_SECRET="your-random-secret-key-here"
```

2. Run database migration:
```bash
npm run db:push
```

## Step 2: Create Your First Admin User

### Option A: Direct Database Insert (Recommended)
1. Go to your Neon dashboard
2. Click "SQL Editor"
3. Run this SQL to create your first admin:
```sql
INSERT INTO users (email, full_name, is_admin) 
VALUES ('your-email@example.com', 'Your Full Name', true);
```

### Option B: Register Normal User, Then Update to Admin
1. Deploy your app first
2. Register a normal account
3. Go back to Neon SQL Editor
4. Update your user to admin:
```sql
UPDATE users SET is_admin = true WHERE email = 'your-email@example.com';
```

## Step 3: Push Code to GitHub

1. Create a new repository on GitHub
2. In your Replit project, run:
```bash
git init
git add .
git commit -m "Initial commit - Bible Study Hub"
git branch -M main
git remote add origin https://github.com/yourusername/bible-study-hub.git
git push -u origin main
```

## Step 4: Deploy to Vercel

### Connect GitHub to Vercel
1. Go to https://vercel.com and sign in
2. Click "New Project"
3. Select "Import Git Repository"
4. Choose your GitHub repository
5. Click "Import"

### Configure Build Settings
Vercel should auto-detect, but verify:
- **Build Command**: `vite build`
- **Output Directory**: `dist/public`
- **Install Command**: `npm install`

### Add Environment Variables
In Vercel dashboard, go to "Settings" → "Environment Variables" and add:

| Name | Value |
|------|-------|
| `DATABASE_URL` | Your Neon connection string |
| `SESSION_SECRET` | Random secret (generate at https://generate-secret.vercel.app/) |
| `NODE_ENV` | `production` |

### Deploy
1. Click "Deploy"
2. Wait for build to complete (2-3 minutes)
3. Visit your live URL (something like `bible-study-hub.vercel.app`)

## Step 5: Test Your Deployment

1. Visit your deployed site
2. Try registering a user
3. If you made yourself admin in Step 2, log in and test admin features
4. Create some content to verify everything works

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Verify your GitHub repository has all files

### Database Connection Issues
- Double-check your DATABASE_URL
- Ensure Neon database is active
- Check Neon dashboard for connection limits

### Admin Access Issues
- Verify your user has `is_admin = true` in database
- Clear browser cache and cookies
- Check if you're logged in with the correct email

## Important Security Notes

- Never commit `.env` files to GitHub
- Use strong, random session secrets
- Your Neon database is secure by default
- Vercel handles HTTPS automatically

## After Deployment

Your app will be available at: `https://your-project-name.vercel.app`

You can:
- Share this URL with your school master
- Log in as admin to manage content
- Students can register and access lessons
- All data is stored securely in Neon database