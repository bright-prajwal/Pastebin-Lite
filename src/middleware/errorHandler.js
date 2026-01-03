/**
 * Centralized error handling middleware
 */

/**
 * Error handler middleware
 * Handles all errors and returns appropriate JSON responses for API routes
 */
function errorHandler(err, req, res, next) {
  // Log error (but don't expose stack trace in production)
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error:', err);
  } else {
    console.error('Error:', err.message);
  }
  
  // Check if response was already sent
  if (res.headersSent) {
    return next(err);
  }
  
  // Determine status code
  let statusCode = err.statusCode || err.status || 500;
  
  // Determine error message
  let message = err.message || 'Internal server error';
  
  // For validation errors from express-validator
  if (err.type === 'validation') {
    statusCode = 400;
    message = err.message || 'Validation error';
  }
  
  // For API routes, always return JSON
  if (req.path && req.path.startsWith('/api/')) {
    return res.status(statusCode).json({
      error: message
    });
  }
  
  // For non-API routes, return HTML error page
  res.status(statusCode).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Error ${statusCode}</title>
      <meta charset="utf-8">
    </head>
    <body>
      <h1>Error ${statusCode}</h1>
      <p>${escapeHtml(message)}</p>
    </body>
    </html>
  `);
}

/**
 * Helper to escape HTML
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

/**
 * 404 Not Found handler
 */
function notFoundHandler(req, res, next) {
  const statusCode = 404;
  const message = 'Not found';
  
  if (req.path && req.path.startsWith('/api/')) {
    return res.status(statusCode).json({
      error: message
    });
  }
  
  res.status(statusCode).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>404 - Not Found</title>
      <meta charset="utf-8">
    </head>
    <body>
      <h1>404 - Not Found</h1>
    </body>
    </html>
  `);
}

module.exports = {
  errorHandler,
  notFoundHandler
};

