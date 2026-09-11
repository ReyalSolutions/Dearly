let latestSurprise = null;

function hydrate(surprise) {
  const panel = document.querySelector('[data-property-section="extras"]');
  if (!panel) return;
  const value = surprise || {};
  const enabled = Boolean(value.enabled);
  panel.querySelector('#surprise-enabled').checked = enabled;
  panel.querySelector('#surprise-prompt').value = value.prompt || '';
  panel.querySelector('#surprise-content').value = value.content || '';
  panel.querySelector('#surprise-fields').hidden = !enabled;
}

document.addEventListener('dearly:extras-initialize', (event) => {
  latestSurprise = event.detail?.surprise || null;
  hydrate(latestSurprise);
});

function emit() {
  const enabled = document.querySelector('#surprise-enabled')?.checked || false;
  document.dispatchEvent(new CustomEvent('dearly:letter-extras', { detail: { surprise: { enabled, prompt: document.querySelector('#surprise-prompt')?.value.trim() || '', content: document.querySelector('#surprise-content')?.value.trim() || '' } } }));
}

function install() {
  const tools = document.querySelector('.editor-tools'); const properties = document.querySelector('#properties-panel');
  if (!tools || !properties || document.querySelector('#extras-tool')) return;
  const tool = document.createElement('button'); tool.id = 'extras-tool'; tool.dataset.tool = 'extras'; tool.className = 'tool-tab'; tool.type = 'button'; tool.innerHTML = '<i class="bi bi-gift"></i><span>Extras</span>';
  const panel = document.createElement('div'); panel.dataset.propertySection = 'extras'; panel.hidden = true;
  panel.innerHTML = `<p class="text-secondary small">Give your reader a small moment of anticipation.</p><label class="settings-switch mb-3"><span><strong>Hidden message</strong><small>Show a reveal button after the letter.</small></span><input id="surprise-enabled" class="form-check-input" type="checkbox" /></label><div id="surprise-fields" hidden><label class="form-label" for="surprise-prompt">Button prompt</label><input id="surprise-prompt" class="form-control form-control-sm" maxlength="160" placeholder="There’s one more thing…" /><label class="form-label mt-3" for="surprise-content">Hidden message</label><textarea id="surprise-content" class="form-control form-control-sm" rows="4" maxlength="1200" placeholder="Write the thing they should discover."></textarea></div>`;
  tools.append(tool); properties.append(panel); hydrate(latestSurprise);
  tool.addEventListener('click', () => { document.querySelectorAll('.tool-tab').forEach((item) => item.classList.toggle('active', item === tool)); document.querySelectorAll('[data-property-section]').forEach((section) => { section.hidden = section !== panel; }); });
  panel.querySelector('#surprise-enabled').addEventListener('change', (event) => { panel.querySelector('#surprise-fields').hidden = !event.target.checked; emit(); });
  panel.querySelectorAll('input, textarea').forEach((field) => field.addEventListener('input', emit));
}

new MutationObserver(install).observe(document.body, { childList: true, subtree: true });
