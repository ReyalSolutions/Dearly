import { renderShell } from '../components/shell.js';
import { setDocumentMeta } from '../utils/helpers.js';

const pages = {
  about: ['How Dearly works', 'Write something meaningful, make it personal, and send an opening experience instead of another plain link.'],
  privacy: ['Privacy at Dearly', 'Dearly is designed to share only the letter details its creator chooses. Published letters are protected by unpredictable links and private letters are never indexed.'],
  terms: ['Terms of use', 'Use Dearly to share thoughtful messages. Do not use it for harassment, threats, spam, impersonation, or content that harms others.'],
  report: ['Report a letter', 'If a letter feels unsafe or inappropriate, let us know. Reports are reviewed privately.'],
  received: ['Your received letters', 'Letters sent to your signed-in account will appear here.'],
  notifications: ['Notifications', 'When someone opens, reacts to, or replies to a letter, you will see it here.'],
  profile: ['Your profile', 'Choose how you appear when you send a letter and control who can write to you.'],
  'my-letters': ['Your letters', 'Every draft, sent note, and treasured reply in one place.'],
};
export function staticPage(page, auth) { const [title, text] = pages[page] || ['Page not found', 'This page does not exist.']; setDocumentMeta({ title: `${title} — Dearly`, description: text, noIndex: page !== 'about' }); const action = page === 'my-letters' ? `<a data-route class="btn btn-primary" href="/create-letter">Create a letter</a>` : page === 'report' ? `<form id="report-form" class="text-start mx-auto mt-4" style="max-width:480px"><label class="form-label" for="report-reason">What happened?</label><select id="report-reason" class="form-select"><option>Harassment</option><option>Spam</option><option>Threats</option><option>Sexual content</option><option>Impersonation</option><option>Other</option></select><label class="form-label mt-3" for="report-notes">Anything else we should know?</label><textarea id="report-notes" class="form-control" rows="3" maxlength="1000"></textarea><button class="btn btn-primary mt-3" type="submit">Send report</button></form>` : `<a data-route class="btn btn-primary" href="/create-letter">Create a letter</a>`; return renderShell(`<section class="container app-page"><div class="empty-state" style="padding-top:7rem"><div class="empty-state-icon">${page === 'report' ? '🛟' : '💌'}</div><h1 class="display-title">${title}</h1><p class="text-secondary mx-auto" style="max-width:38rem">${text}</p>${action}</div></section>`, { path: `/${page}`, authenticated: auth.user ? { initial: auth.initial } : false }); }
