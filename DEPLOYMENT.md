# Vercel Deployment Guide

This guide provides step-by-step instructions for deploying the Pastebin-Lite application to Vercel.

## Quick Start

1. **Set up MySQL database** (see options below)
2. **Install Vercel CLI**: `npm i -g vercel`
3. **Login**: `vercel login`
4. **Set environment variables**: `vercel env add DATABASE_URL`
5. **Deploy**: `vercel --prod`

## Detailed Steps

### 1. MySQL Database Setup

You need a MySQL database that's accessible from the internet. Here are the best options:

#### Option A: PlanetScale (Recommended)

**Why PlanetScale?**
- Free tier with generous limits
- Serverless MySQL (perfect for Vercel)
- Built-in connection pooling
- No server management

**Setup:**
1. Sign up at [planetscale.com](https://planetscale.com)
2. Create a new database
3. Go to **Settings** → **Passwords**
4. Create a new password
5. Copy the connection string (format: `mysql://user:password@host:port/database`)

#### Option B: Railway

**Why Railway?**
- Free tier available
- Easy setup
- Good for small projects

**Setup:**
1. Sign up at [railway.app](https://railway.app)
2. Create a new project
3. Add MySQL service
4. Copy the connection string from the service variables

#### Option C: AWS RDS / DigitalOcean / Other

Use any managed MySQL service. Ensure:
- Database is publicly accessible (or whitelist Vercel IPs)
- Connection string follows format: `mysql://user:password@host:port/database`

### 2. Install Vercel CLI

```bash
npm install -g vercel
```

### 3. Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate.

### 4. Initialize Project (First Time)

If this is your first deployment:

```bash
vercel
```

Answer the prompts:
- Set up and deploy? **Yes**
- Which scope? (Select your account)
- Link to existing project? **No**
- Project name? (Press Enter for default)
- Directory? (Press Enter for current directory)

### 5. Set Environment Variables

#### Method 1: Via CLI (Recommended)

```bash
# Set DATABASE_URL (recommended method)
vercel env add DATABASE_URL production
# Paste your MySQL connection string when prompted
# Example: mysql://user:password@host:port/database

# Also set for preview and development environments
vercel env add DATABASE_URL preview
vercel env add DATABASE_URL development
```

#### Method 2: Via Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add the following:

| Variable | Value | Environments |
|----------|-------|--------------|
| `DATABASE_URL` | `mysql://user:password@host:port/database` | Production, Preview, Development |
| `NODE_ENV` | `production` | Production |
| `DB_TYPE` | `mysql` | All (optional, defaults to mysql) |

**Important:** Make sure to add `DATABASE_URL` to all three environments (Production, Preview, Development).

### 6. Deploy to Production

```bash
vercel --prod
```

This will:
- Build your application
- Deploy to production
- Give you a production URL (e.g., `https://your-app.vercel.app`)

### 7. Verify Deployment

1. **Check Health Endpoint:**
   ```bash
   curl https://your-app.vercel.app/api/healthz
   ```
   Should return: `{"ok": true}`

2. **Test Creating a Paste:**
   ```bash
   curl -X POST https://your-app.vercel.app/api/pastes \
     -H "Content-Type: application/json" \
     -d '{"content": "Hello from Vercel!"}'
   ```

3. **Visit Your App:**
   Open `https://your-app.vercel.app` in your browser

## Continuous Deployment

Vercel automatically deploys when you push to Git:

1. **Connect Repository:**
   - Go to Vercel dashboard
   - Click **Add New Project**
   - Import your Git repository

2. **Automatic Deployments:**
   - Push to `main` branch → Production deployment
   - Push to other branches → Preview deployment
   - Open Pull Request → Preview deployment

## Custom Domain

1. Go to **Settings** → **Domains**
2. Add your domain (e.g., `pastebin.example.com`)
3. Follow DNS configuration instructions
4. Vercel automatically provisions SSL certificates

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | MySQL connection string | `mysql://user:pass@host:3306/db` |
| `DB_HOST` | No* | MySQL host | `localhost` |
| `DB_PORT` | No* | MySQL port | `3306` |
| `DB_USER` | No* | MySQL user | `root` |
| `DB_PASSWORD` | No* | MySQL password | `password` |
| `DB_NAME` | No* | Database name | `pastebin` |
| `NODE_ENV` | No | Environment | `production` |
| `DB_TYPE` | No | Database type | `mysql` |

*Required if not using `DATABASE_URL`

## Troubleshooting

### Database Connection Fails

**Symptoms:** Health check returns `{"ok": false}` or 500 errors

**Solutions:**
1. Verify `DATABASE_URL` is correct
2. Check database allows external connections
3. Verify firewall/security group settings
4. Test connection string locally first
5. Check database credentials

### Environment Variables Not Working

**Symptoms:** App uses wrong database or can't connect

**Solutions:**
1. Ensure variables are set for correct environment (Production/Preview)
2. Redeploy after adding variables: `vercel --prod`
3. Check variable names are exact (case-sensitive)
4. Verify in Vercel dashboard under Settings → Environment Variables

### Build Fails

**Symptoms:** Deployment fails during build

**Solutions:**
1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Verify Node.js version compatibility
4. Check for syntax errors in code
5. Review `vercel.json` configuration

### Function Timeout

**Symptoms:** Requests timeout or take too long

**Solutions:**
1. Check database connection pooling settings
2. Optimize database queries
3. Consider upgrading Vercel plan for longer timeouts
4. Check database performance

## Vercel Configuration

The `vercel.json` file configures:
- Build settings
- Route handling
- Environment variables

Current configuration routes all requests to `src/index.js` which handles:
- `/api/*` - API endpoints
- `/p/*` - Paste viewing
- `/` - Home page

## Monitoring

Vercel provides built-in monitoring:
- **Logs**: View function logs in dashboard
- **Analytics**: Track requests and performance
- **Alerts**: Set up alerts for errors

## Cost

Vercel Free Tier includes:
- 100GB bandwidth/month
- 100 serverless function executions/day
- Unlimited static deployments
- Automatic SSL

For production with high traffic, consider Vercel Pro ($20/month).

## Support

- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Vercel Discord: [vercel.com/discord](https://vercel.com/discord)
- GitHub Issues: Report bugs in your repository

