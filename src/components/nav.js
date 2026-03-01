import { getLastSync, clearCache, getSavedRootFolder, clearSavedRootFolder } from '../data/cache.js';
import { synchronize } from '../data/sync.js';
import { logout } from '../auth/google.js';

export function renderNav(onChangeFolder) {
  const nav = document.createElement('nav');
  nav.className = 'main-nav';

  const lastSync = getLastSync();
  const syncText = lastSync
    ? formatSyncDate(lastSync)
    : 'Jamais synchronisé';

  const savedFolder = getSavedRootFolder();
  const folderName = savedFolder ? savedFolder.name : '';

  nav.innerHTML = `
    <div class="nav-inner">
      <div class="nav-links">
        <a href="#/" class="nav-link nav-brand">Vidéographie</a>
        <a href="#/" class="nav-link">Accueil</a>
        <a href="#/chronologie" class="nav-link">Chronologie</a>
      </div>
      <div class="nav-actions">
        ${folderName ? `<button class="nav-folder-btn" title="Dossier connecté : ${folderName}. Cliquer pour changer.">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
          </svg>
          <span class="nav-folder-name">${folderName}</span>
        </button>` : ''}
        <span class="nav-sync-status">Sync : ${syncText}</span>
        <button class="nav-refresh-btn" title="Actualiser">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
        </button>
        <button class="nav-logout-btn" title="Se déconnecter">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>
    </div>
  `;

  // Navigation links
  nav.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href');
      window.location.hash = href;
    });
  });

  // Folder button — change folder
  const folderBtn = nav.querySelector('.nav-folder-btn');
  if (folderBtn) {
    folderBtn.addEventListener('click', () => {
      clearSavedRootFolder();
      if (onChangeFolder) {
        onChangeFolder();
      } else {
        window.location.hash = '#/setup';
        window.dispatchEvent(new Event('hashchange'));
      }
    });
  }

  // Refresh button
  const refreshBtn = nav.querySelector('.nav-refresh-btn');
  refreshBtn.addEventListener('click', async () => {
    refreshBtn.classList.add('spinning');
    try {
      await synchronize(true);
      const syncStatus = nav.querySelector('.nav-sync-status');
      syncStatus.textContent = `Sync : ${formatSyncDate(new Date().toISOString())}`;
      window.dispatchEvent(new Event('hashchange'));
    } catch (err) {
      console.error('Sync error:', err);
      window.dispatchEvent(new Event('hashchange'));
    } finally {
      refreshBtn.classList.remove('spinning');
    }
  });

  // Logout button
  const logoutBtn = nav.querySelector('.nav-logout-btn');
  logoutBtn.addEventListener('click', () => {
    clearSavedRootFolder();
    logout();
    window.location.hash = '';
  });

  return nav;
}

function formatSyncDate(isoStr) {
  const date = new Date(isoStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;

  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}h${minutes}`;
}
