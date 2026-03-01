import { getToken } from '../auth/google.js';

const API_BASE = 'https://www.googleapis.com/drive/v3';

async function request(endpoint, params = {}) {
  const token = getToken();
  if (!token) throw new Error('Non authentifié. Reconnecte-toi avec Google.');

  const url = new URL(`${API_BASE}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 401) {
    throw new Error('Session expirée. Reconnecte-toi avec Google.');
  }

  if (response.status === 403) {
    throw new Error("Accès refusé. Vérifie que tu as autorisé l'accès en lecture à ton Google Drive.");
  }

  if (!response.ok) {
    throw new Error(`Erreur Google Drive (${response.status}). Réessaie dans quelques instants.`);
  }

  return response.json();
}

// Search for folders by name anywhere in the Drive (not just root)
export async function searchFoldersByName(name) {
  const data = await request('/files', {
    q: `name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: 'files(id, name, parents)',
    spaces: 'drive',
    pageSize: '50',
  });
  return data.files || [];
}

// Get the path of a folder for display (e.g. "Mon Drive / projets / vidéographie")
export async function getFolderPath(folderId) {
  const parts = [];
  let currentId = folderId;
  let maxDepth = 10;

  while (currentId && maxDepth > 0) {
    maxDepth--;
    try {
      const data = await request(`/files/${currentId}`, {
        fields: 'id, name, parents',
      });
      parts.unshift(data.name);
      currentId = data.parents && data.parents.length > 0 ? data.parents[0] : null;
    } catch {
      break;
    }
  }

  return parts.join(' / ');
}

// Check if a folder contains the expected category subfolders
export async function validateFolderStructure(folderId, expectedCategories) {
  const subfolders = await listSubfolders(folderId);
  const subfolderNames = subfolders.map((f) => f.name.toLowerCase());

  const found = [];
  const missing = [];

  for (const cat of expectedCategories) {
    if (subfolderNames.includes(cat)) {
      found.push(cat);
    } else {
      missing.push(cat);
    }
  }

  return { found, missing, subfolders };
}

// Get a single folder by ID (to verify it still exists)
export async function getFolder(folderId) {
  try {
    const data = await request(`/files/${folderId}`, {
      fields: 'id, name, mimeType, trashed',
    });
    if (data.trashed) return null;
    if (data.mimeType !== 'application/vnd.google-apps.folder') return null;
    return data;
  } catch {
    return null;
  }
}

export async function findRootFolder(name) {
  const data = await request('/files', {
    q: `name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and 'root' in parents and trashed = false`,
    fields: 'files(id, name)',
    spaces: 'drive',
  });
  return data.files && data.files.length > 0 ? data.files[0] : null;
}

export async function listSubfolders(parentId) {
  const files = [];
  let pageToken = null;

  do {
    const params = {
      q: `'${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'nextPageToken, files(id, name)',
      orderBy: 'name',
      pageSize: '100',
    };
    if (pageToken) params.pageToken = pageToken;

    const data = await request('/files', params);
    files.push(...(data.files || []));
    pageToken = data.nextPageToken;
  } while (pageToken);

  return files;
}

export async function listVideos(parentId) {
  const files = [];
  let pageToken = null;

  do {
    const params = {
      q: `'${parentId}' in parents and mimeType != 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'nextPageToken, files(id, name, mimeType, thumbnailLink, createdTime, size)',
      orderBy: 'name',
      pageSize: '100',
    };
    if (pageToken) params.pageToken = pageToken;

    const data = await request('/files', params);
    files.push(...(data.files || []));
    pageToken = data.nextPageToken;
  } while (pageToken);

  return files;
}
