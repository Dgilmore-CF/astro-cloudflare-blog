# Authentication & Admin Panel Setup

This guide covers the new authentication, admin panel, markdown support, and search features.

## 🔐 Initial Setup

### 1. Apply Auth Schema

First, apply the authentication schema to your database:

```bash
# For local development
npx wrangler d1 execute blog-db --local --file=./schema-auth.sql

# For production
npx wrangler d1 execute blog-db --file=./schema-auth.sql
```

### 2. Create First Admin User

Use the registration API (only works when no users exist):

```bash
curl -X POST http://localhost:4321/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "your-secure-password"
  }'
```

**IMPORTANT**: This endpoint automatically disables after the first user is created for security.

## 🎨 New Features

### Authentication System

- **Secure password hashing** using Web Crypto API (PBKDF2)
- **Session-based authentication** with HTTP-only cookies
- **Role-based access control** (admin, editor, viewer)
- **Automatic session cleanup**

### Admin Panel

Access at `/admin` (requires authentication):

- **Dashboard**: View statistics and recent posts
- **Post Management**: Create, edit, and delete posts
- **Markdown Editor**: Write posts in markdown with live preview
- **Quick Actions**: Fast access to common tasks

### Markdown Support

Write blog posts in markdown with:

- **GitHub Flavored Markdown** (GFM)
- **Live preview** in the editor
- **Auto-generated** slugs and excerpts
- **Syntax highlighting** support
- **Heading IDs** for anchor links

### Search Functionality

- **Full-text search** using SQLite FTS5
- **Fallback search** using LIKE queries
- **Highlighted results** with search snippets
- **Fast and responsive** search interface

## 📝 Creating Posts

### Via Admin Panel

1. Login at `/login`
2. Go to `/admin/posts/new`
3. Write your post in markdown
4. Use the preview button to see how it looks
5. Click "Create Post"

### Via API

```bash
curl -X POST http://localhost:4321/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Post",
    "slug": "my-post",
    "content": "# Hello\n\nThis is **markdown**!",
    "excerpt": "Auto-generated if empty",
    "author": "Admin",
    "status": "published",
    "published_date": "2024-11-21T00:00:00Z"
  }'
```

## 🔍 Using Search

### Public Search Page

Visit `/search` to search all published posts:

- Type your query
- Press Enter or click Search
- View results with highlighted matches

### Search API

```bash
curl http://localhost:4321/api/search?q=your+search+term
```

Returns:

```json
{
  "posts": [
    {
      "id": 1,
      "title": "Post Title",
      "slug": "post-slug",
      "excerpt": "Post excerpt",
      "snippet": "...search term...",
      "author": "Author Name",
      "published_date": "2024-11-21T00:00:00Z"
    }
  ],
  "count": 1
}
```

## 🔒 Security Best Practices

### 1. Change Default Password

If you used default credentials, change them immediately:

1. Login with default credentials
2. Use the admin panel to update user info
3. Or reset via database:

```sql
-- Generate a new password hash and update
UPDATE users SET password_hash = 'new_hash' WHERE username = 'admin';
```

### 2. Secure the Registration Endpoint

The `/api/auth/register` endpoint is automatically disabled after first user creation. To manually disable it, delete or comment out the file:

```bash
rm src/pages/api/auth/register.ts
```

### 3. Use HTTPS

Always use HTTPS in production. Cloudflare Pages provides this automatically.

### 4. Configure CORS

If accessing the API from external domains, configure CORS appropriately.

### 5. Add Rate Limiting

Consider adding rate limiting to authentication endpoints in production.

## 🎯 Admin Panel URLs

- **Login**: `/login`
- **Dashboard**: `/admin`
- **Manage Posts**: `/admin/posts`
- **New Post**: `/admin/posts/new`
- **Edit Post**: `/admin/posts/edit/[id]`
- **Logout**: Click logout button (calls `/api/auth/logout`)

## 🔑 API Endpoints

### Authentication

- `POST /api/auth/login` - Login with username/password
- `POST /api/auth/logout` - Logout (clears session)
- `GET /api/auth/session` - Check current session
- `POST /api/auth/register` - Register first admin (auto-disabled)

### Posts

- `GET /api/posts` - List posts
- `POST /api/posts` - Create post
- `PUT /api/posts/[id]` - Update post
- `DELETE /api/posts/[id]` - Delete post

### Search

- `GET /api/search?q=query` - Search posts

### Images

- `POST /api/images/upload` - Upload image
- `GET /api/images/[key]` - Get image

## 📖 Markdown Guide

### Headings

```markdown
# H1 Heading
## H2 Heading
### H3 Heading
```

### Text Formatting

```markdown
**Bold text**
*Italic text*
`Inline code`
```

### Links and Images

```markdown
[Link text](https://example.com)
![Alt text](/api/images/image-key.jpg)
```

### Code Blocks

```markdown
\`\`\`javascript
const hello = "world";
\`\`\`
```

### Lists

```markdown
- Unordered item
- Another item

1. Ordered item
2. Second item
```

## 🚨 Troubleshooting

### Can't Login

- Verify database schema is applied
- Check user exists: `npx wrangler d1 execute blog-db --command="SELECT * FROM users"`
- Clear cookies and try again

### Search Not Working

- Verify FTS table exists: `npx wrangler d1 execute blog-db --command="SELECT * FROM posts_fts LIMIT 1"`
- Check posts exist in database
- Fallback LIKE search should work even without FTS

### Admin Panel Shows Error

- Check authentication middleware is working
- Verify session cookie is set
- Check browser console for JavaScript errors

### Markdown Not Rendering

- Verify `marked` package is installed
- Check markdown.ts functions are imported correctly
- Test markdown conversion in browser console

## 🔄 Migration from Previous Version

If upgrading from the base version:

1. Apply new schema: `npx wrangler d1 execute blog-db --file=./schema-auth.sql`
2. Create admin user via registration API
3. Existing posts remain unchanged
4. Login and start using admin panel

## 💡 Tips

- Use markdown for better formatting control
- Preview posts before publishing
- Use the search feature to find old posts quickly
- Keep sessions secure by logging out on shared devices
- Backup your database regularly

## 🆘 Need Help?

- Check browser console for errors
- Review Cloudflare Workers logs
- Test API endpoints with curl
- Verify database schema matches expectations

---

**Security Note**: Always protect production admin panels with strong passwords and HTTPS!
