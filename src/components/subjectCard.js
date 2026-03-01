export function createSubjectCard(categoryName, subjectName, subject) {
  const card = document.createElement('a');
  card.href = `#/categorie/${encodeURIComponent(categoryName)}/sujet/${encodeURIComponent(subjectName)}`;
  card.className = 'subject-card';

  const videoCount = subject.videos.length;
  const latestVideo = subject.videos[0];
  const thumbnailUrl = latestVideo && latestVideo.thumbnailLink
    ? latestVideo.thumbnailLink
    : '';

  card.innerHTML = `
    <div class="subject-card-thumbnail">
      ${thumbnailUrl
        ? `<img src="${thumbnailUrl}" alt="${subjectName}" loading="lazy">`
        : `<div class="subject-card-placeholder">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="23 7 16 12 23 17 23 7"></polygon>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
            </svg>
          </div>`
      }
    </div>
    <div class="subject-card-info">
      <h3 class="subject-card-name">${subjectName}</h3>
      <span class="subject-card-count">${videoCount} vidéo${videoCount > 1 ? 's' : ''}</span>
    </div>
  `;

  card.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.hash = `#/categorie/${encodeURIComponent(categoryName)}/sujet/${encodeURIComponent(subjectName)}`;
  });

  return card;
}
