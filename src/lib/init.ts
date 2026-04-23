import { bootstrapApp } from './bootstrap';

function initOnDomReady() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapApp, { once: true });
    return;
  }

  bootstrapApp();
}

initOnDomReady();
