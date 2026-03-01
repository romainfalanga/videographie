import { searchFoldersByName, getFolderPath, validateFolderStructure } from '../api/drive.js';
import { setSavedRootFolder } from '../data/cache.js';
import { ROOT_FOLDER_NAME, VALID_CATEGORIES } from '../config.js';

export function renderSetup(onFolderSelected) {
  const container = document.createElement('div');
  container.className = 'setup-page';

  container.innerHTML = `
    <div class="setup-content">
      <h1 class="setup-title">Connecter ton dossier</h1>
      <p class="setup-subtitle">Vidéographie a besoin d'accéder à ton dossier de vidéos sur Google Drive.</p>

      <div class="setup-section">
        <div class="setup-search-area">
          <button class="setup-btn setup-btn--primary" id="setup-auto-search" type="button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            Rechercher « ${ROOT_FOLDER_NAME} » dans mon Drive
          </button>
        </div>

        <div id="setup-results" class="setup-results" style="display: none;"></div>
        <div id="setup-loading" class="setup-loading" style="display: none;">
          <p>Recherche en cours...</p>
        </div>
      </div>

      <div class="setup-divider">
        <span>ou</span>
      </div>

      <div class="setup-section">
        <p class="setup-label">Rechercher un dossier par nom</p>
        <div class="setup-manual-search">
          <input type="text" id="setup-search-input" class="setup-input" placeholder="Nom du dossier..." value="${ROOT_FOLDER_NAME}" />
          <button class="setup-btn setup-btn--secondary" id="setup-manual-search-btn" type="button">Chercher</button>
        </div>
      </div>

      <div class="setup-help">
        <p class="setup-help-title">Structure attendue du dossier</p>
        <div class="setup-folder-tree">
          <code>${ROOT_FOLDER_NAME}/</code>
          <code>├── matière/</code>
          <code>│   └── <em>tes sujets...</em></code>
          <code>├── mécanismes/</code>
          <code>│   └── <em>tes sujets...</em></code>
          <code>└── galaxies/</code>
          <code>    └── <em>tes sujets...</em></code>
        </div>
        <p class="setup-help-note">Chaque sujet est un sous-dossier contenant tes vidéos.</p>
      </div>
    </div>
  `;

  // Auto search button
  const autoSearchBtn = container.querySelector('#setup-auto-search');
  autoSearchBtn.addEventListener('click', () => {
    performSearch(container, ROOT_FOLDER_NAME, onFolderSelected);
  });

  // Manual search
  const manualSearchBtn = container.querySelector('#setup-manual-search-btn');
  const searchInput = container.querySelector('#setup-search-input');

  manualSearchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
      performSearch(container, query, onFolderSelected);
    }
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      if (query) {
        performSearch(container, query, onFolderSelected);
      }
    }
  });

  return container;
}

async function performSearch(container, query, onFolderSelected) {
  const resultsDiv = container.querySelector('#setup-results');
  const loadingDiv = container.querySelector('#setup-loading');

  resultsDiv.style.display = 'none';
  loadingDiv.style.display = 'block';

  try {
    const folders = await searchFoldersByName(query);

    if (folders.length === 0) {
      resultsDiv.innerHTML = `
        <div class="setup-no-results">
          <p>Aucun dossier « ${query} » trouvé dans ton Drive.</p>
          <p>Crée-le d'abord dans Google Drive, puis relance la recherche.</p>
        </div>
      `;
      resultsDiv.style.display = 'block';
      loadingDiv.style.display = 'none';
      return;
    }

    // Validate structure and get paths for each folder
    const candidates = [];
    for (const folder of folders) {
      const [structure, path] = await Promise.all([
        validateFolderStructure(folder.id, VALID_CATEGORIES),
        getFolderPath(folder.id),
      ]);
      candidates.push({
        ...folder,
        path,
        structure,
      });
    }

    // Sort: folders with more valid categories first
    candidates.sort((a, b) => b.structure.found.length - a.structure.found.length);

    resultsDiv.innerHTML = '';

    const title = document.createElement('p');
    title.className = 'setup-results-title';
    title.textContent = `${candidates.length} dossier${candidates.length > 1 ? 's' : ''} trouvé${candidates.length > 1 ? 's' : ''} :`;
    resultsDiv.appendChild(title);

    for (const candidate of candidates) {
      const card = createFolderCard(candidate, onFolderSelected);
      resultsDiv.appendChild(card);
    }

    resultsDiv.style.display = 'block';
  } catch (err) {
    resultsDiv.innerHTML = `
      <div class="setup-no-results">
        <p>Erreur lors de la recherche : ${err.message}</p>
      </div>
    `;
    resultsDiv.style.display = 'block';
  } finally {
    loadingDiv.style.display = 'none';
  }
}

function createFolderCard(candidate, onFolderSelected) {
  const card = document.createElement('div');
  card.className = 'setup-folder-card';

  const hasAll = candidate.structure.found.length === VALID_CATEGORIES.length;
  const hasSome = candidate.structure.found.length > 0;

  let statusHtml = '';
  if (hasAll) {
    statusHtml = `<span class="setup-status setup-status--valid">Structure complète</span>`;
  } else if (hasSome) {
    statusHtml = `<span class="setup-status setup-status--partial">Structure partielle</span>`;
  } else {
    statusHtml = `<span class="setup-status setup-status--empty">Aucune catégorie trouvée</span>`;
  }

  let categoriesHtml = '';
  for (const cat of VALID_CATEGORIES) {
    const found = candidate.structure.found.includes(cat);
    categoriesHtml += `
      <span class="setup-cat ${found ? 'setup-cat--found' : 'setup-cat--missing'}">
        ${found ? '&#10003;' : '&#10007;'} ${cat}
      </span>
    `;
  }

  card.innerHTML = `
    <div class="setup-folder-card-header">
      <div class="setup-folder-card-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
      </div>
      <div class="setup-folder-card-info">
        <p class="setup-folder-card-name">${candidate.name}</p>
        <p class="setup-folder-card-path">${candidate.path}</p>
      </div>
      ${statusHtml}
    </div>
    <div class="setup-folder-card-categories">
      ${categoriesHtml}
    </div>
    <button class="setup-btn setup-btn--select" type="button">
      Utiliser ce dossier
    </button>
  `;

  const selectBtn = card.querySelector('.setup-btn--select');
  selectBtn.addEventListener('click', () => {
    setSavedRootFolder({ id: candidate.id, name: candidate.name, path: candidate.path });
    if (onFolderSelected) onFolderSelected(candidate);
  });

  return card;
}
