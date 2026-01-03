# Pastebin-Lite Application

A production-ready Pastebin-like application built with Node.js and Express.js. Users can create text pastes, receive shareable URLs, and view pastes. Each paste may optionally expire based on time-to-live (TTL) or view-count limits.

## Features

- Create text pastes with optional constraints (TTL and/or view limits)
- Share pastes via unique URLs
- View pastes in both API (JSON) and HTML formats
- Automatic expiry based on constraints
- Safe HTML rendering (XSS protection)
- Health check endpoint for monitoring
- Support for deterministic time testing (TEST_MODE)
- Atomic view count increments (no race conditions)
- Centralized error handling

## Tech Stack

- **Runtime**: Node.js (JavaScript)
- **Framework**: Express.js
- **Validation**: express-validator
- **Persistence**: MySQL
- **Deployment**: Compatible with Vercel and other serverless platforms

## Project Structure

```
src/
 ├── index.js                 # Application entry point
 ├── app.js                   # Express app configuration
 ├── routes/
 │    ├── healthz.js          # Health check route
 │    └── pastes.js           # Paste routes
 ├── controllers/
 │    └── pasteController.js  # Paste business logic
 ├── lib/
 │    ├── db.js               # Database layer
 │    ├── time.js             # Time utilities (TEST_MODE support)
 │    └── validation.js       # Validation rules
 ├── middleware/
 │    └── errorHandler.js     # Error handling middleware
 └── views/
      └── paste.html          # Paste view template

public/
 └── index.html               # Home page UI

README.md                     # This file
package.json                  # Dependencies
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MySQL database (v5.7 or higher, or MariaDB 10.2+)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Aganitha2
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (see Configuration section)

4. Start the server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Configuration

### Environment Variables

- `PORT` - Server port (default: 3000)
- `DB_TYPE` - Database type: `'mysql'` (default: `'mysql'`)
- `DATABASE_URL` - MySQL connection URL (recommended)
  - Format: `mysql://user:password@host:port/database`
  - Example: `mysql://root:password@localhost:3306/pastebin`
- **OR** use individual variables:
  - `DB_HOST` - MySQL host (default: `'localhost'`)
  - `DB_PORT` - MySQL port (default: `3306`)
  - `DB_USER` - MySQL user (default: `'root'`)
  - `DB_PASSWORD` - MySQL password (default: `''`)
  - `DB_NAME` - MySQL database name (default: `'pastebin'`)
- `TEST_MODE` - Set to `'1'` to enable deterministic time testing
- `NODE_ENV` - Set to `'production'` for production mode
- `VERCEL` - Automatically set by Vercel (set to `'1'` in serverless environment)

### Database Setup

#### Local Development

**Option 1: Using Docker (Recommended)**
```bash
# Run MySQL in Docker
docker run -d \
  --name mysql-pastebin \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=pastebin \
  -p 3306:3306 \
  mysql:8.0

# Set environment variable
export DATABASE_URL=mysql://root:password@localhost:3306/pastebin
```

**Option 2: Local MySQL Installation**
1. Install MySQL on your system
2. Create a database:
   ```sql
   CREATE DATABASE pastebin;
   ```
3. Set environment variables:
   ```bash
   export DB_HOST=localhost
   export DB_PORT=3306
   export DB_USER=root
   export DB_PASSWORD=your_password
   export DB_NAME=pastebin
   ```
   Or use `DATABASE_URL`:
   ```bash
   export DATABASE_URL=mysql://root:your_password@localhost:3306/pastebin
   ```

#### Production

**Option 1: Managed MySQL Services**
- **AWS RDS**: Create a MySQL instance and use the connection string
- **PlanetScale**: Serverless MySQL platform
- **DigitalOcean Managed Databases**: MySQL hosting
- **Railway**: MySQL add-on
- **Render**: PostgreSQL (not MySQL, but similar setup)

**Option 2: Self-Hosted**
- Set up MySQL on your server
- Use `DATABASE_URL` or individual environment variables
- Ensure proper firewall rules and security settings

## API Endpoints

### Health Check
```
GET /api/healthz
```
Returns `{ "ok": true }` if the service is healthy and database is accessible.

**Response:**
```json
{
  "ok": true
}
```

### Create Paste
```
POST /api/pastes
Content-Type: application/json
```

**Request Body:**
```json
{
  "content": "string",        // required, non-empty string
  "ttl_seconds": 60,          // optional, integer >= 1
  "max_views": 5              // optional, integer >= 1
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "url": "https://your-domain.com/p/<id>"
}
```

**Error Response (400):**
```json
{
  "error": "content is required and must be a non-empty string"
}
```

### Get Paste (API)
```
GET /api/pastes/:id
```

**Response (200):**
```json
{
  "content": "string",
  "remaining_views": 4,        // null if no limit
  "expires_at": "2026-01-01T00:00:00.000Z"  // null if no expiration
}
```

**Error Response (404):**
```json
{
  "error": "Paste not found"
}
```

**Notes:**
- Each successful fetch counts as ONE view
- TTL and max_views are enforced
- If paste is missing, expired, or exceeded view limit, returns 404

### View Paste (HTML)
```
GET /p/:id
```

Returns an HTML page with the paste content. Content is safely escaped to prevent XSS attacks.

**Error Response (404):**
Returns HTML error page if paste is unavailable.

## Frontend

The application includes a minimal HTML frontend:

- **Home Page (`/`)**: Form to create new pastes with optional TTL and max views
- **Paste Page (`/p/:id`)**: Displays paste content with safe HTML rendering

## Testing

The application supports deterministic time testing for automated test suites:

1. Set environment variable: `TEST_MODE=1`
2. Include header in requests: `x-test-now-ms: <milliseconds since epoch>`

**Example:**
```bash
export TEST_MODE=1
curl -H "x-test-now-ms: 1609459200000" \
     -H "Content-Type: application/json" \
     -X POST http://localhost:3000/api/pastes \
     -d '{"content": "test", "ttl_seconds": 60}'
```

## Persistence Layer

The application uses MySQL for persistence, which survives serverless requests:

- **MySQL**: Relational database with ACID guarantees
- **Connection Pooling**: Uses connection pooling for efficient database access
- **Automatic Table Creation**: Creates the `pastes` table on first run

All database operations are atomic:
- View count increments are atomic using MySQL transactions (no race conditions)
- No negative view counts
- Proper expiration handling
- Uses `FOR UPDATE` locks for concurrent safety

## Error Handling

The application implements centralized error handling:

- API routes always return JSON error responses
- Correct HTTP status codes (4xx for client errors, 5xx for server errors)
- No stack traces exposed in production
- Proper error messages for debugging

## Deployment

### Deploying to Vercel

Vercel is a serverless platform that works great with Node.js applications. Follow these steps to deploy your Pastebin application:

#### Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) (free tier available)
2. **MySQL Database**: Set up a MySQL database (see options below)
3. **Git Repository**: Push your code to GitHub, GitLab, or Bitbucket

#### Step 1: Set Up MySQL Database

You need a MySQL database accessible from the internet. Here are recommended options:

**Option A: PlanetScale (Recommended for Vercel)**
- Free tier available
- Serverless MySQL
- Works seamlessly with Vercel
- Sign up at [planetscale.com](https://planetscale.com)
- Create a database and get the connection string

**Option B: Railway**
- Free tier available
- Easy MySQL setup
- Sign up at [railway.app](https://railway.app)
- Create a MySQL service

**Option C: AWS RDS / DigitalOcean / Other**
- Use any managed MySQL service
- Ensure the database is accessible from the internet
- Whitelist Vercel IPs if needed

#### Step 2: Install Vercel CLI

```bash
npm i -g vercel
```

#### Step 3: Login to Vercel

```bash
vercel login
```

#### Step 4: Set Environment Variables

You can set environment variables via CLI or the Vercel dashboard:

**Via CLI:**
```bash
# Set DATABASE_URL (recommended)
vercel env add DATABASE_URL

# When prompted, enter your MySQL connection string:
# mysql://user:password@host:port/database

# Or set individual variables
vercel env add DB_HOST
vercel env add DB_PORT
vercel env add DB_USER
vercel env add DB_PASSWORD
vercel env add DB_NAME

# Set other variables
vercel env add NODE_ENV production
```

**Via Dashboard:**
1. Go to your project on [vercel.com](https://vercel.com)
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:
   - `DATABASE_URL`: Your MySQL connection string
   - `NODE_ENV`: `production`
   - `DB_TYPE`: `mysql` (optional, defaults to mysql)

#### Step 5: Deploy

**First Deployment (Preview):**
```bash
vercel
```

This will:
- Create a preview deployment
- Show you the deployment URL
- Allow you to test before going to production

**Production Deployment:**
```bash
vercel --prod
```

This deploys to your production domain.

#### Step 6: Verify Deployment

1. Check the health endpoint: `https://your-app.vercel.app/api/healthz`
2. Should return: `{"ok": true}`
3. Test creating a paste via the web interface or API

#### Troubleshooting

**Database Connection Issues:**
- Verify your `DATABASE_URL` is correct
- Ensure your MySQL database allows connections from Vercel's IPs
- Check database firewall settings
- Verify database credentials

**Environment Variables Not Working:**
- Make sure variables are set for the correct environment (Production, Preview, Development)
- Redeploy after adding new environment variables
- Check variable names match exactly (case-sensitive)

**Build Errors:**
- Ensure all dependencies are in `package.json`
- Check Node.js version compatibility
- Review build logs in Vercel dashboard

#### Continuous Deployment

Vercel automatically deploys when you push to your Git repository:
1. Connect your repository in Vercel dashboard
2. Push to `main` branch → Production deployment
3. Push to other branches → Preview deployment

#### Custom Domain

1. Go to **Settings** → **Domains** in Vercel dashboard
2. Add your custom domain
3. Follow DNS configuration instructions
4. Vercel handles SSL certificates automatically

### Other Platforms

The application is compatible with any Node.js hosting platform:
- Heroku
- AWS Lambda (with serverless framework)
- Railway
- Render
- DigitalOcean App Platform

Ensure environment variables are set correctly for your chosen platform.

## Design Decisions

1. **Database Choice**: 
   - MySQL for reliable, persistent storage with ACID guarantees
   - Connection pooling for efficient resource management
   - Atomic operations using MySQL transactions and row-level locking

2. **ID Generation**: Using UUID v4 for paste IDs to ensure uniqueness and prevent enumeration attacks.

3. **View Counting**: View count is incremented atomically in the database to prevent race conditions.

4. **Time Handling**: Support for `TEST_MODE` environment variable and `x-test-now-ms` header for deterministic testing of TTL functionality.

5. **Security**:
   - HTML content is escaped to prevent XSS attacks
   - Input validation on all endpoints using express-validator
   - Proper error handling with appropriate HTTP status codes
   - No stack traces in production

6. **Serverless Compatibility**: The code is structured to work with serverless functions (Vercel, AWS Lambda, etc.)

7. **Error Handling**: Centralized error handling middleware ensures consistent error responses.

## License

ISC
