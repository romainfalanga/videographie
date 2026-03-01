const CACHE_KEY = 'videographie_cache';

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
