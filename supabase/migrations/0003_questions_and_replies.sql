-- Recipient questions are exposed only through the restricted letter payload.
create or replace function public.get_public_letter(share_slug_input text) returns jsonb language sql security definer set search_path = public as $$
  select jsonb_build_object(
    'id', l.id, 'share_slug', l.share_slug, 'title', l.title, 'recipient_name', l.recipient_name,
    'sender_name', case when l.show_sender then l.sender_name else null end,
    'content', l.content, 'background_color', l.background_color, 'text_color', l.text_color,
    'font_family', l.font_family, 'envelope', l.envelope, 'allow_reactions', l.allow_reactions,
    'allow_replies', l.allow_replies, 'allow_social_preview', l.allow_social_preview, 'show_sender', l.show_sender,
    'letter_audio', (select jsonb_build_object('storage_path', m.storage_path) from public.letter_media m where m.letter_id = l.id and m.media_type = 'audio' order by m.created_at desc limit 1),
    'letter_questions', coalesce((select jsonb_agg(jsonb_build_object('id', q.id, 'question', q.question, 'options', coalesce((select jsonb_agg(jsonb_build_object('id', o.id, 'label', o.label) order by o.position) from public.question_options o where o.question_id = q.id), '[]'::jsonb)) order by q.position) from public.letter_questions q where q.letter_id = l.id), '[]'::jsonb),
    'letter_elements', coalesce((select jsonb_agg(jsonb_build_object('id', e.id, 'element_type', e.element_type, 'content', e.content, 'asset_url', e.asset_url, 'x_position', e.x_position, 'y_position', e.y_position, 'width', e.width, 'height', e.height, 'rotation', e.rotation, 'z_index', e.z_index, 'opacity', e.opacity, 'styles', e.styles) order by e.z_index) from public.letter_elements e where e.letter_id = l.id), '[]'::jsonb)
  ) from public.letters l
  where l.share_slug = share_slug_input and l.status = 'published' and l.is_public = true and (l.expires_at is null or l.expires_at > now())
  limit 1;
$$;

create policy "responses published insert" on public.question_responses for insert with check (
  recipient_token is not null
  and exists (select 1 from public.letter_questions q join public.letters l on l.id = q.letter_id where q.id = question_id and l.status = 'published' and l.is_public and (l.expires_at is null or l.expires_at > now()))
  and exists (select 1 from public.question_options o where o.id = option_id and o.question_id = question_id)
);

create or replace function public.link_letter_reply(parent_letter_id_input uuid, reply_letter_id_input uuid) returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Authentication is required to write a reply'; end if;
  if not exists (select 1 from public.letters where id = parent_letter_id_input and status = 'published' and is_public and allow_replies and (expires_at is null or expires_at > now())) then raise exception 'This letter is not accepting replies'; end if;
  if not exists (select 1 from public.letters where id = reply_letter_id_input and owner_id = auth.uid()) then raise exception 'You do not own this reply letter'; end if;
  insert into public.letter_relationships(parent_letter_id, reply_letter_id) values (parent_letter_id_input, reply_letter_id_input) on conflict (reply_letter_id) do nothing;
end;
$$;
grant execute on function public.link_letter_reply(uuid, uuid) to authenticated;

create or replace function public.note_letter_reply() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications(user_id, type, title, message, reference_id)
    select owner_id, 'reply', 'A reply arrived', 'Someone wrote back to your letter.', id from public.letters where id = new.parent_letter_id;
  return new;
end;
$$;
create trigger on_letter_reply_created after insert on public.letter_relationships for each row execute procedure public.note_letter_reply();
