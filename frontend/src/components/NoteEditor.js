import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { marked } from 'marked';
import axios from 'axios';
import './NoteEditor.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Configure marked for security
marked.setOptions({
  breaks: true,
  gfm: true
});

function NoteEditor({ darkMode, setDarkMode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState({ title: '', content: '', tags: '' });
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [versions, setVersions] = useState([]);
  const [showVersions, setShowVersions] = useState(false);

  useEffect(() => {
    if (id && id !== 'new') {
      fetchNote();
      fetchVersions();
    }
  }, [id]);

  // Debounced auto-save
  useEffect(() => {
    if (id && id !== 'new' && note.title && note.content) {
      const timer = setTimeout(() => {
        handleSave(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [note.title, note.content, note.tags]);

  const fetchNote = async () => {
    try {
      const response = await axios.get(`${API_URL}/notes/${id}`);
      setNote(response.data);
    } catch (error) {
      console.error('Error fetching note:', error);
    }
  };

  const fetchVersions = async () => {
    try {
      const response = await axios.get(`${API_URL}/notes/${id}/versions`);
      setVersions(response.data);
    } catch (error) {
      console.error('Error fetching versions:', error);
    }
  };

  const handleSave = async (isAutoSave = false) => {
    if (!note.title.trim() || !note.content.trim()) {
      setSaveStatus('Title and content are required');
      return;
    }

    setSaving(true);
    setSaveStatus(isAutoSave ? 'Auto-saving...' : 'Saving...');

    try {
      if (id && id !== 'new') {
        await axios.put(`${API_URL}/notes/${id}`, note);
        setSaveStatus('Saved ✓');
        if (!isAutoSave) {
          fetchVersions();
        }
      } else {
        const response = await axios.post(`${API_URL}/notes`, note);
        setSaveStatus('Created ✓');
        navigate(`/note/${response.data.id}`);
      }
    } catch (error) {
      setSaveStatus('Error saving note');
      console.error('Error saving note:', error);
    } finally {
      setSaving(false);
      setTimeout(() => setSaveStatus(''), 2000);
    }
  };

  const restoreVersion = async (version) => {
    if (window.confirm(`Restore version ${version.version_number}?`)) {
      setNote({ ...note, title: version.title, content: version.content });
      setShowVersions(false);
    }
  };

  const renderMarkdown = () => {
    return { __html: marked(note.content || '') };
  };

  return (
    <div className="note-editor">
      <header className="editor-header">
        <button className="btn-secondary" onClick={() => navigate('/')}>
          ← Back
        </button>
        <div className="header-actions">
          {saveStatus && <span className="save-status">{saveStatus}</span>}
          {id && id !== 'new' && (
            <button 
              className="btn-secondary" 
              onClick={() => setShowVersions(!showVersions)}
            >
              📜 Versions ({versions.length})
            </button>
          )}
          <button 
            className="btn-secondary" 
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button 
            className="btn-primary" 
            onClick={() => handleSave(false)}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </header>

      {showVersions && (
        <div className="versions-panel">
          <h3>Version History</h3>
          <div className="versions-list">
            {versions.map(version => (
              <div key={version.id} className="version-item">
                <div className="version-info">
                  <strong>Version {version.version_number}</strong>
                  <span>{new Date(version.created_at).toLocaleString()}</span>
                </div>
                <button 
                  className="btn-secondary btn-sm" 
                  onClick={() => restoreVersion(version)}
                >
                  Restore
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="editor-inputs">
        <input
          type="text"
          placeholder="Note Title"
          value={note.title}
          onChange={(e) => setNote({ ...note, title: e.target.value })}
          className="title-input"
        />
        <input
          type="text"
          placeholder="Tags (comma-separated)"
          value={note.tags}
          onChange={(e) => setNote({ ...note, tags: e.target.value })}
          className="tags-input"
        />
      </div>

      <div className="editor-container">
        <div className="editor-pane">
          <div className="pane-header">Markdown Editor</div>
          <textarea
            value={note.content}
            onChange={(e) => setNote({ ...note, content: e.target.value })}
            placeholder="Start writing in Markdown...

# Heading 1
## Heading 2

**Bold text** and *italic text*

- Bullet point
- Another point

1. Numbered list
2. Second item

`inline code`

```
code block
```

[Link text](https://example.com)"
          />
        </div>

        <div className="preview-pane">
          <div className="pane-header">Live Preview</div>
          <div 
            className="markdown-preview" 
            dangerouslySetInnerHTML={renderMarkdown()}
          />
        </div>
      </div>
    </div>
  );
}

export default NoteEditor;
