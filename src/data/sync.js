import { getFolder, listSubfolders, listVideos } from '../api/drive.js';
import { parseVideoFile } from './parser.js';
import { getCache, setCache, getSavedRootFolder } from './cache.js';
import { VALID_CATEGORIES } from '../config.js';

let syncInProgress = false;
let cachedData = null;
let lastSyncError = null;

export function getSyncStatus() {
  return syncInProgress;
}

export function getSyncError() {
  return lastSyncError;
}

export function getData() {
  if (cachedData) return cachedData;
  const cache = getCache();
  if (cache) {
    cachedData = cache;
    return cache;
  }
  return null;
}

export function isRootFolderConfigured() {
  return getSavedRootFolder() !== null;
}

export async function synchronize(force = false) {
  if (syncInProgress) return getData();
  syncInProgress = true;
  lastSyncError = null;

  try {
    // Check if root folder is configured
    const savedFolder = getSavedRootFolder();
    if (!savedFolder || !savedFolder.id) {
      throw new Error('Aucun dossier configuré. Sélectionne ton dossier vidéographie depuis Google Drive.');
    }

    // If not forced and cache exists, return cache and sync in background
    if (!force) {
      const existing = getCache();
      if (existing) {
        cachedData = existing;
        // Background sync — don't await
        performSync(savedFolder.id).catch((err) => {
          console.error('Background sync error:', err);
          lastSyncError = err.message;
        });
        return cachedData;
      }
    }

    // Full sync
    const data = await performSync(savedFolder.id);
    return data;
  } catch (err) {
    console.error('Sync error:', err);
    lastSyncError = err.message;
    // Return cached data if available even on error
    return getData();
  } finally {
    syncInProgress = false;
  }
}

async function performSync(rootFolderId) {
  // Verify the folder still exists
  const folder = await getFolder(rootFolderId);
  if (!folder) {
    throw new Error('Le dossier vidéographie sélectionné est introuvable ou a été supprimé. Reconfigure-le depuis les paramètres.');
  }

  // List category folders
  const categoryFolders = await listSubfolders(rootFolderId);

  const categories = {};

  // For each valid category, list subjects
  for (const catFolder of categoryFolders) {
    const categoryName = catFolder.name.toLowerCase();
    if (!VALID_CATEGORIES.includes(categoryName)) continue;

    const subjectFolders = await listSubfolders(catFolder.id);
    const subjects = {};

    // For each subject, list videos
    for (const subjectFolder of subjectFolders) {
      const videoFiles = await listVideos(subjectFolder.id);
      const videos = videoFiles.map(parseVideoFile);

      // Sort by date+time descending (most recent first)
      videos.sort((a, b) => {
        const dateTimeA = `${a.date} ${a.time}`;
        const dateTimeB = `${b.date} ${b.time}`;
        return dateTimeB.localeCompare(dateTimeA);
      });

      subjects[subjectFolder.name] = {
        folderId: subjectFolder.id,
        videos,
      };
    }

    categories[categoryName] = {
      folderId: catFolder.id,
      subjects,
    };
  }

  const data = { categories };
  setCache(data);
  cachedData = { ...data, lastSync: new Date().toISOString() };
  lastSyncError = null;
  return cachedData;
}

export function getAllVideos() {
  const data = getData();
  if (!data || !data.categories) return [];

  const allVideos = [];

  for (const [categoryName, category] of Object.entries(data.categories)) {
    for (const [subjectName, subject] of Object.entries(category.subjects)) {
      for (const video of subject.videos) {
        allVideos.push({
          ...video,
          category: categoryName,
          subject: subjectName,
        });
      }
    }
  }

  // Sort chronologically descending
  allVideos.sort((a, b) => {
    const dateTimeA = `${a.date} ${a.time}`;
    const dateTimeB = `${b.date} ${b.time}`;
    return dateTimeB.localeCompare(dateTimeA);
  });

  return allVideos;
}

export function getCategoryStats(categoryName) {
  const data = getData();
  if (!data || !data.categories || !data.categories[categoryName]) {
    return { subjectCount: 0, videoCount: 0 };
  }

  const category = data.categories[categoryName];
  const subjectCount = Object.keys(category.subjects).length;
  let videoCount = 0;

  for (const subject of Object.values(category.subjects)) {
    videoCount += subject.videos.length;
  }

  return { subjectCount, videoCount };
}
