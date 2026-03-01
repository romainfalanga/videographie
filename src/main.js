import { initAuth, isAuthenticated, onAuthChange, trySilentLogin } from './auth/google.js';
import { synchronize } from './data/sync.js';
import { renderNav } from './components/nav.js';
import { renderLogin } from './views/login.js';
import { renderHome } from './views/home.js';
import { renderCategory } from './views/category.js';
import { renderSubject } from './views/subject.js';
import { renderPlayer } from './views/player.js';
import { renderTimeline } from './views/timeline.js';
import './styles/main.css';

const app = document.getElementById('app');

let currentNav = null;

function renderApp(content, showNav = true) {
  app.innerHTML = '';

  if (showNav) {
    if (!currentNav) {
      currentNav = renderNav();
    }
    app.appendChild(currentNav);

    const main = document.createElement('main');
    main.className = 'main-content';
    main.appendChild(content);
    app.appendChild(main);
  } else {
    app.appendChild(content);
  }
}

function route() {
  if (!isAuthenticated()) {
    renderApp(renderLogin(), false);
    return;
  }

  const hash = window.location.hash || '#/';
  const path = hash.slice(1); // remove #

  // Route: /
  if (path === '/' || path === '') {
    renderApp(renderHome());
    return;
  }

  // Route: /chronologie
  if (path === '/chronologie') {
    renderApp(renderTimeline());
    return;
  }

  // Route: /categorie/:name/sujet/:subject/video/:id
  const videoMatch = path.match(
    /^\/categorie\/([^/]+)\/sujet\/([^/]+)\/video\/(.+)$/
  );
  if (videoMatch) {
    const categoryName = decodeURIComponent(videoMatch[1]);
    const subjectName = decodeURIComponent(videoMatch[2]);
    const videoId = decodeURIComponent(videoMatch[3]);
    renderApp(renderPlayer(categoryName, subjectName, videoId));
    return;
  }

  // Route: /categorie/:name/sujet/:subject
  const subjectMatch = path.match(/^\/categorie\/([^/]+)\/sujet\/([^/]+)$/);
  if (subjectMatch) {
    const categoryName = decodeURIComponent(subjectMatch[1]);
    const subjectName = decodeURIComponent(subjectMatch[2]);
    renderApp(renderSubject(categoryName, subjectName));
    return;
  }

  // Route: /categorie/:name
  const categoryMatch = path.match(/^\/categorie\/([^/]+)$/);
  if (categoryMatch) {
    const categoryName = decodeURIComponent(categoryMatch[1]);
    renderApp(renderCategory(categoryName));
    return;
  }

  // Fallback
  renderApp(renderHome());
}

// Exported for use by other modules
export function navigate(hash) {
  window.location.hash = hash;
}

async function init() {
  // Show loading
  app.innerHTML = '<div class="loading"><p>Chargement...</p></div>';

  await initAuth();

  onAuthChange(async (authenticated) => {
    if (authenticated) {
      app.innerHTML = '<div class="loading"><p>Connexion à Google Drive...</p></div>';
      try {
        await synchronize();
      } catch (err) {
        console.error('Sync error:', err);
        // Continue to render even if sync fails — the views will show the error
      }
      currentNav = null; // Force nav refresh
      route();
    } else {
      currentNav = null;
      window.location.hash = '';
      route();
    }
  });

  // Try silent login first
  trySilentLogin();

  // If not authenticated after a short delay, show login page
  // This covers the case where silent login fails silently
  setTimeout(() => {
    if (!isAuthenticated()) {
      route();
    }
  }, 1500);

  // Hash-based routing
  window.addEventListener('hashchange', route);
}

init();
