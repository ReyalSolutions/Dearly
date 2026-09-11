import { requireSupabase } from '../config/supabase.js';
import { validateUpload } from './validation.js';

export async function uploadLetterImage({ file, userId, letterId }) {
  const validationError = validateUpload(file);
  if (validationError) throw new Error(validationError);
  const extension = file.name.split('.').pop().toLowerCase();
  const path = `${userId}/${letterId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await requireSupabase().storage.from('letter-images').upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  return path;
}
