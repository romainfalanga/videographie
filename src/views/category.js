import { getData } from '../data/sync.js';
import { createSubjectCard } from '../components/subjectCard.js';

export function renderCategory(categoryName) {
  const container = document.createElement('div');
  container.className = 'category-page';

  const data = getData();
  const category = data && data.categories ? data.categories[categoryName] : null;

  const header = document.createElement('div');
  header.className = 'page-header';
  header.innerHTML = `
    <nav class="breadcrumb">
      <a href="#/">Accueil</a>
      <span class="breadcrumb-sep">&rsaquo;</span>
      <span>${categoryName}</span>
    </nav>
    <h1 class="page-title">${categoryName}</h1>
  `;
  container.appendChild(header);

  if (!category || !category.subjects) {
    container.innerHTML += `
      <div class="empty-state">
        <p>Aucun sujet trouvé dans cette catégorie.</p>
      </div>
    `;
    return container;
  }

  const grid = document.createElement('div');
  grid.className = 'subjects-grid';

  const sortedSubjects = Object.entries(category.subjects).sort(([a], [b]) =>
    a.localeCompare(b, 'fr')
  );

  for (const [subjectName, subject] of sortedSubjects) {
    const card = createSubjectCard(categoryName, subjectName, subject);
    grid.appendChild(card);
  }

  if (grid.children.length === 0) {
    container.innerHTML += `
      <div class="empty-state">
        <p>Aucun sujet dans « ${categoryName} ».</p>
      </div>
    `;
  } else {
    container.appendChild(grid);
  }

  return container;
}
