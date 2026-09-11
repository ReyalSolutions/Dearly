export const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' })[char]);

export const formatDate = (value) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value));

export const debounce = (fn, wait = 1200) => {
  let timeout;
  return (...args) => { clearTimeout(timeout); timeout = setTimeout(() => fn(...args), wait); };
};

export function randomSlug(length = 12) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);
  return Array.from(values, (value) => chars[value % chars.length]).join('');
}

export function setDocumentMeta({ title, description, noIndex = false }) {
  document.title = title;
  const descriptionNode = document.querySelector('meta[name="description"]');
  if (descriptionNode) descriptionNode.content = description;
  let robots = document.querySelector('meta[name="robots"]');
  if (noIndex && !robots) { robots = document.createElement('meta'); robots.name = 'robots'; document.head.append(robots); }
  if (robots) robots.content = noIndex ? 'noindex, nofollow' : 'index, follow';
}
