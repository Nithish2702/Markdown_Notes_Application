const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function setupDatabase() {
  console.log('🔄 Connecting to database...');
  
  try {
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
    console.log('✅ Notes table created');

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_notes_title ON notes(title);
    `);
    console.log('✅ Title index created');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_notes_content ON notes USING gin(to_tsvector('english', content));
    `);
    console.log('✅ Content index created');

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
    console.log('✅ Note versions table created');

    // Verify tables exist
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('\n📋 Tables in database:');
    result.rows.forEach(row => {
      console.log('  -', row.table_name);
    });

    console.log('\n🎉 Database setup complete!');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
  } finally {
    await pool.end();
  }
}

setupDatabase();
