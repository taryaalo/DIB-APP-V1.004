import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Generate a simple session id and store it in localStorage
const sidKey = 'sessionId';
let sessionId = localStorage.getItem(sidKey);
if (!sessionId) {
  sessionId = Math.random().toString(36).slice(2) + Date.now();
  localStorage.setItem(sidKey, sessionId);
}

// Wrap fetch to automatically send the session id header
const origFetch = window.fetch;
window.fetch = (url, options = {}) => {
  const opts = { ...options };
  opts.headers = { ...(opts.headers || {}), 'x-session-id': sessionId };
  return origFetch(url, opts);
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
