# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Chiri**, a minimal Astro-based blog theme configured for fully static deployment on Cloudflare Pages. The site is built entirely at compile-time with no server-side rendering or edge functions.

## Essential Commands

### Development
```bash
pnpm dev              # Start dev server
pnpm build            # Build static site to dist/
pnpm preview          # Preview production build locally
```

### Content Management
```bash
pnpm new <title>      # Create new post in src/content/posts/
pnpm new _<title>     # Create draft post (prefixed with underscore)
```

### Code Quality
```bash
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues
pnpm format           # Format code with Prettier
pnpm format:check     # Check formatting without changes
```

### Theme Maintenance
```bash
pnpm update-theme     # Update theme to latest version
```

## Architecture

### Static-First Approach
This site is **fully static** with NO adapter. All dynamic features are resolved at build time:
- **Link cards**: Metadata is fetched during build via `src/plugins/remark-embedded-media.mjs`
- **RSS/Atom feeds**: Generated as static XML files
- **OpenGraph images**: Pre-rendered using `astro-og-canvas`

### Content Pipeline

**Markdown Processing Chain** (configured in `astro.config.ts`):
1. **Remark plugins** (pre-HTML transformation):
   - `remark-math` → LaTeX support
   - `remark-directive` → Custom directive syntax (`::link`, `::youtube`, etc.)
   - `remark-embedded-media` → **Converts directives to HTML, fetches link metadata at build time**
   - `remark-reading-time` → Injects reading time into frontmatter
   - `remark-toc` → Generates table of contents

2. **Rehype plugins** (post-HTML transformation):
   - `rehype-katex` → Renders LaTeX equations
   - `rehype-cleanup` → Cleans up HTML structure
   - `rehype-image-processor` → Optimizes images
   - `rehype-copy-code` → Adds copy buttons to code blocks

### Content Collections

Defined in `src/content.config.ts`:
- **posts**: Blog posts (`.md` and `.mdx` in `src/content/posts/`)
  - Required frontmatter: `title`, `pubDate`
  - Optional: `image`
- **about**: About page content (`src/content/about/about.md`)

### Configuration

**`src/config.ts`** - Central theme configuration:
- Site metadata (title, author, description, URL)
- Layout settings (centered/left-aligned, content width)
- Feature toggles (theme toggle, reading time, TOC, link cards, etc.)
- Date formatting preferences

**`astro.config.ts`** - Build configuration:
- Image service: Sharp (configured in `src/utils/image-config.ts`)
- Markdown plugins (see pipeline above)
- Integrations: MDX, sitemap, inline CSS
- Path alias: `@` → `./src`

### Key Plugin: Link Card Metadata Fetching

`src/plugins/remark-embedded-media.mjs` handles the `::link{url="..."}` directive:
- **Build-time execution**: Fetches external URL metadata during build
- **HTML parsing**: Extracts OpenGraph/Twitter card metadata via regex
- **Static embedding**: Injects title, description, and image directly into HTML
- **No client-side fetching**: Everything is pre-rendered

This means link card metadata is "frozen" at build time and updates only on rebuild.

### Page Structure

- **`src/pages/index.astro`** - Homepage (post list)
- **`src/pages/[...slug].astro`** - Dynamic post pages
- **`src/pages/404.astro`** - 404 error page
- **`src/pages/atom.xml.ts`** - Atom feed endpoint
- **`src/pages/rss.xml.ts`** - RSS feed endpoint
- **`src/pages/open-graph/[...route].ts`** - Dynamic OG image generation

### Layouts

- **`BaseLayout.astro`** - Root layout with HTML structure, metadata, theme script
- **`IndexLayout.astro`** - Homepage layout
- **`PostLayout.astro`** - Blog post layout with TOC, reading time, etc.

### Embedded Media Directives

Syntax in markdown files:
```markdown
::link{url="https://example.com"}           # Link card with metadata
::youtube{url="https://youtube.com/..."}    # Embedded video
::spotify{url="https://open.spotify.com/..."} # Spotify embed
::bilibili{url="https://bilibili.com/..."}  # BiliBili embed
::github{repo="user/repo"}                  # GitHub repo card
::x{url="https://x.com/user/status/..."}    # X/Twitter post
::neodb{url="https://neodb.social/..."}     # NeoDB card (CN)
```

All processed by `src/plugins/remark-embedded-media.mjs`.

## Deployment

**Target Platform**: Cloudflare Pages (fully static)

**Build Settings**:
- Build command: `pnpm build`
- Output directory: `dist`

**Configuration Files** (in `public/`, copied to `dist/`):
- `_headers` - Security headers and cache rules
- `_redirects` - URL redirect rules

See `CLOUDFLARE_DEPLOYMENT.md` for complete deployment guide.

## Important Notes

1. **No SSR/Edge Functions**: This site builds entirely to static HTML. Do not add server endpoints or dynamic routes that require runtime execution.

2. **Link Card Limitations**: External site metadata is fetched at build time. If a linked site updates its metadata, you must rebuild to reflect changes.

3. **Draft Posts**: Posts with filenames starting with underscore (`_`) are treated as drafts. Use `pnpm new _title` to create them.

4. **KaTeX CSS**: The `@playform/inline` integration excludes KaTeX CSS from inlining to prevent rendering issues.

5. **Image Optimization**: All images are processed through Sharp with config in `src/utils/image-config.ts`.

6. **Dev Toolbar**: Disabled in `astro.config.ts` (`devToolbar.enabled: false`).

## Modifying the Theme

- **Colors/Styles**: Check `src/styles/` and individual component files
- **Layout Width**: Modify `contentWidth` in `src/config.ts`
- **Add Features**: Toggle settings in `src/config.ts` first before implementing
- **New Embedded Media**: Add handler to `embedHandlers` in `src/plugins/remark-embedded-media.mjs`
