import { getData, getCategoryStats, getSyncError } from '../data/sync.js';
import { createCategoryCard } from '../components/categoryCard.js';
import { VALID_CATEGORIES } from '../config.js';

export function renderHome() {
  const container = document.createElement('div');
  container.className = 'home-page';

  const data = getData();
  const syncError = getSyncError();

  const header = document.createElement('div');
  header.className = 'page-header';
  header.innerHTML = `<h1 class="page-title">Tes catégories</h1>`;
  container.appendChild(header);

  // Show error banner if sync failed
  if (syncError) {
    const errorBanner = document.createElement('div');
    errorBanner.className = 'sync-error-banner';

    if (syncError.includes('introuvable')) {
      errorBanner.innerHTML = `
        <div class="error-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            <line x1="12" y1="11" x2="12" y2="17"></line>
            <line x1="12" y1="11" x2="12" y2="11.01"></line>
          </svg>
        </div>
        <div class="error-content">
          <p class="error-title">Dossier « vidéographie » introuvable</p>
          <p class="error-description">Crée un dossier nommé <strong>vidéographie</strong> à la racine de ton Google Drive, puis crée trois sous-dossiers :</p>
          <div class="folder-structure">
            <code>vidéographie/</code>
            <code>├── matière/</code>
            <code>├── mécanisme/</code>
            <code>└── galaxie/</code>
          </div>
          <p class="error-description">Ensuite, clique sur « Actualiser » dans la barre de navigation.</p>
        </div>
      `;
    } else {
      errorBanner.innerHTML = `
        <div class="error-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <div class="error-content">
          <p class="error-title">Erreur de synchronisation</p>
          <p class="error-description">${syncError}</p>
          <p class="error-description">Clique sur « Actualiser » pour réessayer.</p>
        </div>
      `;
    }
    container.appendChild(errorBanner);
  }

  // Always show all 3 categories, even if empty
  const grid = document.createElement('div');
  grid.className = 'categories-grid';

  for (const categoryName of VALID_CATEGORIES) {
    const exists = data && data.categories && data.categories[categoryName];
    const stats = exists
      ? getCategoryStats(categoryName)
      : { subjectCount: 0, videoCount: 0 };
    const card = createCategoryCard(categoryName, stats, !exists);
    grid.appendChild(card);
  }

  container.appendChild(grid);

  // If no data at all and no error, show initial guidance
  if (!data && !syncError) {
    const guide = document.createElement('div');
    guide.className = 'empty-state';
    guide.innerHTML = `
      <p>Aucune donnée disponible. Clique sur « Actualiser » pour synchroniser ton Drive.</p>
    `;
    container.appendChild(guide);
  }

  return container;
}
