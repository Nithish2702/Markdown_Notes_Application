import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Dashboard({ darkMode, setDarkMode }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async (search = '') => {
    try {
      const response = await axios.get(`${API_URL}/notes`, {
        params: { search }
      });
      setNotes(response.data.notes);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    fetchNotes(query);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      await axios.delete(`${API_URL}/notes/${id}`);
      setNotes(notes.filter(note => note.id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Strip markdown symbols for preview
  const stripMarkdown = (text) => {
    return text
      .replace(/#{1,6}\s/g, '') // Remove headings
      .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.+?)\*/g, '$1') // Remove italic
      .replace(/`(.+?)`/g, '$1') // Remove inline code
      .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links, keep text
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/^[-*+]\s/gm, '') // Remove list markers
      .replace(/^\d+\.\s/gm, '') // Remove ordered list numbers
      .trim();
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>📝 Markdown Notes</h1>
        </div>
        <div className="header-right">
          <button 
            className="btn-secondary theme-toggle" 
            onClick={() => setDarkMode(!darkMode)}
            title="Toggle theme"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button className="btn-primary" onClick={() => navigate('/note/new')}>
            + New Note
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Search notes..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        {loading ? (
          <div className="loading">Loading notes...</div>
        ) : notes.length === 0 ? (
          <div className="empty-state">
            <p>No notes yet. Create your first note!</p>
          </div>
        ) : (
          <div className="notes-grid">
            {notes.map(note => (
              <div key={note.id} className="note-card">
                <div className="note-header">
                  <h3 onClick={() => navigate(`/note/${note.id}`)}>{note.title || 'Untitled'}</h3>
                  {note.tags && (
                    <div className="note-tags">
                      {note.tags.split(',').map((tag, idx) => (
                        <span key={idx} className="tag">{tag.trim()}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="note-footer">
                  <span className="note-date">{formatDate(note.updated_at)}</span>
                  <div className="note-actions">
                    <button 
                      className="btn-secondary btn-sm" 
                      onClick={() => navigate(`/note/${note.id}`)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-danger btn-sm" 
                      onClick={() => handleDelete(note.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
