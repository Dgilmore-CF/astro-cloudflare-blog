# CloudBlog - Astro + Cloudflare Blog Platform

A modern, serverless blog platform built with Astro and Cloudflare's edge computing stack. Features server-side rendering, SQL database storage, and object storage for images.

## ✨ Features

- **⚡ Astro SSR**: Lightning-fast server-side rendering with Astro
- **☁️ Cloudflare Workers**: Edge computing for global performance
- **🗄️ D1 Database**: Distributed SQL database for blog posts and metadata
- **📦 R2 Storage**: Object storage for images with zero egress fees
- **🎨 Modern UI**: Responsive, clean design with gradient hero sections
- **🏷️ Tag System**: Organize posts with tags
- **💬 Comments**: Built-in comment system (can be enabled)
- **📊 View Counter**: Track post views automatically
- **🔌 RESTful API**: Full CRUD operations for posts and images

## 🚀 Tech Stack

- [Astro](https://astro.build/) - Static site generator with SSR
- [Cloudflare Workers](https://workers.cloudflare.com/) - Serverless compute platform
- [Cloudflare D1](https://developers.cloudflare.com/d1/) - Serverless SQL database
- [Cloudflare R2](https://developers.cloudflare.com/r2/) - Object storage
- TypeScript - Type safety throughout

## 📁 Project Structure

```text
/
├── src/
│   ├── components/
│   │   └── PostCard.astro         # Reusable post card component
│   ├── layouts/
│   │   └── Layout.astro           # Base layout with nav and footer
│   ├── lib/
│   │   ├── db.ts                  # D1 database operations
│   │   └── r2.ts                  # R2 storage operations
│   ├── pages/
│   │   ├── api/
│   │   │   ├── images/
│   │   │   │   ├── [key].ts       # Serve images from R2
│   │   │   │   └── upload.ts      # Upload images to R2
│   │   │   └── posts/
│   │   │       └── index.ts       # Posts API (GET, POST)
│   │   ├── posts/
│   │   │   ├── [slug].astro       # Individual post page
│   │   │   └── index.astro        # All posts listing
│   │   ├── about.astro            # About page
│   │   └── index.astro            # Homepage
│   └── env.d.ts                   # TypeScript environment types
├── schema.sql                      # D1 database schema
├── wrangler.toml                   # Cloudflare configuration
└── astro.config.mjs               # Astro configuration
```

## 🛠️ Prerequisites

1. **Node.js** 18 or higher
2. **npm** or **pnpm**
3. **Cloudflare Account** (free tier works)
4. **Wrangler CLI** (installed via npm)

## 📦 Installation

1. **Clone or navigate to the repository**

```bash
cd astro-cloudflare-blog
```

2. **Install dependencies**

```bash
npm install
```

3. **Login to Cloudflare**

```bash
npx wrangler login
```

## 🔧 Cloudflare Setup

### 1. Create D1 Database

```bash
npx wrangler d1 create blog-db
```

This will output a database ID. Copy it and update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "blog-db"
database_id = "your-database-id-here"  # Replace with actual ID
```

### 2. Initialize Database Schema

```bash
npx wrangler d1 execute blog-db --file=./schema.sql
```

For local development:

```bash
npx wrangler d1 execute blog-db --local --file=./schema.sql
```

### 3. Create R2 Bucket

```bash
npx wrangler r2 bucket create blog-images
```

For development preview:

```bash
npx wrangler r2 bucket create blog-images-preview
```

### 4. Verify Configuration

Your `wrangler.toml` should now have valid IDs for both D1 and R2.

## 🏃 Development

Start the development server with Cloudflare bindings:

```bash
npm run dev
```

The blog will be available at `http://localhost:4321`

For Pages-style development with full Workers integration:

```bash
npx wrangler pages dev --compatibility-date=2024-11-21 --d1=DB=blog-db --r2=IMAGES=blog-images -- npm run dev
```

## 🚢 Deployment

### Deploy to Cloudflare Pages

1. **Build the project**

```bash
npm run build
```

2. **Deploy to Cloudflare Pages**

```bash
npx wrangler pages deploy dist
```

3. **Configure bindings in Cloudflare Dashboard**

Go to your Pages project settings and add:
- D1 binding: `DB` → your D1 database
- R2 binding: `IMAGES` → your R2 bucket

## 📝 Usage

### Creating Posts via API

```bash
curl -X POST https://your-blog.pages.dev/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Post",
    "slug": "my-first-post",
    "content": "<p>Hello World!</p>",
    "excerpt": "This is my first blog post",
    "author": "John Doe",
    "status": "published",
    "published_date": "2024-11-21T00:00:00Z"
  }'
```

### Uploading Images

```bash
curl -X POST https://your-blog.pages.dev/api/images/upload \
  -F "image=@/path/to/image.jpg"
```

Returns:

```json
{
  "key": "uploads/1234567890-abc123.jpg",
  "url": "/api/images/uploads/1234567890-abc123.jpg",
  "success": true
}
```

### Fetching Posts

```bash
# Get published posts
curl https://your-blog.pages.dev/api/posts?status=published&limit=10

# Get all posts
curl https://your-blog.pages.dev/api/posts?status=all
```

## 🔒 Security Notes

- The current API endpoints are **public** and should be secured for production
- Consider adding authentication for write operations (POST, PUT, DELETE)
- Add CORS configuration if needed
- Implement rate limiting to prevent abuse

## 🎨 Customization

### Styling

- Global styles are in `src/layouts/Layout.astro`
- Component-specific styles are scoped within each `.astro` file
- Modify the gradient in the hero section (`index.astro`) to match your brand

### Database Schema

- Edit `schema.sql` to add new fields or tables
- Re-run the migration command after changes
- Use `wrangler d1 migrations` for production schema updates

## 🐛 Troubleshooting

### Database not configured error

- Make sure you've run `wrangler d1 execute` to initialize the schema
- Verify `wrangler.toml` has the correct database_id
- For local dev, use `--local` flag with wrangler commands

### Images not loading

- Ensure R2 bucket is created and bound correctly
- Check that IMAGES binding is configured in wrangler.toml
- Verify image upload was successful via API response

### Build errors

- Clear `.astro` and `dist` folders: `rm -rf .astro dist`
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Make sure you're using Node.js 18+

## 📚 API Reference

### Posts API

- `GET /api/posts` - List posts (query params: `status`, `limit`, `offset`)
- `POST /api/posts` - Create new post

### Images API

- `GET /api/images/[key]` - Serve image from R2
- `POST /api/images/upload` - Upload image to R2

## 🤝 Contributing

This is a starter template. Feel free to:
- Add authentication
- Implement a web-based admin panel
- Add markdown support
- Integrate with a CMS
- Add search functionality
- Implement RSS feeds

## 📄 License

MIT License - feel free to use this for your own projects!

## 🔗 Resources

- [Astro Documentation](https://docs.astro.build)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)

## 🌟 Credits

Built with ❤️ using Astro and Cloudflare's edge platform.
