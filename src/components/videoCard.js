import { formatDate, formatTime } from '../data/parser.js';

export function createVideoCard(video, options = {}) {
  const { showBadge = false, category = '', subject = '', linkPrefix = '' } = options;

  const card = document.createElement('a');
  card.href = linkPrefix
    ? `${linkPrefix}/${video.id}`
    : `#/video/${video.id}`;
  card.className = 'video-card';

  const thumbnailUrl = video.thumbnailLink || '';

  card.innerHTML = `
    <div class="video-card-thumbnail">
      ${thumbnailUrl
        ? `<img src="${thumbnailUrl}" alt="${video.title}" loading="lazy">`
        : `<div class="video-card-placeholder">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polygon points="10 8 16 12 10 16 10 8"></polygon>
            </svg>
          </div>`
      }
    </div>
    <div class="video-card-info">
      <h3 class="video-card-title">${video.title}</h3>
      <div class="video-card-meta">
        <span class="video-card-date">${formatDate(video.date)}</span>
        <span class="video-card-time">${formatTime(video.time)}</span>
      </div>
      ${showBadge && category && subject
        ? `<div class="video-card-badge">${category} &rsaquo; ${subject}</div>`
        : ''
      }
    </div>
  `;

  card.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.hash = card.getAttribute('href');
  });

  return card;
}
