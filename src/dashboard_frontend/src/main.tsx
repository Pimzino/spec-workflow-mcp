import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './modules/app/App';
import './assets/fonts/fonts.css';
import './modules/theme/tailwind.css';
import './modules/theme/theme.css';
import './i18n';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <Suspense fallback="loading">
        <HashRouter>
          <App />
        </HashRouter>
      </Suspense>
    </React.StrictMode>
  );
}


