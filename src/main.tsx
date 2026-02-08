import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './assets/index.css';
import './assets/theme-dark.css';
import './assets/theme-light.css';
import { Router } from './app/Router/Router.tsx';

function initializeTheme() {
  try {
    const isDarkMode = localStorage.getItem(`dark-mode`) === `true`;
    document.documentElement.classList.toggle(`dark-mode`, isDarkMode);
  } catch {
    document.documentElement.classList.remove(`dark-mode`);
  }
}

initializeTheme();

createRoot(document.getElementById(`root`)!).render(
  <StrictMode>
    <Router />
  </StrictMode>
);
