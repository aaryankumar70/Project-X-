export const HOUR = 3600 * 1000;
export const DAY = 24 * HOUR;

export const cn = (...parts) => parts.filter(Boolean).join(' ');

export function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'yesterday' : `${d} days ago`;
}

export function timeLeft(expiresAt) {
  const ms = expiresAt - Date.now();
  if (ms <= 0) return 'Expired';
  const h = Math.ceil(ms / HOUR);
  if (h < 24) return `${h} hr left`;
  const d = Math.ceil(h / 24);
  return `${d} day${d === 1 ? '' : 's'} left`;
}

// active | expiring | returned | expired
export function postStatus(post) {
  if (post.status === 'returned') return 'returned';
  const left = post.expiresAt - Date.now();
  if (left <= 0) return 'expired';
  if (left <= 2 * DAY) return 'expiring';
  return 'active';
}

export function firstName(user) {
  if (!user) return 'there';
  const base = (user.name || user.email || '').split('@')[0].split(/[._-]/)[0];
  return base ? base.charAt(0).toUpperCase() + base.slice(1) : 'there';
}

export const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

// Shrinks a photo so it is light enough to keep in the browser.
export function fileToThumb(file, max = 640) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onerror = () => resolve(null);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => resolve(null);
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.72));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
