# Deploy Bible Study Hub to Vercel

## Quick Deployment Steps

### 1. Push to GitHub (if not already done)
```bash
git init
git add .
git commit -m "Bible Study Hub - Ready for deployment"
git branch -M main
git remote add origin [YOUR_GITHUB_REPO_URL]
git push -u origin main
```

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect the settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 3. Add Environment Variables
In your Vercel project settings, add:
- **DATABASE_URL**: `postgresql://postgres:Kolawolekolawole12.@db.uikblmizhrttdzqtshcp.supabase.co:5432/postgres`
- **NODE_ENV**: `production`

### 4. Deploy!
Click "Deploy" and your Bible Study Hub will be live in minutes!

## What Your Deployed App Will Have

✅ **Live URL**: `https://your-project.vercel.app`
✅ **Admin Setup**: Visit `/admin-setup` to create first admin
✅ **Student Registration**: Anyone can register as a student
✅ **Content Management**: Admins can create Mains, Classes, Lessons
✅ **Progress Tracking**: Students track completion and bookmarks
✅ **Responsive Design**: Works on phones, tablets, computers
✅ **Real-time Updates**: Changes appear instantly
✅ **Professional Interface**: Clean, modern design

## After Deployment

1. **Visit your live site**
2. **Go to `/admin-setup`** and create your admin account
3. **Login as admin** and add your Bible study content
4. **Share the URL** with your students
5. **Present to your master** - it's ready!

Your Bible Study Hub is now a professional learning management system that can handle unlimited students and content!