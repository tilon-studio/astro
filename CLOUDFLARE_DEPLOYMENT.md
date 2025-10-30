# Cloudflare Pages Deployment Guide

This site is now configured for static deployment on Cloudflare Pages.

## Deployment Settings

When setting up your Cloudflare Pages project, use these settings:

### Build Configuration
- **Build command**: `pnpm build`
- **Build output directory**: `dist`
- **Root directory**: `/` (or leave as default)

### Environment Variables
None required - this is a fully static site.

## What Changed from Netlify

1. **Removed server-side rendering**: The site now builds as a fully static site
2. **LinkCard metadata fetching**: Now happens at build time instead of runtime
   - Metadata is embedded directly in the HTML
   - No proxy endpoint needed
   - Faster page loads for users
3. **No adapter required**: Astro's default static output is used
4. **Headers and redirects**: Configured via `_headers` and `_redirects` files in the `public/` folder

## Deploying to Cloudflare Pages

### Option 1: Connect Git Repository (Recommended)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** → **Create application** → **Pages**
3. Connect your Git repository (GitHub, GitLab, etc.)
4. Configure the build settings as shown above
5. Click **Save and Deploy**

Cloudflare will automatically rebuild and deploy on every push to your main branch.

### Option 2: Direct Upload via Wrangler CLI

1. Install Wrangler CLI:
   ```bash
   pnpm add -g wrangler
   ```

2. Login to Cloudflare:
   ```bash
   wrangler login
   ```

3. Build the site:
   ```bash
   pnpm build
   ```

4. Deploy:
   ```bash
   wrangler pages deploy dist
   ```

### Option 3: Manual Upload via Dashboard

1. Build the site locally:
   ```bash
   pnpm build
   ```

2. Go to Cloudflare Dashboard → **Workers & Pages** → **Create application** → **Pages** → **Upload assets**

3. Drag and drop the `dist` folder or use the file picker

## Headers and Cache Configuration

The site includes optimized caching rules configured in `public/_headers`:

- **HTML pages**: 24 hours cache (CDN: 48 hours)
- **Homepage**: 30 minutes cache (CDN: 1 hour)
- **Static assets**: 1 year immutable cache
- **Security headers**: CSP, X-Frame-Options, etc.

## Link Cards

Link cards now fetch metadata at build time. This means:

- ✅ Faster page loads (no client-side fetching)
- ✅ Better SEO (metadata is in HTML)
- ✅ No CORS issues
- ✅ No serverless functions needed
- ⚠️ Metadata updates only when you rebuild the site

If an external site's metadata changes, you'll need to trigger a new build to update it.

## Troubleshooting

### Build fails with fetch errors
If link card metadata fetching fails during build, the build will continue with warnings. Check the build logs to see which URLs failed to fetch.

### Headers not working
Make sure the `_headers` file is in the `public/` folder so it gets copied to `dist/` during build.

### Old content showing
Clear Cloudflare's cache:
1. Go to your Cloudflare dashboard
2. Navigate to **Caching** → **Configuration**
3. Click **Purge Everything**
