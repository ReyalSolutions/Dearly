import DOMPurify from 'dompurify';

export const sanitizeLetterHtml = (html = '') => DOMPurify.sanitize(html, {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'ol', 'ul', 'li', 'a', 'span', 'blockquote', 'h1', 'h2', 'h3'],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style'],
  ALLOW_DATA_ATTR: false,
});
