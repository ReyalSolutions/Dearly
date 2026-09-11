insert into public.template_categories (slug, name) values
  ('love', 'Love'), ('confession', 'Confession'), ('birthday', 'Birthday'), ('anniversary', 'Anniversary'), ('friendship', 'Friendship'), ('thank-you', 'Thank You'), ('sorry', 'Sorry'), ('graduation', 'Graduation'), ('professional', 'Professional')
on conflict (slug) do nothing;

insert into public.templates (category_id, slug, name, description, preview, letter_defaults, is_featured)
select c.id, s.slug, s.name, s.description, s.preview::jsonb, s.defaults::jsonb, true
from (values
  ('love','romantic-rose','Romantic Rose','Soft petals and a warm, handwritten note.','{"background":"#fff0f3","accent":"#ff9baa"}','{"theme":"romantic-rose","font_family":"Playfair Display"}'),
  ('anniversary','vintage-memories','Vintage Memories','A timeless page for the moments you keep.','{"background":"#f5eedf","accent":"#c9a66b"}','{"theme":"vintage-memories","font_family":"Cormorant Garamond"}'),
  ('confession','pastel-love','Pastel Love','Dreamy color, gentle words, a little courage.','{"background":"#eff1ff","accent":"#b9b4ed"}','{"theme":"pastel-love","font_family":"Dancing Script"}'),
  ('love','midnight-stars','Midnight Stars','For a feeling as bright as the night sky.','{"background":"#e9efff","accent":"#7594da"}','{"theme":"midnight-stars","font_family":"Playfair Display"}'),
  ('birthday','birthday-surprise','Birthday Surprise','A joyful note with a confetti-worthy glow.','{"background":"#fff6d9","accent":"#ffb347"}','{"theme":"birthday-surprise","font_family":"Poppins"}'),
  ('friendship','best-friends','Best Friends Forever','The kind of letter that feels like a warm hug.','{"background":"#e9faf5","accent":"#58c7a0"}','{"theme":"best-friends","font_family":"Caveat"}'),
  ('graduation','graduation-wishes','Graduation Wishes','Celebrate their next beautiful chapter.','{"background":"#f0eff8","accent":"#8f85c9"}','{"theme":"graduation-wishes","font_family":"Libre Baskerville"}'),
  ('professional','minimal-elegance','Minimal Elegance','Quiet confidence, thoughtfully composed.','{"background":"#fbfbfb","accent":"#abb3b8"}','{"theme":"minimal-elegance","font_family":"Playfair Display"}'),
  ('thank-you','thank-you','Thank You','A gracious way to make appreciation tangible.','{"background":"#f7f1e8","accent":"#cc9d61"}','{"theme":"thank-you","font_family":"Cormorant Garamond"}'),
  ('sorry','im-sorry','I''m Sorry','An honest space for finding your way back.','{"background":"#f4f6f7","accent":"#8ca3ad"}','{"theme":"im-sorry","font_family":"Playfair Display"}')
) as s(category_slug, slug, name, description, preview, defaults)
join public.template_categories c on c.slug = s.category_slug
on conflict (slug) do update set name = excluded.name, description = excluded.description, preview = excluded.preview, letter_defaults = excluded.letter_defaults;
