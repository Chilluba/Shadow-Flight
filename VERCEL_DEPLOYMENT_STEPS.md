# 🚨 URGENT: Vercel Deployment Fix Steps

## The Problem
You're still getting `Environment Variable "API_KEY" references Secret "api_key", which does not exist` because the error is coming from your **Vercel Dashboard settings**, not the code.

## ✅ SOLUTION: Clear Vercel Dashboard Configuration

### Step 1: Access Your Vercel Project
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Find your Shadow Flight project
3. Click on the project name

### Step 2: Clear Environment Variables
1. Go to **Settings** tab
2. Click **Environment Variables** in the sidebar
3. **DELETE ALL** existing environment variables that reference:
   - `API_KEY`
   - `GEMINI_API_KEY` 
   - Any variables with `@api_key` secrets

### Step 3: Clear Build Settings (If Any)
1. Still in Settings, go to **General**
2. Check **Build & Development Settings**
3. Make sure there are no custom environment variables set here
4. If there are any API_KEY references, remove them

### Step 4: Redeploy
1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. OR push a new commit to trigger a fresh deployment

## Alternative: Create New Vercel Project

If the above doesn't work, create a fresh project:

1. **Delete Current Project**:
   - Go to Settings > General
   - Scroll to bottom and click "Delete Project"

2. **Create New Project**:
   - Import your GitHub repo again
   - **DON'T ADD ANY ENVIRONMENT VARIABLES**
   - Deploy directly

## 🎯 Expected Result

After following these steps:
- ✅ Deployment should succeed without any environment variables
- ✅ Game will use fallback flight messages (works perfectly)
- ✅ No configuration needed

## Optional: Add AI Features Later

If you want AI-generated flight logs later:
1. Get Google Gemini API key
2. Add ONE environment variable in Vercel:
   - Name: `VITE_API_KEY`
   - Value: Your API key (no secrets, just the raw key)

## Why This Happened

The old configuration had:
```json
"env": {
  "API_KEY": "@api_key"
}
```

This created a secret reference that persists in Vercel's dashboard even after we removed it from the code. You need to manually clear it from the dashboard.

## 🆘 Still Having Issues?

If you're still getting the error:
1. Screenshot your Vercel environment variables page
2. Make sure you're looking at the correct project
3. Try the "Create New Project" approach above