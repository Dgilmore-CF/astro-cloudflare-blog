# GitHub Repository Setup

This document provides instructions for connecting your local CloudBlog repository to GitHub for version control.

## Option 1: Create New Repository on GitHub (Recommended)

### Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Click "New repository" or go to https://github.com/new
3. Fill in the details:
   - **Repository name**: `astro-cloudflare-blog` (or your preferred name)
   - **Description**: "Modern blog built with Astro, Cloudflare Workers, D1, and R2"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)

4. Click "Create repository"

### Step 2: Connect Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add the remote repository
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git

# Rename branch to main (optional but recommended)
git branch -M main

# Push your code
git push -u origin main
```

**Replace** `YOUR-USERNAME` and `YOUR-REPO-NAME` with your actual GitHub username and repository name.

### Example

If your GitHub username is `johndoe` and you named the repo `my-blog`:

```bash
git remote add origin https://github.com/johndoe/my-blog.git
git branch -M main
git push -u origin main
```

## Option 2: Use GitHub CLI

If you have [GitHub CLI](https://cli.github.com/) installed:

```bash
# Login to GitHub (if not already)
gh auth login

# Create repo and push
gh repo create astro-cloudflare-blog --public --source=. --remote=origin --push
```

For a private repository:

```bash
gh repo create astro-cloudflare-blog --private --source=. --remote=origin --push
```

## Verify Connection

After pushing, verify your repository:

```bash
# Check remote
git remote -v

# View commit history
git log --oneline
```

You should see your repository URL and the initial commit.

## Future Commits

After initial setup, use standard Git workflow:

```bash
# Stage changes
git add .

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push
```

## GitHub Actions (Optional)

You can set up GitHub Actions for:
- Automatic deployment to Cloudflare Pages on push
- Running tests
- Linting and type checking

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: astro-cloudflare-blog
          directory: dist
```

## Troubleshooting

### Authentication Issues

If you encounter authentication issues:

1. **HTTPS**: You may need to use a Personal Access Token instead of your password
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Generate a new token with `repo` scope
   - Use this token as your password when pushing

2. **SSH**: Set up SSH keys
   ```bash
   # Generate SSH key
   ssh-keygen -t ed25519 -C "your_email@example.com"
   
   # Add to SSH agent
   eval "$(ssh-agent -s)"
   ssh-add ~/.ssh/id_ed25519
   
   # Copy public key and add to GitHub
   cat ~/.ssh/id_ed25519.pub
   ```
   
   Then use SSH URL:
   ```bash
   git remote set-url origin git@github.com:YOUR-USERNAME/YOUR-REPO-NAME.git
   ```

### Repository Already Exists

If you accidentally initialized the GitHub repo with files:

```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

## Next Steps

After connecting to GitHub:

1. Add repository description and topics on GitHub
2. Enable GitHub Pages (if desired) or use Cloudflare Pages
3. Set up branch protection rules
4. Configure Cloudflare Pages Git integration for automatic deployments
5. Add collaborators if working in a team

## Cloudflare Pages Git Integration

For automatic deployments on every push:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to Pages
3. Click "Create a project" → "Connect to Git"
4. Select your GitHub repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/`
6. Add environment bindings (D1 and R2) in Pages settings
7. Click "Save and Deploy"

Now every push to your main branch will automatically deploy to Cloudflare Pages!

## Resources

- [GitHub Docs](https://docs.github.com)
- [Git Documentation](https://git-scm.com/doc)
- [GitHub CLI](https://cli.github.com/)
- [Cloudflare Pages Git Integration](https://developers.cloudflare.com/pages/get-started/git-integration/)
