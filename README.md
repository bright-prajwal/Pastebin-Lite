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
 ├── index.js                 # entry point
 ├── app.js                   # Express app configuration
 ├── routes/
 │    ├── healthz.js          # Health check route
 │    └── pastes.js           # Paste routes
 ├── controllers/
 │    └── pasteController.js  # Paste business logic
 ├── lib/
 │    ├── db.js               # Database layer
 │    ├── time.js             # Time utilities 
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
- MySQL database 

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


## API Endpoints
- `GET /api/healthz` – Health check
- `POST /api/pastes` – Create a paste
- `GET /api/pastes/:id` – Fetch paste (JSON)
- `GET /p/:id` – View paste (HTML)

## Environment Variables
```env
DATABASE_URL=mysql://user:password@host:port/pastebin
NODE_ENV=production