import { renderShell } from '../components/shell.js';
import { requireSupabase, isSupabaseConfigured } from '../config/supabase.js';
import { escapeHtml, formatDate, setDocumentMeta } from '../utils/helpers.js';
import { showToast } from '../utils/toast.js';

const icons = { letter_opened: 'bi-envelope-open-heart', reaction: 'bi-heart-fill', reply: 'bi-reply-heart', scheduled_published: 'bi-send-check', system: 'bi-info-circle' };

export function notificationsPage(auth) {
  setDocumentMeta({ title: 'Notifications — Dearly', description: 'See what is happening with your Dearly letters.', noIndex: true });
  return renderShell(`<section class="container app-page"><header class="app-header d-flex flex-wrap justify-content-between align-items-end gap-3"><div><span class="eyebrow">A little activity</span><h1>Notifications</h1><p class="mb-0">Moments your letters created.</p></div><button id="mark-all-read" class="btn btn-light btn-sm" type="button">Mark all as read</button></header><div id="notification-list" class="card overflow-hidden"><div class="p-4"><div class="loading-skeleton" style="height:64px"></div><div class="loading-skeleton mt-2" style="height:64px"></div></div></div></section>`, { path: '/notifications', authenticated: { initial: auth.initial } });
}

function item(notification) { return `<article class="notification-item ${notification.is_read ? '' : 'unread'}" data-notification-id="${notification.id}"><span class="notification-icon"><i class="bi ${icons[notification.type] || icons.system}"></i></span><div class="flex-grow-1"><h2 class="h6 mb-1">${escapeHtml(notification.title)}</h2><p class="text-secondary small mb-1">${escapeHtml(notification.message)}</p><time class="text-secondary" style="font-size:.7rem">${formatDate(notification.created_at)}</time></div>${notification.is_read ? '' : '<span class="unread-dot" aria-label="Unread"></span>'}</article>`; }

export async function loadNotifications(auth) {
  const list = document.querySelector('#notification-list');
  if (!isSupabaseConfigured) { list.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🔌</div><h2 class="h4">Connect Supabase to see activity</h2><p class="text-secondary">Your reactions and letter openings will appear here once Dearly is connected.</p></div>`; return; }
  try { const { data, error } = await requireSupabase().from('notifications').select('*').eq('user_id', auth.user.id).order('created_at', { ascending: false }).limit(50); if (error) throw error; list.innerHTML = data.length ? data.map(item).join('') : `<div class="empty-state"><div class="empty-state-icon">✨</div><h2 class="h4">Nothing new just yet.</h2><p class="text-secondary">When someone opens, reacts to, or replies to a letter, it will show up here.</p></div>`; } catch (error) { list.innerHTML = `<div class="empty-state"><div class="empty-state-icon">☁️</div><h2 class="h4">Notifications couldn’t load.</h2><p class="text-secondary">${escapeHtml(error.message)}</p></div>`; }
}

export function bindNotifications(auth) {
  document.querySelector('#mark-all-read')?.addEventListener('click', async () => { try { const { error } = await requireSupabase().from('notifications').update({ is_read: true }).eq('user_id', auth.user.id).eq('is_read', false); if (error) throw error; document.querySelectorAll('.notification-item').forEach((element) => { element.classList.remove('unread'); element.querySelector('.unread-dot')?.remove(); }); showToast('All caught up.', 'success'); } catch (error) { showToast(error.message, 'error', true); } });
  document.addEventListener('click', async (event) => { const target = event.target.closest('.notification-item.unread'); if (!target) return; try { const { error } = await requireSupabase().from('notifications').update({ is_read: true }).eq('id', target.dataset.notificationId).eq('user_id', auth.user.id); if (error) throw error; target.classList.remove('unread'); target.querySelector('.unread-dot')?.remove(); } catch { /* Reading a notification should never interrupt the page. */ } });
}
