const express = require('express');
const pool = require('../config/database');

const router = express.Router();

// Get all notes
router.get('/', async (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  console.log(`📋 GET /api/notes - Fetching notes (search: "${search || 'none'}", page: ${page})`);

  try {
    let query = 'SELECT id, title, content, tags, created_at, updated_at FROM notes';
    let params = [];

    if (search) {
      query += ' WHERE (title ILIKE $1 OR content ILIKE $1)';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY updated_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const result = await pool.query(query, params);

    const countResult = await pool.query('SELECT COUNT(*) FROM notes');

    console.log(`✅ Found ${result.rows.length} notes (total: ${countResult.rows[0].count})`);

    res.json({
      notes: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(countResult.rows[0].count / limit)
    });
  } catch (error) {
    console.error('❌ Error fetching all notes:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Get single note
router.get('/:id', async (req, res) => {
  console.log(`📄 GET /api/notes/${req.params.id} - Fetching single note`);

  try {
    const result = await pool.query(
      'SELECT * FROM notes WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      console.log(`❌ Note ${req.params.id} not found`);
      return res.status(404).json({ error: 'Note not found' });
    }

    console.log(`✅ Note ${req.params.id} retrieved: "${result.rows[0].title}"`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error fetching single note:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Create note
router.post('/', async (req, res) => {
  const { title, content, tags } = req.body;

  console.log(`➕ POST /api/notes - Creating new note: "${title}"`);

  try {
    const result = await pool.query(
      'INSERT INTO notes (title, content, tags) VALUES ($1, $2, $3) RETURNING *',
      [title, content, tags || '']
    );

    // Create initial version
    await pool.query(
      'INSERT INTO note_versions (note_id, title, content, version_number) VALUES ($1, $2, $3, $4)',
      [result.rows[0].id, title, content, 1]
    );

    console.log(`✅ Note created with ID: ${result.rows[0].id}`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error creating note:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Update note
router.put('/:id', async (req, res) => {
  const { title, content, tags } = req.body;

  console.log(`✏️ PUT /api/notes/${req.params.id} - Updating note: "${title}"`);

  try {
    // Get current version number
    const versionResult = await pool.query(
      'SELECT MAX(version_number) as max_version FROM note_versions WHERE note_id = $1',
      [req.params.id]
    );
    const nextVersion = (versionResult.rows[0].max_version || 0) + 1;

    // Update note
    const result = await pool.query(
      'UPDATE notes SET title = $1, content = $2, tags = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [title, content, tags || '', req.params.id]
    );

    if (result.rows.length === 0) {
      console.log(`❌ Note ${req.params.id} not found for update`);
      return res.status(404).json({ error: 'Note not found' });
    }

    // Save version
    await pool.query(
      'INSERT INTO note_versions (note_id, title, content, version_number) VALUES ($1, $2, $3, $4)',
      [req.params.id, title, content, nextVersion]
    );

    console.log(`✅ Note ${req.params.id} updated (version ${nextVersion})`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error updating note:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Delete note
router.delete('/:id', async (req, res) => {
  console.log(`🗑️ DELETE /api/notes/${req.params.id} - Deleting note`);

  try {
    const result = await pool.query(
      'DELETE FROM notes WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      console.log(`❌ Note ${req.params.id} not found for deletion`);
      return res.status(404).json({ error: 'Note not found' });
    }

    console.log(`✅ Note ${req.params.id} deleted successfully`);
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting note:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Get note versions
router.get('/:id/versions', async (req, res) => {
  console.log(`📚 GET /api/notes/${req.params.id}/versions - Fetching version history`);

  try {
    const result = await pool.query(
      'SELECT * FROM note_versions WHERE note_id = $1 ORDER BY version_number DESC',
      [req.params.id]
    );

    console.log(`✅ Found ${result.rows.length} versions for note ${req.params.id}`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching versions:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

module.exports = router;
