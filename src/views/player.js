import { getData } from '../data/sync.js';
import { formatDate, formatTime } from '../data/parser.js';

export function renderPlayer(categoryName, subjectName, videoId) {
  const container = document.createElement('div');
  container.className = 'player-page';

  const data = getData();
  const category = data && data.categories ? data.categories[categoryName] : null;
  const subject = category && category.subjects ? category.subjects[subjectName] : null;

  if (!subject || !subject.videos) {
    container.innerHTML = `
      <div class="empty-state">
        <p>Vidéo introuvable.</p>
        <a href="#/" class="back-link">Retour à l'accueil</a>
      </div>
    `;
    return container;
  }

  const videoIndex = subject.videos.findIndex((v) => v.id === videoId);
  const video = videoIndex >= 0 ? subject.videos[videoIndex] : null;

  if (!video) {
    container.innerHTML = `
      <div class="empty-state">
        <p>Vidéo introuvable.</p>
        <a href="#/" class="back-link">Retour à l'accueil</a>
      </div>
    `;
    return container;
  }

  const prevVideo = videoIndex < subject.videos.length - 1 ? subject.videos[videoIndex + 1] : null;
  const nextVideo = videoIndex > 0 ? subject.videos[videoIndex - 1] : null;
  const basePath = `#/categorie/${encodeURIComponent(categoryName)}/sujet/${encodeURIComponent(subjectName)}/video`;

  container.innerHTML = `
    <div class="player-wrapper">
      <div class="player-embed">
        <iframe
          src="https://drive.google.com/file/d/${video.id}/preview"
          allow="autoplay; encrypted-media"
          allowfullscreen
          frameborder="0"
        ></iframe>
      </div>

      <div class="player-info">
        <h1 class="player-title">${video.title}</h1>
        <div class="player-meta">
          <span class="player-date">${formatDate(video.date)}</span>
          <span class="player-time">${formatTime(video.time)}</span>
        </div>
        <nav class="breadcrumb">
          <a href="#/">Accueil</a>
          <span class="breadcrumb-sep">&rsaquo;</span>
          <a href="#/categorie/${encodeURIComponent(categoryName)}">${categoryName}</a>
          <span class="breadcrumb-sep">&rsaquo;</span>
          <a href="#/categorie/${encodeURIComponent(categoryName)}/sujet/${encodeURIComponent(subjectName)}">${subjectName}</a>
        </nav>
      </div>

      <div class="player-nav">
        ${prevVideo
          ? `<a href="${basePath}/${prevVideo.id}" class="player-nav-btn player-nav-prev">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              <span>Précédente</span>
            </a>`
          : '<span></span>'
        }
        ${nextVideo
          ? `<a href="${basePath}/${nextVideo.id}" class="player-nav-btn player-nav-next">
              <span>Suivante</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </a>`
          : '<span></span>'
        }
      </div>
    </div>
  `;

  // Navigation links
  container.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.hash = link.getAttribute('href');
    });
  });

  return container;
}
