import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import NoteEditor from './components/NoteEditor';
import './App.css';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme) {
      setDarkMode(savedTheme === 'true');
    }
  }, []);

  useEffect(() => {
    document.body.className = darkMode ? 'dark-mode' : '';
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/" 
            element={<Dashboard darkMode={darkMode} setDarkMode={setDarkMode} />} 
          />
          <Route 
            path="/note/:id" 
            element={<NoteEditor darkMode={darkMode} setDarkMode={setDarkMode} />} 
          />
          <Route 
            path="/note/new" 
            element={<NoteEditor darkMode={darkMode} setDarkMode={setDarkMode} />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
