import { getData, getCategoryStats } from '../data/sync.js';
import { createCategoryCard } from '../components/categoryCard.js';
import { VALID_CATEGORIES } from '../config.js';

export function renderHome() {
  const container = document.createElement('div');
  container.className = 'home-page';

  const data = getData();

  const header = document.createElement('div');
  header.className = 'page-header';
  header.innerHTML = `<h1 class="page-title">Tes catégories</h1>`;
  container.appendChild(header);

  if (!data || !data.categories) {
    container.innerHTML += `
      <div class="empty-state">
        <p>Aucune donnée disponible. Clique sur « Actualiser » pour synchroniser ton Drive.</p>
      </div>
    `;
    return container;
  }

  const grid = document.createElement('div');
  grid.className = 'categories-grid';

  for (const categoryName of VALID_CATEGORIES) {
    if (data.categories[categoryName]) {
      const stats = getCategoryStats(categoryName);
      const card = createCategoryCard(categoryName, stats);
      grid.appendChild(card);
    }
  }

  if (grid.children.length === 0) {
    container.innerHTML += `
      <div class="empty-state">
        <p>Aucune catégorie trouvée. Vérifie que ton dossier « vidéographie » contient les sous-dossiers : matière, mécanisme, galaxie.</p>
      </div>
    `;
  } else {
    container.appendChild(grid);
  }

  return container;
}
