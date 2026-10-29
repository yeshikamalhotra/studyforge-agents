// Ensure window.fetch has a setter so testing/browser environments don't error on window.fetch assignment
try {
  if (typeof window !== 'undefined') {
    const origFetch = window.fetch ? window.fetch.bind(window) : undefined;
    let _fetch = origFetch;
    Object.defineProperty(window, 'fetch', {
      configurable: true,
      enumerable: true,
      get() {
        return _fetch;
      },
      set(val) {
        _fetch = val;
      },
    });
  }
} catch {
  // Ignore
}

import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
