# Quick Start Guide

Get your CloudBlog up and running in minutes!

## 🚀 Quick Setup (5 minutes)

### 1. Install Dependencies (if not already done)

```bash
cd /Users/dgilmore/CascadeProjects/astro-cloudflare-blog
npm install
```

### 2. Login to Cloudflare

```bash
npx wrangler login
```

### 3. Create D1 Database

```bash
npx wrangler d1 create blog-db
```

Copy the `database_id` from the output and update `wrangler.toml`:

```toml
database_id = "paste-your-database-id-here"
```

### 4. Initialize Database

```bash
npx wrangler d1 execute blog-db --local --file=./schema.sql
```

### 5. Create R2 Buckets

```bash
npx wrangler r2 bucket create blog-images
npx wrangler r2 bucket create blog-images-preview
```

### 6. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:4321` to see your blog!

## 📝 Create Your First Post

With the dev server running, create a post via API:

```bash
curl -X POST http://localhost:4321/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Welcome to My Blog",
    "slug": "welcome",
    "content": "<h2>Hello World!</h2><p>This is my first blog post using Astro and Cloudflare.</p>",
    "excerpt": "My first blog post",
    "author": "Your Name",
    "status": "published",
    "published_date": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
  }'
```

Refresh your browser to see the new post!

## 🖼️ Upload an Image

```bash
curl -X POST http://localhost:4321/api/images/upload \
  -F "image=@/path/to/your/image.jpg"
```

Use the returned URL in your blog posts.

## 🌐 Connect to GitHub

See `GITHUB_SETUP.md` for detailed instructions, or use these quick commands:

```bash
# Create a new repo on GitHub first, then:
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git branch -M main
git push -u origin main
```

Or use GitHub CLI:

```bash
gh repo create astro-cloudflare-blog --public --source=. --remote=origin --push
```

## 🚢 Deploy to Production

### Build

```bash
npm run build
```

### Deploy to Cloudflare Pages

```bash
npx wrangler pages deploy dist
```

Then configure D1 and R2 bindings in the Cloudflare Dashboard.

## ⚡ Production Database Setup

Don't forget to initialize your production database:

```bash
# Without --local flag for production
npx wrangler d1 execute blog-db --file=./schema.sql
```

## 📚 What's Next?

- ✅ Customize the design in `src/layouts/Layout.astro`
- ✅ Add more pages or blog features
- ✅ Set up automatic deployments with Cloudflare Pages Git integration
- ✅ Add authentication for the API endpoints
- ✅ Implement a web-based admin panel
- ✅ Add markdown support for easier content creation

## 🆘 Need Help?

- Check `README.md` for comprehensive documentation
- Review troubleshooting section for common issues
- Cloudflare Discord: https://discord.cloudflare.com
- Astro Discord: https://astro.build/chat

## 📁 Project Structure Overview

```
astro-cloudflare-blog/
├── src/
│   ├── components/     # Reusable UI components
│   ├── layouts/        # Page layouts
│   ├── lib/           # Database and storage utilities
│   ├── pages/         # Routes and API endpoints
│   └── env.d.ts       # TypeScript types
├── schema.sql          # Database schema
├── wrangler.toml      # Cloudflare config
└── README.md          # Full documentation
```

## 🎉 You're All Set!

Your blog is ready to use. Start creating content and customize it to make it your own!

---

**Pro Tip**: Use Cloudflare Pages Git integration to automatically deploy on every push to your repository.
