// src/index.js
// React app ka starting point - DOM mein App component render karta hai

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// React 18 ka new way - createRoot use karo
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
