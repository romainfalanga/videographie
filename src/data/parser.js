const FILENAME_PATTERN = /^(\d{8})_(\d{6})\s+(.+)\.\w+$/;

export function parseVideoFilename(filename) {
  const match = filename.match(FILENAME_PATTERN);

  if (!match) {
    return null;
  }

  const [, dateStr, timeStr, title] = match;

  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);

  const hour = timeStr.substring(0, 2);
  const minute = timeStr.substring(2, 4);
  const second = timeStr.substring(4, 6);

  return {
    date: `${year}-${month}-${day}`,
    time: `${hour}:${minute}:${second}`,
    title: title,
  };
}

export function parseVideoFile(file) {
  const parsed = parseVideoFilename(file.name);

  if (parsed) {
    return {
      id: file.id,
      name: file.name,
      title: parsed.title,
      date: parsed.date,
      time: parsed.time,
      thumbnailLink: file.thumbnailLink || null,
      size: file.size ? parseInt(file.size, 10) : 0,
    };
  }

  // Fallback: use createdTime and full filename without extension
  const fallbackDate = file.createdTime ? new Date(file.createdTime) : new Date();
  const nameWithoutExt = file.name.replace(/\.\w+$/, '');

  return {
    id: file.id,
    name: file.name,
    title: nameWithoutExt,
    date: fallbackDate.toISOString().substring(0, 10),
    time: fallbackDate.toISOString().substring(11, 19),
    thumbnailLink: file.thumbnailLink || null,
    size: file.size ? parseInt(file.size, 10) : 0,
  };
}

export function formatDate(dateStr) {
  const months = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
  ];
  const [year, month, day] = dateStr.split('-').map(Number);
  return `${day} ${months[month - 1]} ${year}`;
}

export function formatTime(timeStr) {
  const [hour, minute] = timeStr.split(':');
  return `${parseInt(hour, 10)}h${minute}`;
}

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 o';
  const units = ['o', 'Ko', 'Mo', 'Go'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}
