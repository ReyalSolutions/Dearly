-- Dearly initial schema. Run through the Supabase CLI or dashboard SQL editor.
-- This migration intentionally never uses an open-ended "USING (true)" policy on user data.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique check (username is null or username ~ '^[a-z0-9_]{3,30}$'),
  display_name text not null default '',
  avatar_url text,
  bio text check (char_length(bio) <= 500),
  allow_anonymous_letters boolean not null default true,
  allow_replies boolean not null default true,
  allow_reactions boolean not null default true,
  profile_visibility text not null default 'private' check (profile_visibility in ('public', 'private')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.letters (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled letter' check (char_length(title) between 1 and 150),
  recipient_name text check (char_length(recipient_name) <= 120),
  sender_name text check (char_length(sender_name) <= 120),
  category text not null default 'Custom' check (char_length(category) <= 60),
  content jsonb not null default '{}'::jsonb check (jsonb_typeof(content) = 'object'),
  theme text not null default 'romantic-rose' check (char_length(theme) <= 80),
  background_color text not null default '#fffdf9' check (background_color ~ '^#[0-9A-Fa-f]{6}$'),
  text_color text not null default '#3a2f32' check (text_color ~ '^#[0-9A-Fa-f]{6}$'),
  font_family text not null default 'Playfair Display' check (char_length(font_family) <= 80),
  font_size text not null default '18px' check (font_size in ('16px', '18px', '20px')),
  envelope jsonb not null default '{"color":"#ffb7c4"}'::jsonb check (jsonb_typeof(envelope) = 'object'),
  status text not null default 'draft' check (status in ('draft', 'published', 'scheduled', 'archived', 'expired')),
  share_slug text unique check (share_slug is null or share_slug ~ '^[A-Za-z0-9]{10,32}$'),
  is_public boolean not null default true,
  allow_reactions boolean not null default true,
  allow_replies boolean not null default true,
  track_opens boolean not null default true,
  show_sender boolean not null default true,
  allow_social_preview boolean not null default false,
  expires_at timestamptz,
  published_at timestamptz,
  open_count integer not null default 0 check (open_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint published_letter_has_slug check (status <> 'published' or (share_slug is not null and published_at is not null))
);
create index if not exists letters_owner_updated_idx on public.letters(owner_id, updated_at desc);
create index if not exists letters_public_slug_idx on public.letters(share_slug) where status = 'published';

create table if not exists public.letter_elements (
  id uuid primary key default gen_random_uuid(),
  letter_id uuid not null references public.letters(id) on delete cascade,
  element_type text not null check (element_type in ('text', 'image', 'sticker', 'shape', 'frame')),
  content text,
  asset_url text,
  x_position numeric(6,2) not null default 0 check (x_position between 0 and 100),
  y_position numeric(6,2) not null default 0 check (y_position between 0 and 100),
  width numeric(8,2) not null default 100 check (width > 0 and width <= 5000),
  height numeric(8,2) not null default 100 check (height > 0 and height <= 5000),
  rotation numeric(7,2) not null default 0 check (rotation between -360 and 360),
  z_index integer not null default 0 check (z_index between -100 and 100),
  opacity numeric(3,2) not null default 1 check (opacity between 0 and 1),
  styles jsonb not null default '{}'::jsonb check (jsonb_typeof(styles) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists letter_elements_letter_idx on public.letter_elements(letter_id, z_index);

create table if not exists public.letter_media (
  id uuid primary key default gen_random_uuid(),
  letter_id uuid not null references public.letters(id) on delete cascade,
  media_type text not null check (media_type in ('image', 'audio')),
  storage_path text not null,
  alt_text text check (char_length(alt_text) <= 250),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists letter_media_letter_idx on public.letter_media(letter_id, sort_order);

create table if not exists public.letter_reactions (
  id uuid primary key default gen_random_uuid(),
  letter_id uuid not null references public.letters(id) on delete cascade,
  reaction text not null check (reaction in ('❤️', '🥹', '😍', '😂', '😭')),
  recipient_token uuid not null,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (letter_id, reaction, recipient_token)
);
create index if not exists letter_reactions_letter_idx on public.letter_reactions(letter_id, created_at desc);

create table if not exists public.letter_views (
  id uuid primary key default gen_random_uuid(),
  letter_id uuid not null references public.letters(id) on delete cascade,
  viewer_hash uuid not null,
  opened_at timestamptz not null default now(),
  user_agent_category text not null check (user_agent_category in ('mobile', 'tablet', 'desktop', 'unknown')),
  unique (letter_id, viewer_hash)
);
create index if not exists letter_views_letter_idx on public.letter_views(letter_id, opened_at desc);

create table if not exists public.letter_questions (
  id uuid primary key default gen_random_uuid(),
  letter_id uuid not null references public.letters(id) on delete cascade,
  question text not null check (char_length(question) between 1 and 500),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.letter_questions(id) on delete cascade,
  label text not null check (char_length(label) between 1 and 160),
  position integer not null default 0
);
create table if not exists public.question_responses (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.letter_questions(id) on delete cascade,
  option_id uuid not null references public.question_options(id) on delete cascade,
  recipient_token uuid not null,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(question_id, recipient_token)
);

create table if not exists public.letter_relationships (
  id uuid primary key default gen_random_uuid(),
  parent_letter_id uuid not null references public.letters(id) on delete cascade,
  reply_letter_id uuid not null unique references public.letters(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (parent_letter_id <> reply_letter_id)
);

create table if not exists public.template_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,60}$'),
  name text not null unique check (char_length(name) <= 60),
  created_at timestamptz not null default now()
);
create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.template_categories(id) on delete set null,
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,80}$'),
  name text not null check (char_length(name) <= 100),
  description text not null default '' check (char_length(description) <= 500),
  preview jsonb not null default '{}'::jsonb,
  letter_defaults jsonb not null default '{}'::jsonb,
  is_featured boolean not null default false,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.template_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  template_id uuid not null references public.templates(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, template_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('letter_opened', 'reaction', 'reply', 'scheduled_published', 'system')),
  title text not null check (char_length(title) <= 160),
  message text not null check (char_length(message) <= 500),
  reference_id uuid,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications(user_id, is_read, created_at desc);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid references auth.users(id) on delete set null,
  reporter_token uuid,
  letter_share_slug text,
  reason text not null check (reason in ('Harassment', 'Spam', 'Threats', 'Sexual content', 'Impersonation', 'Other')),
  details text check (char_length(details) <= 1000),
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at timestamptz not null default now()
);
create index if not exists reports_open_idx on public.reports(status, created_at desc);

create table if not exists public.blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(blocker_id, blocked_id), check(blocker_id <> blocked_id)
);

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
drop trigger if exists set_updated_at on public.letters;
create trigger set_updated_at before update on public.letters for each row execute procedure public.set_updated_at();
drop trigger if exists set_updated_at on public.letter_elements;
create trigger set_updated_at before update on public.letter_elements for each row execute procedure public.set_updated_at();
drop trigger if exists set_updated_at on public.letter_questions;
create trigger set_updated_at before update on public.letter_questions for each row execute procedure public.set_updated_at();
drop trigger if exists set_updated_at on public.templates;
create trigger set_updated_at before update on public.templates for each row execute procedure public.set_updated_at();

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id, display_name, username)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)), null)
  on conflict (id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.note_letter_view() returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.letters set open_count = open_count + 1 where id = new.letter_id;
  insert into public.notifications(user_id, type, title, message, reference_id)
    select owner_id, 'letter_opened', 'Your letter was opened', 'Someone opened one of your letters.', id from public.letters where id = new.letter_id;
  return new;
end; $$;
drop trigger if exists on_letter_view_created on public.letter_views;
create trigger on_letter_view_created after insert on public.letter_views for each row execute procedure public.note_letter_view();

create or replace function public.note_reaction() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications(user_id, type, title, message, reference_id)
    select owner_id, 'reaction', 'A reaction arrived', 'Someone reacted ' || new.reaction || ' to your letter.', id from public.letters where id = new.letter_id;
  return new;
end; $$;
drop trigger if exists on_reaction_created on public.letter_reactions;
create trigger on_reaction_created after insert on public.letter_reactions for each row execute procedure public.note_reaction();

-- Public access is through this limited payload only; it intentionally excludes owner_id.
create or replace function public.get_public_letter(share_slug_input text) returns jsonb language sql security definer set search_path = public as $$
  select jsonb_build_object(
    'id', l.id, 'title', l.title, 'recipient_name', l.recipient_name, 'sender_name', case when l.show_sender then l.sender_name else null end,
    'content', l.content, 'background_color', l.background_color, 'text_color', l.text_color, 'font_family', l.font_family, 'envelope', l.envelope,
    'allow_reactions', l.allow_reactions, 'allow_replies', l.allow_replies, 'allow_social_preview', l.allow_social_preview, 'show_sender', l.show_sender,
    'letter_elements', coalesce((select jsonb_agg(jsonb_build_object('id', e.id, 'element_type', e.element_type, 'content', e.content, 'asset_url', e.asset_url, 'x_position', e.x_position, 'y_position', e.y_position, 'width', e.width, 'height', e.height, 'rotation', e.rotation, 'z_index', e.z_index, 'opacity', e.opacity, 'styles', e.styles) order by e.z_index) from public.letter_elements e where e.letter_id = l.id), '[]'::jsonb)
  ) from public.letters l where l.share_slug = share_slug_input and l.status = 'published' and l.is_public = true and (l.expires_at is null or l.expires_at > now()) limit 1;
$$;
grant execute on function public.get_public_letter(text) to anon, authenticated;

-- Storage policies cannot safely rely on the caller being able to select letters.
-- This narrow predicate only authorizes assets belonging to currently public letters.
create or replace function public.can_read_published_letter_asset(object_name text) returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.letters l
    where l.id::text = (storage.foldername(object_name))[2]
      and l.status = 'published' and l.is_public and (l.expires_at is null or l.expires_at > now())
  );
$$;
grant execute on function public.can_read_published_letter_asset(text) to anon, authenticated;

alter table public.profiles enable row level security;
alter table public.letters enable row level security;
alter table public.letter_elements enable row level security;
alter table public.letter_media enable row level security;
alter table public.letter_reactions enable row level security;
alter table public.letter_views enable row level security;
alter table public.letter_questions enable row level security;
alter table public.question_options enable row level security;
alter table public.question_responses enable row level security;
alter table public.letter_relationships enable row level security;
alter table public.template_categories enable row level security;
alter table public.templates enable row level security;
alter table public.template_favorites enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;
alter table public.blocks enable row level security;

create policy "profiles read own" on public.profiles for select using (auth.uid() = id);
create policy "profiles read public" on public.profiles for select using (profile_visibility = 'public');
create policy "profiles update own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "letters owner all" on public.letters for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "elements owner all" on public.letter_elements for all using (exists (select 1 from public.letters l where l.id = letter_id and l.owner_id = auth.uid())) with check (exists (select 1 from public.letters l where l.id = letter_id and l.owner_id = auth.uid()));
create policy "media owner all" on public.letter_media for all using (exists (select 1 from public.letters l where l.id = letter_id and l.owner_id = auth.uid())) with check (exists (select 1 from public.letters l where l.id = letter_id and l.owner_id = auth.uid()));
create policy "reactions owner read" on public.letter_reactions for select using (exists (select 1 from public.letters l where l.id = letter_id and l.owner_id = auth.uid()));
create policy "reactions published insert" on public.letter_reactions for insert with check (recipient_token is not null and exists (select 1 from public.letters l where l.id = letter_id and l.status = 'published' and l.is_public and l.allow_reactions and (l.expires_at is null or l.expires_at > now())));
create policy "views owner read" on public.letter_views for select using (exists (select 1 from public.letters l where l.id = letter_id and l.owner_id = auth.uid()));
create policy "views published insert" on public.letter_views for insert with check (exists (select 1 from public.letters l where l.id = letter_id and l.status = 'published' and l.is_public and l.track_opens and (l.expires_at is null or l.expires_at > now())));
create policy "questions owner all" on public.letter_questions for all using (exists (select 1 from public.letters l where l.id = letter_id and l.owner_id = auth.uid())) with check (exists (select 1 from public.letters l where l.id = letter_id and l.owner_id = auth.uid()));
create policy "options owner all" on public.question_options for all using (exists (select 1 from public.letter_questions q join public.letters l on l.id = q.letter_id where q.id = question_id and l.owner_id = auth.uid())) with check (exists (select 1 from public.letter_questions q join public.letters l on l.id = q.letter_id where q.id = question_id and l.owner_id = auth.uid()));
create policy "responses owner read" on public.question_responses for select using (exists (select 1 from public.letter_questions q join public.letters l on l.id = q.letter_id where q.id = question_id and l.owner_id = auth.uid()));
create policy "relationships owner read" on public.letter_relationships for select using (exists (select 1 from public.letters l where l.id in (parent_letter_id, reply_letter_id) and l.owner_id = auth.uid()));
create policy "relationships owner insert" on public.letter_relationships for insert with check (exists (select 1 from public.letters l where l.id = reply_letter_id and l.owner_id = auth.uid()));
create policy "categories public read" on public.template_categories for select using (true);
create policy "templates public read" on public.templates for select using (is_published);
create policy "favorites own all" on public.template_favorites for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "notifications own all" on public.notifications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "reports insert" on public.reports for insert with check (reason is not null and (reporter_user_id is null or reporter_user_id = auth.uid()));
create policy "blocks own all" on public.blocks for all using (auth.uid() = blocker_id) with check (auth.uid() = blocker_id);

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg','image/png','image/webp']),
       ('letter-images', 'letter-images', false, 8388608, array['image/jpeg','image/png','image/webp']),
       ('letter-audio', 'letter-audio', false, 10485760, array['audio/mpeg','audio/ogg','audio/wav']),
       ('letter-assets', 'letter-assets', false, 5242880, array['image/jpeg','image/png','image/webp']),
       ('template-assets', 'template-assets', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
create policy "avatars public read" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars own manage" on storage.objects for all using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "letter images own manage" on storage.objects for all using (bucket_id = 'letter-images' and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id = 'letter-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "published letter image read" on storage.objects for select using (bucket_id = 'letter-images' and public.can_read_published_letter_asset(name));
create policy "letter audio own manage" on storage.objects for all using (bucket_id = 'letter-audio' and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id = 'letter-audio' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "letter assets own manage" on storage.objects for all using (bucket_id = 'letter-assets' and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id = 'letter-assets' and (storage.foldername(name))[1] = auth.uid()::text);
