# 🚀 Shadow Flight Deployment Guide

This guide will help you deploy your Shadow Flight Crash Game to various hosting platforms.

## 📋 Prerequisites

Before deploying, ensure you have:
- Node.js 18+ installed locally (for testing)
- Git repository with your code
- **Optional**: A Google Gemini API key for AI-generated flight logs (get one at [Google AI Studio](https://makersuite.google.com/app/apikey))

## 🔧 Environment Variables (Optional)

The game works perfectly without any environment variables using pre-written flight messages. For AI-generated flight logs, you can optionally set:
- `VITE_API_KEY`: Your Google Gemini API key

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

#### Quick Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/shadow-flight-crash-game)

#### Manual Deployment

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy from GitHub**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - **Optional**: Configure environment variables:
     - Add `VITE_API_KEY` with your Gemini API key value (for AI-generated flight logs)

3. **Deploy from CLI** (if you have Vercel CLI):
   ```bash
   vercel --prod
   ```

#### Vercel Configuration
The project includes a `vercel.json` file with optimized settings:
- SPA routing support
- Asset caching
- No environment variables required (API key is optional)

### Option 2: Netlify

1. **Deploy from GitHub**:
   - Go to [Netlify Dashboard](https://app.netlify.com/)
   - Click "New site from Git"
   - Choose your repository
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`

2. **Environment Variables**:
   - Go to Site Settings > Environment Variables
   - Add `VITE_API_KEY` with your Gemini API key

3. **Redirects** (create `public/_redirects` file):
   ```
   /*    /index.html   200
   ```

### Option 3: GitHub Pages

1. **Enable GitHub Actions**:
   Create `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages
   
   on:
     push:
       branches: [ main ]
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '18'
         - run: npm ci
         - run: npm run build
           env:
             VITE_API_KEY: ${{ secrets.VITE_API_KEY }}
         - uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

2. **Add API Key Secret**:
   - Go to Repository Settings > Secrets and Variables > Actions
   - Add `VITE_API_KEY` secret with your Gemini API key

### Option 4: Firebase Hosting

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Initialize Firebase**:
   ```bash
   firebase init hosting
   ```

3. **Configure `firebase.json`**:
   ```json
   {
     "hosting": {
       "public": "dist",
       "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ]
     }
   }
   ```

4. **Deploy**:
   ```bash
   npm run build
   firebase deploy
   ```

## 🔍 Troubleshooting

### Common Issues

1. **White Screen / App Not Loading**:
   - Check browser console for errors
   - Verify API key is set correctly
   - Ensure all dependencies are installed

2. **API Key Issues**:
   - Verify the environment variable name matches (`VITE_API_KEY`)
   - Check that the API key is valid and has proper permissions
   - Ensure the key is properly set in your hosting platform

3. **Build Failures**:
   - Check Node.js version (requires 18+)
   - Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
   - Check for TypeScript errors: `npx tsc --noEmit`

4. **Routing Issues**:
   - Ensure SPA redirects are configured (all routes point to `/index.html`)
   - Check that the hosting platform supports client-side routing

### Testing Locally

Before deploying, test your build locally:

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Preview the build
npm run preview
```

Visit `http://localhost:3000` to test the production build.

### Performance Optimization

The build is already optimized with:
- Code splitting (vendor, genai, and app chunks)
- Asset compression
- Tree shaking
- Minification

### Security Notes

- Never commit your `.env` file
- Use environment variables for API keys
- The API key is exposed in the client bundle (this is normal for client-side applications)
- Consider implementing rate limiting on your API usage

## 📊 Build Output

A successful build will generate:
- `dist/index.html` - Main HTML file
- `dist/assets/` - JavaScript and CSS assets
- Chunked bundles for optimal loading

## 🎯 Next Steps After Deployment

1. Test all game functionality
2. Monitor API usage and costs
3. Set up error monitoring (e.g., Sentry)
4. Configure analytics (e.g., Google Analytics)
5. Set up a custom domain (optional)

## 🆘 Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Verify your API key is working
3. Test the build locally first
4. Check the hosting platform's documentation

---

**Happy deploying! 🚀**