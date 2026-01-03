
const { v4: uuidv4 } = require('uuid');

let dbClient = null;
let dbType = process.env.DB_TYPE || 'mysql';

async function initDatabase() {
  try {
    if (dbType === 'mysql') {
      const mysql = require('mysql2/promise');
      
      let connectionConfig;
      
      if (process.env.DATABASE_URL) {
        const url = new URL(process.env.DATABASE_URL);
        connectionConfig = {
          host: url.hostname,
          port: parseInt(url.port) || 3306,
          user: url.username,
          password: url.password,
          database: url.pathname.slice(1), 
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0
        };
      } else {
        connectionConfig = {
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT) || 3306,
          user: process.env.DB_USER || 'root',
          password: process.env.DB_PASSWORD || '',
          database: process.env.DB_NAME || 'pastebin',
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0
        };
      }
      
      dbClient = mysql.createPool(connectionConfig);
      
      await dbClient.query('SELECT 1');
      
      await dbClient.query(`
        CREATE TABLE IF NOT EXISTS pastes (
          id VARCHAR(36) PRIMARY KEY,
          content TEXT NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP NULL,
          max_views INT NULL,
          view_count INT NOT NULL DEFAULT 0,
          INDEX idx_expires_at (expires_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      
      console.log('MySQL database initialized successfully');
    } else {
      throw new Error(`Unsupported DB_TYPE: ${dbType}. Use 'mysql'`);
    }
    
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    return false;
  }
}

/**
 * Create a new paste
 * @param {Object} data - Paste data
 * @param {string} data.content - Paste content
 * @param {Date} data.expiresAt - Expiration date (optional)
 * @param {number} data.maxViews - Maximum views (optional)
 * @returns {Promise<string>} Paste ID
 */
async function createPaste(data) {
  const id = uuidv4();
  const now = new Date();
  const expiresAt = data.expiresAt ? data.expiresAt.toISOString().slice(0, 19).replace('T', ' ') : null;
  const maxViews = data.maxViews || null;
  
  await dbClient.query(
    'INSERT INTO pastes (id, content, created_at, expires_at, max_views, view_count) VALUES (?, ?, ?, ?, ?, 0)',
    [id, data.content, now, expiresAt, maxViews]
  );
  
  return id;
}

/**
 * Get paste by ID
 * @param {string} id - Paste ID
 * @returns {Promise<Object|null>} Paste object or null if not found
 */
async function getPasteById(id) {
  const [rows] = await dbClient.query('SELECT * FROM pastes WHERE id = ?', [id]);
  
  if (rows.length === 0) {
    return null;
  }
  
  const row = rows[0];
  return {
    id: row.id,
    content: row.content,
    created_at: row.created_at,
    expires_at: row.expires_at ? new Date(row.expires_at).toISOString() : null,
    max_views: row.max_views,
    view_count: row.view_count
  };
}

/**
 * Increment view count atomically
 * Uses MySQL's atomic UPDATE to ensure no race conditions
 * @param {string} id - Paste ID
 * @returns {Promise<number>} New view count
 */
async function incrementViews(id) {

  try {
    const [result] = await dbClient.query(
      'UPDATE pastes SET view_count = view_count + 1 WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      throw new Error('Paste not found');
    }
        const [rows] = await dbClient.query('SELECT view_count FROM pastes WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      throw new Error('Paste not found');
    }
    
    return rows[0].view_count;
  } catch (error) {
    if (error.message === 'Paste not found') {
      throw error;
    }
    const connection = await dbClient.getConnection();
    try {
      await connection.beginTransaction();
      
      const [rows] = await connection.query('SELECT view_count FROM pastes WHERE id = ? FOR UPDATE', [id]);
      
      if (rows.length === 0) {
        await connection.rollback();
        throw new Error('Paste not found');
      }
      
      const newViewCount = (rows[0].view_count || 0) + 1;
      await connection.query('UPDATE pastes SET view_count = ? WHERE id = ?', [newViewCount, id]);
      
      await connection.commit();
      return newViewCount;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }
}

/**
 * Expire a paste (mark as unavailable)
 * @param {string} id - Paste ID
 */
async function expirePaste(id) {
  await dbClient.query('DELETE FROM pastes WHERE id = ?', [id]);
}

/**
 * Health check - verify database connectivity
 * @returns {Promise<boolean>} True if database is accessible
 */
async function healthCheck() {
  try {
    await dbClient.query('SELECT 1');
    return true;
  } catch (error) {
    return false;
  }
}

// Initialize database on module load
if (!dbClient) {
  initDatabase().catch(err => {
    console.error('Failed to initialize database:', err);
  });
}

module.exports = {
  initDatabase,
  createPaste,
  getPasteById,
  incrementViews,
  expirePaste,
  healthCheck
};
