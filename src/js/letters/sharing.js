import QRCode from 'qrcode';
import { showToast } from '../utils/toast.js';

export async function copyShareLink(slug) {
  const url = `${location.origin}/l/${slug}`;
  await navigator.clipboard.writeText(url);
  showToast('Share link copied.', 'success');
  return url;
}

export async function shareLetter(slug, title = 'A letter has arrived for you 💌') {
  const url = `${location.origin}/l/${slug}`;
  if (navigator.share) return navigator.share({ title, text: "There's something they wanted you to know.", url });
  return copyShareLink(slug);
}

export async function qrDataUrl(slug) {
  return QRCode.toDataURL(`${location.origin}/l/${slug}`, { width: 768, margin: 2, color: { dark: '#2e2e35', light: '#fff9f5' } });
}

export function socialShareUrls(slug) {
  const url = encodeURIComponent(`${location.origin}/l/${slug}`);
  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    whatsapp: `https://wa.me/?text=${url}`,
    telegram: `https://t.me/share/url?url=${url}`,
    x: `https://x.com/intent/post?url=${url}`,
    email: `mailto:?subject=${encodeURIComponent('A letter has arrived for you 💌')}&body=${url}`,
  };
}
