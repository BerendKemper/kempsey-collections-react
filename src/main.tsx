import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './assets/index.css';
import './assets/theme-dark.css';
import './assets/theme-light.css';
import { Router } from './app/Router/Router.tsx';

createRoot(document.getElementById(`root`)!).render(
  <StrictMode>
    <Router />
  </StrictMode>
);
