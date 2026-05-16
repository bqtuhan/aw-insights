import React from 'react';
import ReactDOM from 'react-dom/client';
import '@/styles/globals.css';
import '@/i18n/config';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root not found in document');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);