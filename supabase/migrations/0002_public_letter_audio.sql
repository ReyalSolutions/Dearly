-- Make one attached audio track available only with a currently published letter.
-- This extends the deliberately limited recipient payload; it never exposes owner_id.
create or replace function public.get_public_letter(share_slug_input text) returns jsonb language sql security definer set search_path = public as $$
  select jsonb_build_object(
    'id', l.id, 'share_slug', l.share_slug, 'title', l.title, 'recipient_name', l.recipient_name,
    'sender_name', case when l.show_sender then l.sender_name else null end,
    'content', l.content, 'background_color', l.background_color, 'text_color', l.text_color,
    'font_family', l.font_family, 'envelope', l.envelope, 'allow_reactions', l.allow_reactions,
    'allow_replies', l.allow_replies, 'allow_social_preview', l.allow_social_preview, 'show_sender', l.show_sender,
    'letter_audio', (select jsonb_build_object('storage_path', m.storage_path) from public.letter_media m where m.letter_id = l.id and m.media_type = 'audio' order by m.created_at desc limit 1),
    'letter_elements', coalesce((select jsonb_agg(jsonb_build_object('id', e.id, 'element_type', e.element_type, 'content', e.content, 'asset_url', e.asset_url, 'x_position', e.x_position, 'y_position', e.y_position, 'width', e.width, 'height', e.height, 'rotation', e.rotation, 'z_index', e.z_index, 'opacity', e.opacity, 'styles', e.styles) order by e.z_index) from public.letter_elements e where e.letter_id = l.id), '[]'::jsonb)
  ) from public.letters l
  where l.share_slug = share_slug_input and l.status = 'published' and l.is_public = true and (l.expires_at is null or l.expires_at > now())
  limit 1;
$$;

create policy "published letter audio read" on storage.objects for select
using (bucket_id = 'letter-audio' and public.can_read_published_letter_asset(name));
