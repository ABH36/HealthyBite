import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// 📱 FIX 1: Prevent Weird Zoom Glitches (Native Feel)
document.addEventListener('touchmove', e => {
  if (e.scale !== 1) e.preventDefault();
}, { passive: false });

// 📱 FIX 4: Pull-to-Refresh Logic (Native Feel)
let startY = 0;
window.addEventListener('touchstart', e => {
    startY = e.touches[0].clientY;
}, { passive: true });

window.addEventListener('touchend', e => {
    const endY = e.changedTouches[0].clientY;
    // Only refresh if at top of page and pulled down significantly
    if (window.scrollY === 0 && endY - startY > 150) {
        // Simple vibration feedback before reload
        if (navigator.vibrate) navigator.vibrate(20);
        window.location.reload();
    }
}, { passive: true });

// 📱 FIX 8: Prevent Accidental Exit (Swipe Back)
// Note: Modern browsers restrict this, but helps in some PWA containers
window.onbeforeunload = () => ""; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);