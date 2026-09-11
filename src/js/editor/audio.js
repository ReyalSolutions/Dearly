import { isSupabaseConfigured, requireSupabase } from '../config/supabase.js';
import { showToast } from '../utils/toast.js';

let currentMedia = null;

function setState(media) {
  currentMedia = media || null;
  const status = document.querySelector('#audio-status'); const remove = document.querySelector('#remove-audio');
  if (status) status.textContent = currentMedia ? 'A private audio track is attached.' : 'MP3, OGG, or WAV. Up to 10 MB.';
  if (remove) remove.hidden = !currentMedia;
}

async function hydrate() {
  const letterId = new URLSearchParams(location.search).get('id');
  if (!letterId || !isSupabaseConfigured) return setState(null);
  try { const { data, error } = await requireSupabase().from('letter_media').select('id,storage_path').eq('letter_id', letterId).eq('media_type', 'audio').order('created_at', { ascending: false }).limit(1).maybeSingle(); if (error) throw error; setState(data); } catch { setState(null); }
}

async function removeAudio() {
  if (!currentMedia || !isSupabaseConfigured) return;
  try { const db = requireSupabase(); const { error } = await db.from('letter_media').delete().eq('id', currentMedia.id); if (error) throw error; await db.storage.from('letter-audio').remove([currentMedia.storage_path]); setState(null); showToast('Audio removed.', 'success'); } catch (error) { showToast(error.message, 'error', true); }
}

function install() {
  const tools = document.querySelector('.editor-tools'); const properties = document.querySelector('#properties-panel');
  if (!tools || !properties || document.querySelector('#audio-tool')) return;
  const tool = document.createElement('button'); tool.id = 'audio-tool'; tool.dataset.tool = 'audio'; tool.className = 'tool-tab'; tool.type = 'button'; tool.innerHTML = '<i class="bi bi-music-note-beamed"></i><span>Music</span>';
  const panel = document.createElement('div'); panel.dataset.propertySection = 'audio'; panel.hidden = true;
  panel.innerHTML = '<p class="text-secondary small">Attach one private track. It becomes available to the recipient only after you publish.</p><label class="form-label" for="audio-upload">Add a song or voice note</label><input id="audio-upload" class="form-control form-control-sm" type="file" accept="audio/mpeg,audio/ogg,audio/wav" /><p class="form-text" id="audio-status">MP3, OGG, or WAV. Up to 10 MB.</p><button id="remove-audio" class="btn btn-link btn-sm px-0 text-danger" type="button" hidden>Remove audio</button>';
  tools.append(tool); properties.append(panel);
  tool.addEventListener('click', () => { document.querySelectorAll('.tool-tab').forEach((item) => item.classList.toggle('active', item === tool)); document.querySelectorAll('[data-property-section]').forEach((section) => { section.hidden = section !== panel; }); });
  panel.querySelector('#audio-upload').addEventListener('change', (event) => { const [file] = event.target.files; if (file) document.dispatchEvent(new CustomEvent('dearly:audio-upload', { detail: { file } })); event.target.value = ''; });
  panel.querySelector('#remove-audio').addEventListener('click', removeAudio);
  hydrate();
}

document.addEventListener('dearly:audio-state', (event) => setState(event.detail?.media));
new MutationObserver(install).observe(document.body, { childList: true, subtree: true });
