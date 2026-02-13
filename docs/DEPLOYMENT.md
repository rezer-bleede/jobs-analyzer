# Deployment Guide

This guide covers deploying the Jobs Analyzer application to various platforms.

## Table of Contents

1. [GitHub Pages (Recommended)](#github-pages)
2. [Cloudflare Pages](#cloudflare-pages)
3. [Netlify](#netlify)
4. [Vercel](#vercel)
5. [Local Development](#local-development)

## GitHub Pages (Recommended)

GitHub Pages is the recommended deployment method as it integrates seamlessly with the repository.

### Automatic Deployment

1. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Source: GitHub Actions
   - Save

2. **Configure Environment Variables (Optional):**
   - Go to Settings → Secrets and variables → Actions
   - Add `VITE_JOBS_DATA_URL` if using a custom data source

3. **Trigger Deployment:**
   - Push to `main` branch
   - Or manually trigger from Actions tab
   - Or wait for daily scheduled run

4. **Access Your Site:**
   - URL: `https://<username>.github.io/jobs-analyzer/`
   - Updates automatically on each push

### Manual Deployment

```bash
# Build locally
cd web
npm run build

# Deploy to gh-pages branch
npx gh-pages -d dist
```

## Cloudflare Pages

### Setup

1. **Connect Repository:**
   - Go to Cloudflare Dashboard → Pages
   - Create a project → Connect to Git
   - Select your repository

2. **Build Settings:**
   ```
   Build command: npm run build
   Build output directory: dist
   Root directory: web
   ```

3. **Environment Variables:**
   ```
   VITE_JOBS_DATA_URL=https://your-r2-bucket.com/jobs.json
   ```

4. **Deploy:**
   - Trigger deployment
   - Access at `https://<project>.pages.dev/`

### CORS Configuration

If using Cloudflare R2 for data:

```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3000
  }
]
```

## Netlify

### Via Web UI

1. **Connect Repository:**
   - Go to Netlify Dashboard → New site from Git
   - Select GitHub repository

2. **Build Settings:**
   ```
   Base directory: web
   Build command: npm run build
   Publish directory: dist
   ```

3. **Environment Variables:**
   - Site settings → Environment variables
   - Add `VITE_JOBS_DATA_URL`

4. **Deploy:**
   - Automatic on every push
   - Manual deploy via "Trigger deploy"

### Via CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
cd web
netlify deploy --prod --dir=dist
```

## Vercel

### Setup

1. **Import Repository:**
   - Go to Vercel Dashboard → New Project
   - Import Git repository

2. **Configure Project:**
   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   Root Directory: web
   ```

3. **Environment Variables:**
   - Project Settings → Environment Variables
   - Add `VITE_JOBS_DATA_URL`

4. **Deploy:**
   - Automatic on every push
   - Access at `https://<project>.vercel.app/`

## Local Development

### Prerequisites

- Node.js 20+
- npm or yarn

### Setup

```bash
# Clone repository
git clone https://github.com/yourusername/jobs-analyzer.git
cd jobs-analyzer/web

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

Create `.env.local`:

```env
VITE_JOBS_DATA_URL=https://your-data-source.com/jobs.json
```

### Build for Production

```bash
npm run build
```

Output is in `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Data Source Options

### Option 1: GitHub Pages (Static JSON)

Store `jobs.json` in `web/public/jobs.json`:

- ✅ Zero configuration
- ✅ No CORS issues
- ✅ Version controlled
- ❌ Requires rebuild to update

### Option 2: Cloudflare R2

Upload JSON to R2 bucket:

1. Create R2 bucket
2. Upload `jobs.json`
3. Configure CORS
4. Set `VITE_JOBS_DATA_URL` to public bucket URL

- ✅ Dynamic updates
- ✅ No rebuild needed
- ✅ Global CDN
- ⚠️ Requires CORS configuration

### Option 3: Custom API

Host your own API endpoint:

- ✅ Full control
- ✅ Real-time updates
- ⚠️ Requires backend maintenance

## Environment-Specific Configuration

### Development

```env
# .env.development
VITE_JOBS_DATA_URL=/jobs.json
```

### Production

```env
# .env.production
VITE_JOBS_DATA_URL=https://your-production-api.com/jobs.json
```

## Troubleshooting

### Build Failures

1. **Check Node.js version:**
   ```bash
   node --version  # Should be 20+
   ```

2. **Clear cache:**
   ```bash
   rm -rf node_modules dist
   npm install
   npm run build
   ```

3. **Check for TypeScript errors:**
   ```bash
   npm run lint
   npx tsc --noEmit
   ```

### CORS Errors

If seeing CORS errors in browser console:

1. Ensure data source sends CORS headers
2. Check that `Access-Control-Allow-Origin` includes your domain
3. For development, use browser extension to disable CORS (temporary)

### 404 Errors

- Check that `jobs.json` exists at the specified URL
- Verify base path configuration for subdirectory deployments
- Ensure trailing slashes match between config and files

## Performance Optimization

### Build Optimization

```javascript
// vite.config.ts
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['./src/components/charts'],
        },
      },
    },
  },
}
```

### Asset Optimization

- Use WebP images
- Enable gzip/brotli compression
- Set appropriate cache headers

## Security Best Practices

1. **Environment Variables:**
   - Never commit sensitive values
   - Use repository secrets for production

2. **Data Source:**
   - Use HTTPS only
   - Validate data structure
   - Sanitize user inputs

3. **Dependencies:**
   - Keep dependencies updated
   - Run `npm audit` regularly
   - Use lock files in production

## Monitoring

### GitHub Actions

- Check Actions tab for deployment status
- Review logs on failure
- Set up notifications for failures

### Application Monitoring

- Use browser console for client errors
- Monitor network requests in DevTools
- Check data freshness indicators on site

## Rollback

### GitHub Pages

```bash
# Rollback to previous commit
git revert HEAD
git push origin main
```

### Cloudflare Pages

- Go to Deployment list
- Select previous deployment
- Click "Rollback"

## Support

For deployment issues:

1. Check [Troubleshooting](#troubleshooting) section
2. Review GitHub Actions logs
3. Open an issue with deployment logs
