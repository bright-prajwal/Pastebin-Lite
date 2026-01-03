/**
 * Express application setup
 */
const express = require('express');
const path = require('path');
const healthzRouter = require('./routes/healthz');
const pastesRouter = require('./routes/pastes');
const { viewPasteHandler } = require('./controllers/pasteController');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// Trust proxy for correct protocol detection (needed for Vercel and other proxies)
app.set('trust proxy', true);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory (for home page)
app.use(express.static(path.join(__dirname, '..', 'public')));

// API Routes
app.use('/api/healthz', healthzRouter);
app.use('/api/pastes', pastesRouter);

// HTML Routes
// GET /p/:id - View paste (HTML)
app.get('/p/:id', viewPasteHandler);

// Root route - serve home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;

