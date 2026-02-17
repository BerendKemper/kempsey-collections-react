import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './assets/index.css';
import './assets/theme-dark.css';
import './assets/theme-light.css';
import { Router } from './app/Router/Router.tsx';

function installDevWriteBlock(): void {
  if (!import.meta.env.DEV) return;

  const originalFetch = window.fetch.bind(window);
  const blockedApiHosts = new Set([`api.emperjs.com`]);
  const blockedMethods = new Set([`POST`, `PUT`, `PATCH`, `DELETE`]);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const method = (init?.method ?? `GET`).toUpperCase();
    const inputUrl = typeof input === `string`
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url;
    const url = new URL(inputUrl, window.location.origin);

    if (blockedApiHosts.has(url.hostname) && blockedMethods.has(method)) {
      throw new Error(`[DEV BLOCK] ${method} ${url.href} blocked`);
    }

    return originalFetch(input, init);
  };
}

function initializeTheme() {
  try {
    const isDarkMode = localStorage.getItem(`dark-mode`) === `true`;
    document.documentElement.classList.toggle(`dark-mode`, isDarkMode);
  } catch {
    document.documentElement.classList.remove(`dark-mode`);
  }
}

initializeTheme();
installDevWriteBlock();

createRoot(document.getElementById(`root`)!).render(
  <StrictMode>
    <Router />
  </StrictMode>
);
