import { findRootFolder, listSubfolders, listVideos } from '../api/drive.js';
import { parseVideoFile } from './parser.js';
import { getCache, setCache } from './cache.js';
import { ROOT_FOLDER_NAME, VALID_CATEGORIES } from '../config.js';

let syncInProgress = false;
let cachedData = null;

export function getSyncStatus() {
  return syncInProgress;
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

export async function synchronize(force = false) {
  if (syncInProgress) return getData();
  syncInProgress = true;

  try {
    // If not forced and cache exists, return cache and sync in background
    if (!force) {
      const existing = getCache();
      if (existing) {
        cachedData = existing;
        // Background sync — don't await
        performSync().catch(console.error);
        return cachedData;
      }
    }

    // Full sync
    const data = await performSync();
    return data;
  } finally {
    syncInProgress = false;
  }
}

async function performSync() {
  // Step 1: Find root folder
  const rootFolder = await findRootFolder(ROOT_FOLDER_NAME);
  if (!rootFolder) {
    throw new Error(`Dossier "${ROOT_FOLDER_NAME}" introuvable à la racine du Drive.`);
  }

  // Step 2: List category folders
  const categoryFolders = await listSubfolders(rootFolder.id);

  const categories = {};

  // Step 3: For each valid category, list subjects
  for (const folder of categoryFolders) {
    const categoryName = folder.name.toLowerCase();
    if (!VALID_CATEGORIES.includes(categoryName)) continue;

    const subjectFolders = await listSubfolders(folder.id);
    const subjects = {};

    // Step 4: For each subject, list videos
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
      folderId: folder.id,
      subjects,
    };
  }

  const data = { categories };
  setCache(data);
  cachedData = { ...data, lastSync: new Date().toISOString() };
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
