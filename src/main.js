import { initAuth, isAuthenticated, onAuthChange, trySilentLogin } from './auth/google.js';
import { synchronize, isRootFolderConfigured } from './data/sync.js';
import { renderNav } from './components/nav.js';
import { renderLogin } from './views/login.js';
import { renderSetup } from './views/setup.js';
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
    currentNav = renderNav(showSetup);
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

  // If no root folder configured, show setup
  if (!isRootFolderConfigured()) {
    showSetup();
    return;
  }

  const hash = window.location.hash || '#/';
  const path = hash.slice(1); // remove #

  // Route: /setup
  if (path === '/setup') {
    showSetup();
    return;
  }

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

function showSetup() {
  const setupView = renderSetup(async (selectedFolder) => {
    // Folder selected — sync and go to home
    app.innerHTML = '<div class="loading"><p>Synchronisation en cours...</p></div>';
    try {
      await synchronize(true);
    } catch (err) {
      console.error('Sync after setup:', err);
    }
    window.location.hash = '#/';
    route();
  });
  renderApp(setupView, false);
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
      // If root folder is configured, sync immediately
      if (isRootFolderConfigured()) {
        app.innerHTML = '<div class="loading"><p>Connexion à Google Drive...</p></div>';
        try {
          await synchronize();
        } catch (err) {
          console.error('Sync error:', err);
        }
      }
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
  setTimeout(() => {
    if (!isAuthenticated()) {
      route();
    }
  }, 1500);

  // Hash-based routing
  window.addEventListener('hashchange', route);
}

init();
