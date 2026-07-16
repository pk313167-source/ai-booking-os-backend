# Vercel One-Click Deployment Guide

## Prerequisites
- Vercel account (free tier available at https://vercel.com)
- GitHub repository access

## Deployment Steps

### Step 1: Go to Vercel Dashboard
1. Visit https://vercel.com/new
2. Click "Import Git Repository"

### Step 2: Connect GitHub Repository
1. Select "GitHub" as the Git provider
2. Search for: `pk313167-source/ai-booking-os-backend`
3. Click "Import"

### Step 3: Configure Project
1. **Project Name**: `ai-booking-os-frontend` (or your preferred name)
2. **Root Directory**: Select `frontend` from the dropdown
3. **Build Command**: `pnpm run build` (should be auto-detected)
4. **Output Directory**: `dist/public` (should be auto-detected)
5. **Environment Variables**: Leave empty (already configured in vercel.json)

### Step 4: Deploy
1. Click the "Deploy" button
2. Wait for build to complete (typically 2-3 minutes)
3. Once complete, you'll receive your public URL

## Configuration Details

### vercel.json
```json
{
  "buildCommand": "pnpm run build",
  "outputDirectory": "dist/public",
  "env": {
    "VITE_FRONTEND_FORGE_API_URL": "https://ai-booking-os-backend.onrender.com"
  }
}
```

### Build Process
- **Framework**: React 19 with Vite
- **Package Manager**: pnpm
- **Build Output**: Static HTML/CSS/JS in `dist/public`
- **Build Time**: ~3-4 minutes

## Post-Deployment

### Verify Deployment
1. Visit your Vercel URL
2. You should see the login page
3. Test signup/login functionality

### Test API Integration
1. Sign up with a test account
2. Add a contact
3. Schedule an appointment
4. Send a message via AI Chat

### Troubleshooting

If build fails:
1. Check Vercel build logs
2. Verify pnpm is available
3. Check all dependencies in package.json

If frontend shows errors:
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for API calls
4. Verify backend is running: https://ai-booking-os-backend.onrender.com/health

## Support

For issues during deployment:
1. Check Vercel documentation: https://vercel.com/docs
2. Review build logs in Vercel dashboard
3. Verify all files are in the repository
4. Check GitHub repository status

## Repository Details

- **Repository**: https://github.com/pk313167-source/ai-booking-os-backend
- **Frontend Location**: `/frontend` directory
- **Build Configuration**: `frontend/vercel.json`
- **Latest Commit**: Check GitHub for current commit hash

---

**Status**: ✅ Repository is ready for one-click Vercel deployment
