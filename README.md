# 📝 Markdown Notes Application

A full-stack notes application with Markdown editing, real-time split-screen preview, and complete CRUD operations.

## 🚀 Features

### Core Features
- ✅ Create, Read, Update, Delete notes
- ✅ Markdown editor with live preview
- ✅ Split-screen interface (editor + preview)
- ✅ Persistent PostgreSQL database
- ✅ Support for headings, bold, italic, lists, code blocks, links

### Bonus Features
- ✅ Search functionality across notes
- ✅ Tags/categories for organization
- ✅ Dark mode toggle
- ✅ Responsive design (mobile + desktop)
- ✅ Debounced auto-save (saves 2s after typing stops)
- ✅ Version history with restore capability
- ✅ Pagination for notes list

## 🛠 Tech Stack

- **Frontend**: React.js, React Router, Axios, Marked.js
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL

- **Styling**: CSS3 with CSS Variables

## 📋 Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd markdown-notes-app
```

### 2. Database Setup

#### Option A: Using Render PostgreSQL (Recommended for Deployment)

Follow the detailed guide in **[RENDER_SETUP.md](./RENDER_SETUP.md)** to:
1. Create a PostgreSQL database on Render
2. Get your DATABASE_URL
3. Set up your `.env` file
4. Initialize the database tables

**Quick version:**
1. Create database on [Render](https://dashboard.render.com/)
2. Copy the "External Database URL"
3. Create `backend/.env`:
   ```env
   PORT=5000
   DATABASE_URL=postgresql://user:pass@host.render.com:5432/dbname
   ```
4. Run schema using Render's PSQL Console (copy/paste `backend/config/schema.sql`)

#### Option B: Using Local PostgreSQL

Create a PostgreSQL database locally:

```bash
psql -U postgres
CREATE DATABASE markdown_notes;
\q
```

Run the schema to create tables:

```bash
psql -U postgres -d markdown_notes -f backend/config/schema.sql
```

Or if using Render, use the PSQL Console in the Render dashboard.

### 3. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in the backend directory:

**For Render PostgreSQL:**
```env
PORT=5000
DATABASE_URL=postgresql://user:pass@host.render.com:5432/dbname
```

**For Local PostgreSQL:**
```env
PORT=5000
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/markdown_notes
```

Note: The app uses DATABASE_URL for connection. See [RENDER_SETUP.md](./RENDER_SETUP.md) for detailed instructions.

Start the backend server:

```bash
npm start
# or for development with auto-reload
npm run dev
```

### 4. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the frontend development server:

```bash
npm start
```

The application will open at `http://localhost:3000`

## 🎯 Usage

1. **Create Note**: Click "New Note" button
3. **Edit Note**: Type in the left panel (Markdown editor)
4. **Preview**: See live rendered output in the right panel
5. **Save**: Auto-saves after 2 seconds or click "Save" button
6. **Search**: Use the search bar to find notes by title or content
7. **Tags**: Add comma-separated tags to organize notes
8. **Version History**: Click "Versions" to view and restore previous versions
9. **Dark Mode**: Toggle theme with the moon/sun icon

## 📁 Project Structure

```
markdown-notes-app/
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.js
│   │   │   ├── NoteEditor.js
│   │   │   ├── Dashboard.css
│   │   │   └── NoteEditor.css
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── .env
├── backend/
│   ├── config/
│   │   ├── database.js
│   │   └── schema.sql
│   ├── routes/
│   │   └── notes.js
│   ├── server.js
│   ├── package.json
│   └── .env
└── README.md
```

## 🔌 API Endpoints

### Notes
- `GET /api/notes` - Get all notes (with search & pagination)
- `GET /api/notes/:id` - Get single note
- `POST /api/notes` - Create new note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `GET /api/notes/:id/versions` - Get note version history

## 🎨 Markdown Support

The editor supports:
- Headings (`#`, `##`, `###`)
- Bold (`**text**`)
- Italic (`*text*`)
- Ordered lists (`1. item`)
- Unordered lists (`- item`)
- Inline code (`` `code` ``)
- Code blocks (` ``` `)
- Links (`[text](url)`)
- Blockquotes (`> quote`)

## 🚀 Deployment

### Backend (Render/Railway)
1. Push code to GitHub
2. Connect repository to Render/Railway
3. Set environment variables
4. Deploy

### Frontend (Vercel)
1. Push code to GitHub
2. Import project to Vercel
3. Set `REACT_APP_API_URL` to your backend URL
4. Deploy

## 🧪 Testing

Test the application:
1. Create multiple notes with different content
2. Test search functionality
3. Edit notes and verify auto-save
4. Check version history
5. Test dark mode toggle
6. Verify responsive design on mobile

## 🤔 Design Decisions

1. **Debounced Auto-Save**: Saves after 2 seconds of inactivity to reduce API calls
2. **Version History**: Tracks all changes for easy rollback
3. **Split-Screen**: Real-time preview improves user experience
4. **PostgreSQL**: Reliable, scalable database with full-text search
5. **CSS Variables**: Easy theme switching (dark/light mode)
6. **No Authentication**: Simplified for demo purposes - all notes are public

## 📝 License

MIT

## 👤 Author

[Your Name]

---

Built with ❤️ for the SDE Fresher Assignment
