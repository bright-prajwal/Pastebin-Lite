/**
 * Application entry point
 */
// Load environment variables from .env file
require('dotenv').config();

const app = require('./app');
const { initDatabase } = require('./lib/db');

const PORT = process.env.PORT || 3000;

// Initialize database
initDatabase()
  .then((success) => {
    if (success) {
      console.log('Database initialized successfully');
    } else {
      console.error('Failed to initialize database');
    }
  })
  .catch((err) => {
    console.error('Database initialization error:', err);
  });

// Only listen if not in serverless environment (Vercel)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for serverless environments
module.exports = app;

