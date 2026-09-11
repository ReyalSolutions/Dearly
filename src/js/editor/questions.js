import { isSupabaseConfigured, requireSupabase } from '../config/supabase.js';
import { showToast } from '../utils/toast.js';

let letterId = null;
let questions = [];
let removedQuestionIds = [];
let removedOptionIds = [];
let persistTimer;

const newOption = () => ({ clientId: crypto.randomUUID(), label: '' });
const newQuestion = () => ({ clientId: crypto.randomUUID(), question: '', options: [newOption(), newOption()] });

function row(question, index) { return `<div class="border rounded-3 p-3 mb-3" data-question-client="${question.clientId}"><div class="d-flex justify-content-between gap-2"><label class="form-label small fw-semibold" for="question-${question.clientId}">Question ${index + 1}</label><button class="btn btn-link btn-sm text-danger p-0 remove-question" type="button" aria-label="Remove question">Remove</button></div><input id="question-${question.clientId}" class="form-control form-control-sm question-text" maxlength="500" value="${question.question.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;')}" placeholder="Ask something thoughtful" />${question.options.map((option, optionIndex) => `<div class="input-group input-group-sm mt-2" data-option-client="${option.clientId}"><span class="input-group-text">${String.fromCharCode(65 + optionIndex)}</span><input class="form-control option-text" maxlength="160" value="${option.label.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;')}" placeholder="Option ${optionIndex + 1}" /><button class="btn btn-outline-secondary remove-option" type="button" aria-label="Remove option" ${question.options.length <= 2 ? 'disabled' : ''}><i class="bi bi-x-lg"></i></button></div>`).join('')}<button class="btn btn-light btn-sm mt-2 add-option" type="button"><i class="bi bi-plus-lg me-1"></i>Add option</button></div>`; }
function render() { const list = document.querySelector('#question-list'); if (list) list.innerHTML = questions.length ? questions.map(row).join('') : '<p class="text-secondary small mb-0">Add a simple choice for the person opening your letter.</p>'; }
function schedulePersist() { clearTimeout(persistTimer); persistTimer = setTimeout(persist, 700); }

async function hydrate() {
  letterId = new URLSearchParams(location.search).get('id');
  if (!letterId || !isSupabaseConfigured) { questions = []; removedQuestionIds = []; removedOptionIds = []; return render(); }
  try { const { data, error } = await requireSupabase().from('letter_questions').select('id,question,position,question_options(id,label,position)').eq('letter_id', letterId).order('position'); if (error) throw error; questions = (data || []).map((question) => ({ id: question.id, clientId: crypto.randomUUID(), question: question.question, options: (question.question_options || []).sort((a, b) => a.position - b.position).map((option) => ({ ...option, clientId: crypto.randomUUID() })) })); render(); } catch { render(); }
}

async function persist() {
  if (!questions.length && !removedQuestionIds.length && !removedOptionIds.length) return;
  if (!letterId) { document.dispatchEvent(new CustomEvent('dearly:request-letter-save')); return; }
  if (!isSupabaseConfigured) return;
  const valid = questions.filter((question) => question.question.trim() && question.options.filter((option) => option.label.trim()).length >= 2);
  if (valid.length !== questions.length) return;
  try { const db = requireSupabase(); if (removedQuestionIds.length) { const { error } = await db.from('letter_questions').delete().in('id', removedQuestionIds); if (error) throw error; removedQuestionIds = []; } if (removedOptionIds.length) { const { error } = await db.from('question_options').delete().in('id', removedOptionIds); if (error) throw error; removedOptionIds = []; } const { data: savedQuestions, error: questionError } = await db.from('letter_questions').upsert(valid.map((question, position) => ({ id: question.id, letter_id: letterId, question: question.question.trim(), position })), { onConflict: 'id' }).select('id,question,position'); if (questionError) throw questionError; savedQuestions.forEach((saved, index) => { valid[index].id = saved.id; }); const options = valid.flatMap((question) => question.options.filter((option) => option.label.trim()).map((option, position) => ({ id: option.id, question_id: question.id, label: option.label.trim(), position, option }))); const { data: savedOptions, error: optionError } = await db.from('question_options').upsert(options.map(({ option, ...value }) => value), { onConflict: 'id' }).select('id,question_id,label,position'); if (optionError) throw optionError; savedOptions.forEach((saved) => { const option = options.find((item) => item.question_id === saved.question_id && item.label.trim() === saved.label); if (option) option.option.id = saved.id; }); } catch (error) { showToast(error.message, 'error', true); }
}

function install() {
  const tools = document.querySelector('.editor-tools'); const properties = document.querySelector('#properties-panel');
  if (!tools || !properties || document.querySelector('#questions-tool')) return;
  const tool = document.createElement('button'); tool.id = 'questions-tool'; tool.dataset.tool = 'questions'; tool.className = 'tool-tab'; tool.type = 'button'; tool.innerHTML = '<i class="bi bi-chat-square-heart"></i><span>Questions</span>';
  const panel = document.createElement('div'); panel.dataset.propertySection = 'questions'; panel.hidden = true; panel.innerHTML = '<p class="text-secondary small">Invite a small response after your letter is opened.</p><div id="question-list"></div><button id="add-question" class="btn btn-light btn-sm mt-2" type="button"><i class="bi bi-plus-lg me-1"></i>Add question</button>';
  tools.append(tool); properties.append(panel); render(); hydrate();
  tool.addEventListener('click', () => { document.querySelectorAll('.tool-tab').forEach((item) => item.classList.toggle('active', item === tool)); document.querySelectorAll('[data-property-section]').forEach((section) => { section.hidden = section !== panel; }); });
  panel.querySelector('#add-question').addEventListener('click', () => { questions.push(newQuestion()); render(); });
  panel.addEventListener('input', (event) => { const questionEl = event.target.closest('[data-question-client]'); const question = questions.find((item) => item.clientId === questionEl?.dataset.questionClient); if (!question) return; if (event.target.classList.contains('question-text')) question.question = event.target.value; else if (event.target.classList.contains('option-text')) { const option = question.options.find((item) => item.clientId === event.target.closest('[data-option-client]')?.dataset.optionClient); if (option) option.label = event.target.value; } schedulePersist(); });
  panel.addEventListener('click', (event) => { const questionEl = event.target.closest('[data-question-client]'); const question = questions.find((item) => item.clientId === questionEl?.dataset.questionClient); if (!question) return; if (event.target.closest('.remove-question')) { if (question.id) removedQuestionIds.push(question.id); questions = questions.filter((item) => item !== question); render(); schedulePersist(); } else if (event.target.closest('.add-option')) { question.options.push(newOption()); render(); } else if (event.target.closest('.remove-option')) { const option = question.options.find((item) => item.clientId === event.target.closest('[data-option-client]')?.dataset.optionClient); if (option?.id) removedOptionIds.push(option.id); question.options = question.options.filter((item) => item !== option); render(); schedulePersist(); } });
}

document.addEventListener('dearly:letter-saved', (event) => { if (!letterId && event.detail?.letter?.id) { letterId = event.detail.letter.id; persist(); } });
new MutationObserver(install).observe(document.body, { childList: true, subtree: true });
