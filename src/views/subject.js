import { getData } from '../data/sync.js';
import { createVideoCard } from '../components/videoCard.js';

export function renderSubject(categoryName, subjectName) {
  const container = document.createElement('div');
  container.className = 'subject-page';

  const data = getData();
  const category = data && data.categories ? data.categories[categoryName] : null;
  const subject = category && category.subjects ? category.subjects[subjectName] : null;

  const header = document.createElement('div');
  header.className = 'page-header';
  header.innerHTML = `
    <nav class="breadcrumb">
      <a href="#/">Accueil</a>
      <span class="breadcrumb-sep">&rsaquo;</span>
      <a href="#/categorie/${encodeURIComponent(categoryName)}">${categoryName}</a>
      <span class="breadcrumb-sep">&rsaquo;</span>
      <span>${subjectName}</span>
    </nav>
    <h1 class="page-title">${subjectName}</h1>
  `;
  container.appendChild(header);

  if (!subject || !subject.videos || subject.videos.length === 0) {
    container.innerHTML += `
      <div class="empty-state">
        <p>Aucune vidéo dans ce sujet.</p>
      </div>
    `;
    return container;
  }

  const count = document.createElement('p');
  count.className = 'video-count';
  count.textContent = `${subject.videos.length} vidéo${subject.videos.length > 1 ? 's' : ''}`;
  container.appendChild(count);

  const grid = document.createElement('div');
  grid.className = 'videos-grid';

  const linkPrefix = `#/categorie/${encodeURIComponent(categoryName)}/sujet/${encodeURIComponent(subjectName)}/video`;

  for (const video of subject.videos) {
    const card = createVideoCard(video, { linkPrefix });
    grid.appendChild(card);
  }

  container.appendChild(grid);

  return container;
}
