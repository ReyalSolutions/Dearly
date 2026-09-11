import { isSupabaseConfigured, requireSupabase } from '../config/supabase.js';

const presentationByCategory = {
  Love: ['heart-fill', '#fff0f3'], Confession: ['chat-heart-fill', '#fff1e5'], Birthday: ['balloon-heart-fill', '#fff6d9'], Anniversary: ['stars', '#f0efff'], Friendship: ['people-fill', '#e9faf5'], 'Thank You': ['hand-thumbs-up-fill', '#fff3db'], Sorry: ['arrow-counterclockwise', '#eaf3f8'], Graduation: ['mortarboard-fill', '#f0efff'], Professional: ['briefcase-fill', '#edf4fb'],
};

function color(value, fallback) { return /^#[0-9a-f]{6}$/i.test(value || '') ? value : fallback; }
function font(value) { return ['Playfair Display', 'Cormorant Garamond', 'Dancing Script', 'Caveat', 'Poppins', 'Libre Baskerville'].includes(value) ? value : 'Playfair Display'; }

export function presentTemplate(row) {
  const preview = row.preview || {}; const defaults = row.letter_defaults || {}; const category = row.template_categories?.name || 'Custom';
  return { id: row.id, slug: row.slug, name: row.name, description: row.description || '', category, bg: color(preview.background, '#fff7f6'), accent: color(preview.accent, '#ff9baa'), font: font(defaults.font_family), body: preview.body || 'A beautiful place to begin — make it entirely your own.' };
}

export function categoryPresentation(category) { const [icon, tint] = presentationByCategory[category.name] || ['palette-fill', '#fff0f3']; return { ...category, icon, tint }; }

export async function fetchPublishedTemplates() {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await requireSupabase().from('templates').select('id,slug,name,description,preview,letter_defaults,template_categories(name,slug)').eq('is_published', true).order('is_featured', { ascending: false }).order('name');
  if (error) throw error;
  return (data || []).map(presentTemplate);
}

export async function fetchTemplateCategories() {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await requireSupabase().from('template_categories').select('name,slug').order('name');
  if (error) throw error;
  return (data || []).map(categoryPresentation);
}

export async function fetchTemplateBySlug(slug) {
  if (!isSupabaseConfigured || !slug) return null;
  const { data, error } = await requireSupabase().from('templates').select('id,slug,name,description,preview,letter_defaults,template_categories(name,slug)').eq('slug', slug).eq('is_published', true).maybeSingle();
  if (error) throw error;
  return data ? presentTemplate(data) : null;
}
