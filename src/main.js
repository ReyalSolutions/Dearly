import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'quill/dist/quill.snow.css';
import * as bootstrap from 'bootstrap';
import $ from 'jquery';
import './css/global.css';
import './css/components.css';
import './css/editor.css';
import './js/editor/advanced-elements.js';
import './js/editor/extras.js';
import './js/editor/audio.js';
import './js/editor/questions.js';
import { getAuthState } from './js/components/shell.js';
import { homePage } from './js/pages/home.js';
import { bindTemplatePage, loadTemplates, templatesPage } from './js/pages/templates.js';
import { bindAuthPage, forgotPasswordPage, loginPage, registerPage, resetPasswordPage } from './js/pages/auth.js';
import { bindDashboard, dashboardPage, loadDashboard } from './js/pages/dashboard.js';
import { bindEditor, editorPage } from './js/pages/editor.js';
import { loadPublicLetter, publicLetterPage } from './js/pages/viewer.js';
import { staticPage } from './js/pages/static.js';
import { bindSharePage, sharePage } from './js/pages/share.js';
import { bindNotifications, loadNotifications, notificationsPage } from './js/pages/notifications.js';
import { bindProfile, loadProfile, profilePage } from './js/pages/profile.js';
import { requireSupabase, supabase } from './js/config/supabase.js';
import { showToast } from './js/utils/toast.js';

window.bootstrap = bootstrap;
window.$ = $;
const app = document.querySelector('#app');

export function go(to) { history.pushState({}, '', to); render(); }

function normalizePath(pathname) { return pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname; }
async function render() {
  const path = normalizePath(location.pathname);
  const auth = await getAuthState();
  if (path.startsWith('/l/')) { app.innerHTML = publicLetterPage(); await loadPublicLetter(decodeURIComponent(path.slice(3))); return; }
  const protectedPaths = ['/dashboard', '/my-letters', '/received', '/notifications', '/profile'];
  if ((protectedPaths.includes(path) || path.startsWith('/share/')) && !auth.user) { go('/login'); showToast('Log in to continue.', 'info'); return; }
  if (path === '/') app.innerHTML = homePage(auth);
  else if (path === '/templates') { app.innerHTML = templatesPage(auth); bindTemplatePage(); await loadTemplates(); }
  else if (path === '/login') { if (auth.user) return go('/dashboard'); app.innerHTML = loginPage(auth); bindAuthPage(go); }
  else if (path === '/register') { if (auth.user) return go('/dashboard'); app.innerHTML = registerPage(auth); bindAuthPage(go); }
  else if (path === '/forgot-password') { app.innerHTML = forgotPasswordPage(auth); bindAuthPage(go); }
  else if (path === '/reset-password') { app.innerHTML = resetPasswordPage(auth); bindAuthPage(go); }
  else if (path === '/dashboard') { app.innerHTML = dashboardPage(auth); bindDashboard(); await loadDashboard(auth); }
  else if (path === '/create-letter') { app.innerHTML = editorPage(auth); await bindEditor(auth, go); }
  else if (path.startsWith('/share/')) { app.innerHTML = sharePage(auth, decodeURIComponent(path.slice(7))); bindSharePage(decodeURIComponent(path.slice(7))); }
  else if (path === '/notifications') { app.innerHTML = notificationsPage(auth); bindNotifications(auth); await loadNotifications(auth); }
  else if (path === '/profile') { app.innerHTML = profilePage(auth); bindProfile(auth); await loadProfile(auth); }
  else if (path === '/my-letters') { app.innerHTML = dashboardPage(auth); bindDashboard(); await loadDashboard(auth); }
  else if (['/about', '/privacy', '/terms', '/report', '/received', '/notifications', '/profile'].includes(path)) { app.innerHTML = staticPage(path.slice(1), auth); bindStaticForms(auth); }
  else app.innerHTML = staticPage('not-found', auth);
}

function bindStaticForms(auth) { document.querySelector('#report-form')?.addEventListener('submit', async (event) => { event.preventDefault(); const params = new URLSearchParams(location.search); try { const { error } = await requireSupabase().from('reports').insert({ reporter_user_id: auth.user?.id || null, letter_share_slug: params.get('letter') || null, reason: document.querySelector('#report-reason').value, details: document.querySelector('#report-notes').value.trim(), reporter_token: sessionStorage.getItem('dearly-recipient-token') || crypto.randomUUID() }); if (error) throw error; showToast('Thank you. Your report was sent.', 'success'); event.currentTarget.reset(); } catch (error) { showToast(error.message, 'error', true); } }); }

document.addEventListener('click', (event) => { const link = event.target.closest('a[data-route]'); if (!link || event.metaKey || event.ctrlKey || event.shiftKey || link.target === '_blank') return; event.preventDefault(); go(link.getAttribute('href')); });
window.addEventListener('popstate', render);
supabase?.auth.onAuthStateChange((_event, session) => { if (!session && ['/dashboard', '/my-letters', '/received', '/notifications', '/profile'].includes(normalizePath(location.pathname))) go('/login'); });
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('/service-worker.js').catch(() => {}));
render().catch((error) => { app.innerHTML = `<main class="container py-5"><div class="empty-state card"><div class="empty-state-icon">☁️</div><h1 class="h3">Dearly needs a moment.</h1><p class="text-secondary">${String(error.message || 'An unexpected error occurred.')}</p><button class="btn btn-primary" onclick="location.reload()">Try again</button></div></main>`; });
