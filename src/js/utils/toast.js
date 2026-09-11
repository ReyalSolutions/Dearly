import { Toast } from 'bootstrap';
import { escapeHtml } from './helpers.js';

const icons = { success: 'check-circle-fill', error: 'exclamation-octagon-fill', warning: 'exclamation-triangle-fill', info: 'info-circle-fill' };
export function showToast(message, type = 'info', persistent = false) {
  const container = document.querySelector('#toast-region');
  const toast = document.createElement('div');
  toast.className = `toast dearly-toast toast-${type} border-0`;
  toast.setAttribute('role', 'status');
  toast.innerHTML = `<div class="d-flex"><div class="toast-body"><i class="bi bi-${icons[type] || icons.info}" aria-hidden="true"></i><span>${escapeHtml(message)}</span></div><button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div>`;
  container.append(toast);
  const instance = new Toast(toast, { delay: persistent ? 15000 : 4200 });
  toast.addEventListener('hidden.bs.toast', () => toast.remove());
  instance.show();
}
