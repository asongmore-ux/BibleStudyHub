# Deploying to Vercel

## Prerequisites
1. A Vercel account (free at https://vercel.com)
2. Your project pushed to GitHub, GitLab, or Bitbucket
3. A PostgreSQL database (you can use Neon, Supabase, or Vercel Postgres)

## Deployment Steps

### 1. Prepare Your Database
- Sign up for a free PostgreSQL database (recommended: Neon.tech)
- Get your connection string (DATABASE_URL)
- Run migrations: `npm run db:push`

### 2. Deploy to Vercel
1. Go to https://vercel.com and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect the framework settings
5. Add environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `SESSION_SECRET`: A random secret string
   - `NODE_ENV`: "production"

### 3. Configure Build Settings
Vercel should automatically detect:
- Build Command: `npm run vercel-build`
- Output Directory: `dist/public`
- Install Command: `npm install`

### 4. Deploy
Click "Deploy" and wait for the build to complete.

## Important Notes
- The app uses serverless functions for the API
- Static files are served from the `dist/public` directory
- Database connections are handled automatically
- Environment variables must be set in Vercel dashboard

## Troubleshooting
- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Verify database connectivity
- Check function logs for API errors