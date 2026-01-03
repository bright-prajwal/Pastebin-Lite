/**
 * Paste controller - handles paste business logic
 */
const { createPaste, getPasteById, incrementViews } = require('../lib/db');
const { getCurrentDate } = require('../lib/time');

/**
 * Create a new paste
 */
async function createPasteHandler(req, res, next) {
  try {
    const { content, ttl_seconds, max_views } = req.body;
    const now = getCurrentDate(req);
    
    // Calculate expiration time
    let expiresAt = null;
    if (ttl_seconds) {
      expiresAt = new Date(now.getTime() + ttl_seconds * 1000);
    }
    
    // Create paste
    const id = await createPaste({
      content,
      expiresAt,
      maxViews: max_views || null
    });
    
    // Build URL
    const protocol = req.protocol || (req.headers['x-forwarded-proto'] || 'http');
    const host = req.get('host') || req.headers.host;
    const baseUrl = host ? `${protocol}://${host}` : `http://localhost:${process.env.PORT || 3000}`;
    const url = `${baseUrl}/p/${id}`;
    
    res.status(201).json({
      id,
      url
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get paste by ID (API endpoint)
 */
async function getPasteHandler(req, res, next) {
  try {
    const { id } = req.params;
    const now = getCurrentDate(req);
    
    // Get paste
    const paste = await getPasteById(id);
    
    if (!paste) {
      return res.status(404).json({ error: 'Paste not found' });
    }
    
    // Check expiration
    if (paste.expires_at) {
      const expiresAt = new Date(paste.expires_at);
      if (now >= expiresAt) {
        return res.status(404).json({ error: 'Paste expired' });
      }
    }
    
    // Check view limit (before incrementing)
    if (paste.max_views !== null && paste.max_views !== undefined) {
      if (paste.view_count >= paste.max_views) {
        return res.status(404).json({ error: 'Paste view limit exceeded' });
      }
    }
    
    // Increment view count atomically
    const newViewCount = await incrementViews(id);
    
    // Get updated paste to ensure consistency
    const updatedPaste = await getPasteById(id);
    
    // Calculate remaining views
    const remainingViews = updatedPaste.max_views !== null && updatedPaste.max_views !== undefined
      ? Math.max(0, updatedPaste.max_views - newViewCount)
      : null;
    
    res.status(200).json({
      content: updatedPaste.content,
      remaining_views: remainingViews,
      expires_at: updatedPaste.expires_at ? new Date(updatedPaste.expires_at).toISOString() : null
    });
  } catch (error) {
    next(error);
  }
}

/**
 * View paste (HTML endpoint)
 */
async function viewPasteHandler(req, res, next) {
  try {
    const { id } = req.params;
    const now = getCurrentDate(req);
    
    // Get paste
    const paste = await getPasteById(id);
    
    if (!paste) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Paste Not Found</title>
          <meta charset="utf-8">
        </head>
        <body>
          <h1>404 - Paste Not Found</h1>
        </body>
        </html>
      `);
    }
    
    // Check expiration
    if (paste.expires_at) {
      const expiresAt = new Date(paste.expires_at);
      if (now >= expiresAt) {
        return res.status(404).send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Paste Expired</title>
            <meta charset="utf-8">
          </head>
          <body>
            <h1>404 - Paste Expired</h1>
          </body>
          </html>
        `);
      }
    }
    
    // Check view limit (before incrementing)
    if (paste.max_views !== null && paste.max_views !== undefined) {
      if (paste.view_count >= paste.max_views) {
        return res.status(404).send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Paste Unavailable</title>
            <meta charset="utf-8">
          </head>
          <body>
            <h1>404 - Paste view limit exceeded</h1>
          </body>
          </html>
        `);
      }
    }
    
    // Increment view count
    await incrementViews(id);
    
    // Escape HTML to prevent XSS
    const escapeHtml = (text) => {
      const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      };
      return text.replace(/[&<>"']/g, m => map[m]);
    };
    
    const safeContent = escapeHtml(paste.content);
    
    // Render HTML template
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Paste - ${id.substring(0, 8)}</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
          }
          .container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          pre {
            background: #f8f8f8;
            padding: 15px;
            border-radius: 4px;
            overflow-x: auto;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
          .header {
            margin-bottom: 20px;
            color: #333;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 class="header">Paste Content</h1>
          <pre>${safeContent}</pre>
        </div>
      </body>
      </html>
    `;
    
    res.status(200).send(html);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createPasteHandler,
  getPasteHandler,
  viewPasteHandler
};

