import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './globals.css';
import './i18n';

// Create root and render app
const container = document.getElementById('root');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <Suspense fallback="Loading...">
        <App />
      </Suspense>
    </React.StrictMode>
  );
  
  // Mark body as loaded to prevent FOUC
  document.body.classList.add('loaded');
}