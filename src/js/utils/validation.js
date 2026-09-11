export const emailIsValid = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
export const required = (value, label) => String(value || '').trim() ? null : `${label} is required.`;
export function validateUpload(file, { maxBytes = 8 * 1024 * 1024, types = ['image/jpeg', 'image/png', 'image/webp'], kind = 'image' } = {}) {
  if (!file) return 'Choose a file first.';
  if (!types.includes(file.type)) return kind === 'audio' ? 'Choose an MP3, OGG, or WAV audio file.' : 'Choose a JPG, PNG, or WebP image.';
  if (file.size > maxBytes) return kind === 'audio' ? 'Audio files must be smaller than 10 MB.' : 'Images must be smaller than 8 MB.';
  return null;
}
