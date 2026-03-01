import { getToken } from '../auth/google.js';

const API_BASE = 'https://www.googleapis.com/drive/v3';

async function request(endpoint, params = {}) {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const url = new URL(`${API_BASE}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Drive API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
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
      q: `'${parentId}' in parents and mimeType contains 'video/' and trashed = false`,
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
