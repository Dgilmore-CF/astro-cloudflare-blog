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

### 1. Create D1 Database and Apply Schemas

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

## 🔄 Managing Updates

### Updating Your GitHub Repository

#### Step 1: Check Current Status

```bash
cd /Users/dgilmore/CascadeProjects/astro-cloudflare-blog
git status
```

This shows which files have been modified.

#### Step 2: Stage Your Changes

Stage all changes:
```bash
git add -A
```

Or stage specific files:
```bash
git add README.md src/pages/index.astro
```

#### Step 3: Commit Your Changes

```bash
git commit -m "Describe your changes here"
```

Examples of good commit messages:
- `git commit -m "Add new blog post about Astro"`
- `git commit -m "Fix search functionality bug"`
- `git commit -m "Update admin panel styling"`

#### Step 4: Push to GitHub

```bash
git push origin main
```

If this is your first push and you get an error:
```bash
git push -u origin main
```

#### Step 5: Verify on GitHub

Go to your repository on GitHub.com to verify your changes appear.

### Setting Up Automatic Deployments

Configure Cloudflare Pages to auto-deploy on every GitHub push:

#### Step 1: Connect to Git

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** → **Pages**
3. Click **Create a project** → **Connect to Git**
4. Authorize Cloudflare to access your GitHub account
5. Select your repository: `your-username/astro-cloudflare-blog`

#### Step 2: Configure Build Settings

- **Framework preset**: Astro
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/`

#### Step 3: Configure Environment Variables (Optional)

Add any environment variables:
- Click **Add variable**
- Add variables like `ENVIRONMENT=production`

#### Step 4: Add Bindings

Under **Settings** → **Functions**:

1. **D1 Databases**:
   - Variable name: `DB`
   - D1 database: Select `blog-db`

2. **R2 Buckets**:
   - Variable name: `IMAGES`
   - R2 bucket: Select `blog-images`

#### Step 5: Deploy

Click **Save and Deploy**

Now every push to `main` branch will automatically trigger a deployment!

### Updating Cloudflare D1 Database

#### Applying New Schema Changes

If you modify the database schema:

**For Production:**
```bash
# Apply your changes
npx wrangler d1 execute blog-db --file=./schema-changes.sql

# Or run a single command
npx wrangler d1 execute blog-db --command="ALTER TABLE posts ADD COLUMN new_field TEXT"
```

**For Local Development:**
```bash
npx wrangler d1 execute blog-db --local --file=./schema-changes.sql
```

#### Backing Up Database

**Export from Production:**
```bash
# Get database info
npx wrangler d1 info blog-db

# Export data (requires wrangler 3.0+)
npx wrangler d1 export blog-db --output=backup-$(date +%Y%m%d).sql
```

**View Database Contents:**
```bash
# List all posts
npx wrangler d1 execute blog-db --command="SELECT id, title, status FROM posts"

# Count records
npx wrangler d1 execute blog-db --command="SELECT COUNT(*) FROM posts"

# View users (be careful with production!)
npx wrangler d1 execute blog-db --command="SELECT id, username, role FROM users"
```

#### Migrating Data Between Environments

```bash
# Export from local
npx wrangler d1 export blog-db --local --output=local-data.sql

# Import to production (BE CAREFUL!)
npx wrangler d1 execute blog-db --file=local-data.sql
```

### Updating Cloudflare R2 Storage

#### Listing Objects in Bucket

```bash
# List all objects
npx wrangler r2 object list blog-images

# List with prefix
npx wrangler r2 object list blog-images --prefix=uploads/
```

#### Uploading Files Manually

```bash
# Upload a single file
npx wrangler r2 object put blog-images/test-image.jpg --file=./local-image.jpg

# Upload with metadata
npx wrangler r2 object put blog-images/banner.jpg --file=./banner.jpg --content-type=image/jpeg
```

#### Downloading Files

```bash
# Download a specific object
npx wrangler r2 object get blog-images/uploads/image.jpg --file=./downloaded-image.jpg
```

#### Deleting Objects

```bash
# Delete a single object
npx wrangler r2 object delete blog-images/old-image.jpg
```

#### Creating Additional Buckets

```bash
# Create a new bucket for backups
npx wrangler r2 bucket create blog-backups

# List all your buckets
npx wrangler r2 bucket list
```

### Updating Cloudflare Pages Deployment

#### Manual Deployment

After making changes:

```bash
# Build your project
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist
```

#### Deploy Specific Branch

```bash
# Deploy a preview from a different branch
git checkout feature-branch
npm run build
npx wrangler pages deploy dist --branch=feature-branch
```

#### Rollback to Previous Deployment

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** → **Your Project**
3. Click **Deployments** tab
4. Find the previous working deployment
5. Click **...** → **Rollback to this deployment**

#### View Deployment Logs

```bash
# View recent deployments
npx wrangler pages deployment list

# View deployment logs (use deployment ID from list command)
npx wrangler pages deployment tail <deployment-id>
```

### Common Update Workflows

#### Workflow 1: Update Blog Content

```bash
# 1. Make your changes (add/edit posts via admin panel or code)
# 2. Commit and push
git add -A
git commit -m "Add new blog posts"
git push origin main

# 3. If auto-deploy is enabled, it deploys automatically!
# Otherwise, deploy manually:
npm run build
npx wrangler pages deploy dist
```

#### Workflow 2: Update Dependencies

```bash
# 1. Update packages
npm update

# 2. Test locally
npm run dev

# 3. Commit and push
git add package.json package-lock.json
git commit -m "Update dependencies"
git push origin main
```

#### Workflow 3: Database Schema Updates

```bash
# 1. Create migration file
echo "ALTER TABLE posts ADD COLUMN reading_time INTEGER DEFAULT 0;" > migrations/add-reading-time.sql

# 2. Apply to local database first
npx wrangler d1 execute blog-db --local --file=migrations/add-reading-time.sql

# 3. Test thoroughly locally
npm run dev

# 4. Apply to production
npx wrangler d1 execute blog-db --file=migrations/add-reading-time.sql

# 5. Commit migration file
git add migrations/
git commit -m "Add reading time field to posts"
git push origin main
```

#### Workflow 4: Hotfix Production Issue

```bash
# 1. Create hotfix branch
git checkout -b hotfix/fix-login-bug

# 2. Make your fix
# Edit files...

# 3. Test locally
npm run dev

# 4. Commit and push
git add -A
git commit -m "Fix login authentication bug"
git push origin hotfix/fix-login-bug

# 5. Deploy preview to test
npm run build
npx wrangler pages deploy dist --branch=hotfix

# 6. If good, merge to main
git checkout main
git merge hotfix/fix-login-bug
git push origin main

# 7. Delete hotfix branch
git branch -d hotfix/fix-login-bug
git push origin --delete hotfix/fix-login-bug
```

### Monitoring and Maintenance

#### Check Cloudflare Pages Status

```bash
# View project info
npx wrangler pages project list

# View recent deployments
npx wrangler pages deployment list --project-name=astro-cloudflare-blog
```

#### Monitor Database Usage

```bash
# Check database size and info
npx wrangler d1 info blog-db
```

#### Check R2 Storage Usage

View in Cloudflare Dashboard:
1. Go to **R2** section
2. Click on `blog-images` bucket
3. View **Metrics** tab for storage usage

#### Clean Up Old Sessions

Periodically clean expired sessions:

```bash
npx wrangler d1 execute blog-db --command="DELETE FROM sessions WHERE expires_at < datetime('now')"
```

## 📝 Usage

### Admin Panel

Access the admin panel at `/admin` (requires login):

1. **Login**: Go to `/login` and use your credentials
2. **Dashboard**: View statistics and quick actions
3. **Create Posts**: Use the markdown editor at `/admin/posts/new`
4. **Manage Posts**: Edit or delete posts at `/admin/posts`
5. **Search**: Use `/search` to find posts

See `SETUP_AUTH.md` for detailed authentication and admin panel documentation.

### Creating Posts via Admin Panel

1. Login at `/login`
2. Navigate to `/admin/posts/new`
3. Write your post in **Markdown**
4. Use the preview button to see rendered output
5. Click "Create Post"

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
- [Marked.js (Markdown)](https://marked.js.org/)

## 📖 Additional Documentation

- **SETUP_AUTH.md** - Detailed authentication and admin panel guide
- **QUICK_START.md** - Quick setup guide
- **GITHUB_SETUP.md** - GitHub integration guide

## 🌟 Credits

Built with ❤️ using Astro and Cloudflare's edge platform.
