import interact from 'interactjs';

function activeElement() { return document.querySelector('.letter-decoration.selected'); }
function elementId(element) { return element?.dataset.elementId; }
function dispatch(action, id, values = {}) { document.dispatchEvent(new CustomEvent('dearly:element-action', { detail: { action, id, ...values } })); }

function controls() {
  const panel = document.querySelector('#properties-panel');
  if (!panel || document.querySelector('#element-controls')) return;
  const section = document.createElement('section');
  section.id = 'element-controls'; section.className = 'mt-4 pt-3 border-top'; section.hidden = true;
  section.innerHTML = `<h3 class="mt-0">Selected detail</h3><div class="d-flex flex-wrap gap-2"><button class="btn btn-light btn-sm" type="button" data-element-action="duplicate" aria-label="Duplicate"><i class="bi bi-copy"></i></button><button class="btn btn-light btn-sm" type="button" data-element-action="back" aria-label="Send backward"><i class="bi bi-layers-half"></i></button><button class="btn btn-light btn-sm" type="button" data-element-action="front" aria-label="Bring forward"><i class="bi bi-layers"></i></button><button class="btn btn-light btn-sm text-danger" type="button" data-element-action="delete" aria-label="Delete"><i class="bi bi-trash"></i></button></div><label class="form-label mt-3" for="element-rotation">Rotation <span id="rotation-value" class="text-secondary fw-normal">0°</span></label><input id="element-rotation" class="form-range" type="range" min="-180" max="180" value="0" />`;
  panel.append(section);
  section.querySelector('#element-rotation').addEventListener('input', (event) => { const target = activeElement(); if (!target) return; const rotation = Number(event.target.value); target.style.transform = `rotate(${rotation}deg)`; section.querySelector('#rotation-value').textContent = `${rotation}°`; dispatch('rotate', elementId(target), { rotation }); });
  section.addEventListener('click', (event) => { const button = event.target.closest('[data-element-action]'); const target = activeElement(); if (button && target) dispatch(button.dataset.elementAction, elementId(target)); });
}

function showControls(element) { controls(); const controlPanel = document.querySelector('#element-controls'); if (!controlPanel) return; document.querySelectorAll('.letter-decoration.selected').forEach((node) => { if (node !== element) node.classList.remove('selected'); }); element.classList.add('selected'); controlPanel.hidden = false; const rotation = Number((element.style.transform.match(/-?\d+/) || ['0'])[0]); controlPanel.querySelector('#element-rotation').value = rotation; controlPanel.querySelector('#rotation-value').textContent = `${rotation}°`; }

document.addEventListener('click', (event) => { const element = event.target.closest('.letter-decoration'); if (element) showControls(element); });

interact('.letter-decoration').resizable({ edges: { right: true, bottom: true }, modifiers: [interact.modifiers.restrictSize({ min: { width: 24, height: 24 }, max: { width: 500, height: 500 } })], listeners: { move(event) { const target = event.target; target.style.width = `${event.rect.width}px`; target.style.height = `${event.rect.height}px`; dispatch('resize', elementId(target), { width: Math.round(event.rect.width), height: Math.round(event.rect.height) }); } } });
