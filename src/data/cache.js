const CACHE_KEY = 'videographie_cache';
const ROOT_FOLDER_KEY = 'videographie_root_folder';

export function getCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCache(data) {
  try {
    const cacheData = {
      ...data,
      lastSync: new Date().toISOString(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    return true;
  } catch {
    return false;
  }
}

export function clearCache() {
  localStorage.removeItem(CACHE_KEY);
}

export function getLastSync() {
  const cache = getCache();
  return cache ? cache.lastSync : null;
}

// Root folder persistence — so the user doesn't re-select every time
export function getSavedRootFolder() {
  try {
    const raw = localStorage.getItem(ROOT_FOLDER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setSavedRootFolder(folder) {
  try {
    localStorage.setItem(ROOT_FOLDER_KEY, JSON.stringify(folder));
    return true;
  } catch {
    return false;
  }
}

export function clearSavedRootFolder() {
  localStorage.removeItem(ROOT_FOLDER_KEY);
  localStorage.removeItem(CACHE_KEY);
}
