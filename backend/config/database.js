const { Pool } = require('pg');
require('dotenv').config();

// Support both DATABASE_URL (Render) and individual connection params (local)
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false // Required for Render
        }
      }
    : {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      }
);

// Auto-create tables on startup
const initDatabase = async () => {
  try {
    console.log('🔄 Checking database tables...');

    // Create notes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        tags VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_notes_title ON notes(title);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_notes_content ON notes USING gin(to_tsvector('english', content));
    `);

    // Create note_versions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS note_versions (
        id SERIAL PRIMARY KEY,
        note_id INTEGER REFERENCES notes(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        version_number INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Database tables ready');
    console.log('✅ Connected to PostgreSQL database');
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
  }
};

// Initialize database
initDatabase();

module.exports = pool;
