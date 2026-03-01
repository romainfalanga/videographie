import { getAllVideos } from '../data/sync.js';
import { createVideoCard } from '../components/videoCard.js';

export function renderTimeline() {
  const container = document.createElement('div');
  container.className = 'timeline-page';

  const header = document.createElement('div');
  header.className = 'page-header';
  header.innerHTML = `
    <nav class="breadcrumb">
      <a href="#/">Accueil</a>
      <span class="breadcrumb-sep">&rsaquo;</span>
      <span>Chronologie</span>
    </nav>
    <h1 class="page-title">Chronologie</h1>
  `;
  container.appendChild(header);

  const allVideos = getAllVideos();

  if (allVideos.length === 0) {
    container.innerHTML += `
      <div class="empty-state">
        <p>Aucune vidéo trouvée. Synchronise d'abord ton Drive.</p>
      </div>
    `;
    return container;
  }

  const count = document.createElement('p');
  count.className = 'video-count';
  count.textContent = `${allVideos.length} vidéo${allVideos.length > 1 ? 's' : ''} au total`;
  container.appendChild(count);

  const grid = document.createElement('div');
  grid.className = 'videos-grid';

  for (const video of allVideos) {
    const card = createVideoCard(video, {
      showBadge: true,
      category: video.category,
      subject: video.subject,
      linkPrefix: `#/categorie/${encodeURIComponent(video.category)}/sujet/${encodeURIComponent(video.subject)}/video`,
    });
    grid.appendChild(card);
  }

  container.appendChild(grid);

  return container;
}
