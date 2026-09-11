import { supabase } from '../config/supabase.js';
import { showToast } from '../utils/toast.js';

const publicLinks = [
  ['/', 'Home'], ['/templates', 'Templates'], ['/about', 'About'],
];
const privateLinks = [
  ['/', 'Home'], ['/templates', 'Templates'], ['/my-letters', 'My Letters'], ['/received', 'Received'],
];

function navLink([href, label], path) {
  return `<li class="nav-item"><a class="nav-link px-lg-3 ${path === href ? 'active' : ''}" data-route href="${href}">${label}</a></li>`;
}

export function renderShell(content, { path = location.pathname, authenticated = false, viewer = false } = {}) {
  if (viewer) return content;
  const links = authenticated ? privateLinks : publicLinks;
  const authActions = authenticated
    ? `<div class="d-flex align-items-center gap-2"><a data-route href="/notifications" class="btn btn-sm btn-light icon-button" aria-label="Notifications"><i class="bi bi-bell"></i></a><a data-route href="/profile" class="profile-dot" aria-label="Profile">${authenticated.initial}</a></div>`
    : `<div class="d-flex gap-2"><a data-route href="/login" class="btn btn-light btn-sm px-3">Log in</a><a data-route href="/register" class="btn btn-primary btn-sm px-3">Create a letter</a></div>`;
  return `<header class="glass-nav sticky-top"><nav class="navbar navbar-expand-md site-nav container"><a class="navbar-brand brand" data-route href="/"><span class="brand-mark">♥</span>Dearly</a><button class="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="offcanvas" data-bs-target="#main-menu" aria-controls="main-menu" aria-label="Open menu"><i class="bi bi-list fs-3"></i></button><div class="collapse navbar-collapse"><ul class="navbar-nav mx-auto">${links.map((item) => navLink(item, path)).join('')}</ul><div class="d-flex gap-2 align-items-center"><a data-route href="/create-letter" class="btn btn-primary btn-sm px-3"><i class="bi bi-pencil-square me-1"></i>Create Letter</a>${authActions}</div></div></nav></header>
  <div class="offcanvas offcanvas-end" tabindex="-1" id="main-menu" aria-labelledby="main-menu-title"><div class="offcanvas-header"><h2 class="offcanvas-title brand h4" id="main-menu-title">Dearly</h2><button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button></div><div class="offcanvas-body d-flex flex-column"><nav class="nav flex-column gap-2">${links.map((item) => `<a data-route data-bs-dismiss="offcanvas" class="nav-link ${path === item[0] ? 'active' : ''}" href="${item[0]}">${item[1]}</a>`).join('')}</nav><div class="mt-auto pt-4"><a data-route href="/create-letter" class="btn btn-primary w-100"><i class="bi bi-pencil-square me-1"></i>Create Letter</a></div></div></div>
  <main id="main-content">${content}</main>${footer()}${authenticated ? bottomNav(path) : ''}`;
}

function footer() { return `<footer class="footer"><div class="container py-5"><div class="row g-4"><div class="col-lg-5"><a class="brand" data-route href="/"><span class="brand-mark">♥</span>Dearly</a><p class="text-secondary mt-3 mb-0" style="max-width: 20rem">A softer way to send what matters.</p></div><div class="col-6 col-lg-2"><h2 class="h6 fw-semibold">Explore</h2><div class="d-grid gap-2 small"><a data-route href="/templates">Templates</a><a data-route href="/create-letter">Create a letter</a><a data-route href="/about">How it works</a></div></div><div class="col-6 col-lg-2"><h2 class="h6 fw-semibold">Company</h2><div class="d-grid gap-2 small"><a data-route href="/privacy">Privacy</a><a data-route href="/terms">Terms</a><a data-route href="/report">Report content</a></div></div></div><div class="d-flex flex-wrap justify-content-between gap-2 mt-5 pt-3 border-top small text-secondary"><span>© ${new Date().getFullYear()} Dearly</span><span>Say what you feel, beautifully.</span></div></div></footer>`; }

function bottomNav(path) { const link = (href, icon, label, create = false) => `<a data-route class="${path === href ? 'active' : ''}" href="${href}" aria-label="${label}">${create ? `<span class="create-nav"><i class="bi bi-plus-lg"></i></span>` : `<i class="bi bi-${icon}"></i><span>${label}</span>`}</a>`; return `<nav class="bottom-nav" aria-label="Mobile navigation">${link('/', 'house', 'Home')}${link('/my-letters', 'envelope', 'Letters')}${link('/create-letter', '', 'Create', true)}${link('/received', 'inbox', 'Inbox')}${link('/profile', 'person', 'Profile')}</nav>`; }

export async function getAuthState() {
  if (!supabase) return { user: null, initial: '' };
  const { data: { user } } = await supabase.auth.getUser();
  const initial = (user?.user_metadata?.display_name || user?.email || '').trim().slice(0, 1).toUpperCase();
  return { user, initial };
}

export async function signOut() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  showToast('You have been signed out.', 'success');
}
