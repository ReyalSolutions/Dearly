import { Modal } from 'bootstrap';

export function confirmAction({ title, message, action = 'Continue', danger = true }) {
  return new Promise((resolve) => {
    const modalElement = document.querySelector('#confirm-modal');
    const actionButton = document.querySelector('#confirm-action');
    document.querySelector('#confirm-title').textContent = title;
    document.querySelector('#confirm-message').textContent = message;
    actionButton.textContent = action;
    actionButton.className = `btn ${danger ? 'btn-danger' : 'btn-primary'}`;
    const modal = Modal.getOrCreateInstance(modalElement);
    let chosen = false;
    const confirm = () => { chosen = true; modal.hide(); };
    const close = () => { actionButton.removeEventListener('click', confirm); modalElement.removeEventListener('hidden.bs.modal', close); resolve(chosen); };
    actionButton.addEventListener('click', confirm, { once: true });
    modalElement.addEventListener('hidden.bs.modal', close, { once: true });
    modal.show();
  });
}
