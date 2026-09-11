export const templateSeeds = [
  { slug: 'romantic-rose', name: 'Romantic Rose', category: 'Love', description: 'Soft petals and a warm, handwritten note.', bg: '#fff0f3', accent: '#ff9baa', font: 'Playfair Display', body: 'Every ordinary day feels a little more beautiful with you in it.' },
  { slug: 'vintage-memories', name: 'Vintage Memories', category: 'Anniversary', description: 'A timeless page for the moments you keep.', bg: '#f5eedf', accent: '#c9a66b', font: 'Cormorant Garamond', body: 'Some memories do not fade. They simply become part of who we are.' },
  { slug: 'pastel-love', name: 'Pastel Love', category: 'Confession', description: 'Dreamy color, gentle words, a little courage.', bg: '#eff1ff', accent: '#b9b4ed', font: 'Dancing Script', body: 'I have been carrying this little feeling around for a while.' },
  { slug: 'midnight-stars', name: 'Midnight Stars', category: 'Love', description: 'For a feeling as bright as the night sky.', bg: '#e9efff', accent: '#7594da', font: 'Playfair Display', body: 'Even the brightest stars have nothing on the way you light up my world.' },
  { slug: 'birthday-surprise', name: 'Birthday Surprise', category: 'Birthday', description: 'A joyful note with a confetti-worthy glow.', bg: '#fff6d9', accent: '#ffb347', font: 'Poppins', body: 'Today is all about you — and all the joy you bring.' },
  { slug: 'best-friends', name: 'Best Friends Forever', category: 'Friendship', description: 'The kind of letter that feels like a warm hug.', bg: '#e9faf5', accent: '#58c7a0', font: 'Caveat', body: 'Life is more fun, more honest, and much kinder with you beside me.' },
  { slug: 'graduation-wishes', name: 'Graduation Wishes', category: 'Graduation', description: 'Celebrate their next beautiful chapter.', bg: '#f0eff8', accent: '#8f85c9', font: 'Libre Baskerville', body: 'You worked for this moment. Take it in — you have earned every bit of it.' },
  { slug: 'minimal-elegance', name: 'Minimal Elegance', category: 'Professional', description: 'Quiet confidence, thoughtfully composed.', bg: '#fbfbfb', accent: '#abb3b8', font: 'Playfair Display', body: 'A few sincere words can say more than a room full of noise.' },
  { slug: 'thank-you', name: 'Thank You', category: 'Thank You', description: 'A gracious way to make appreciation tangible.', bg: '#f7f1e8', accent: '#cc9d61', font: 'Cormorant Garamond', body: 'Thank you for showing up with your kindness exactly when it mattered.' },
  { slug: 'im-sorry', name: "I'm Sorry", category: 'Sorry', description: 'An honest space for finding your way back.', bg: '#f4f6f7', accent: '#8ca3ad', font: 'Playfair Display', body: 'I have been thinking about the hurt I caused, and I am truly sorry.' },
];

export const categories = [
  ['Love', 'heart-fill', '#fff0f3'], ['Confession', 'chat-heart-fill', '#fff1e5'], ['Birthday', 'balloon-heart-fill', '#fff6d9'], ['Anniversary', 'stars', '#f0efff'],
  ['Friendship', 'people-fill', '#e9faf5'], ['Thank You', 'hand-thumbs-up-fill', '#fff3db'], ['Sorry', 'arrow-counterclockwise', '#eaf3f8'], ['Graduation', 'mortarboard-fill', '#f0efff'],
  ['Motivation', 'sun-fill', '#fff8dc'], ['Holiday', 'gift-fill', '#eff8ed'], ['Professional', 'briefcase-fill', '#edf4fb'], ['Custom', 'palette-fill', '#fff0f3'],
];

export const themes = templateSeeds.map(({ name, bg, accent, font, slug }) => ({ name, bg, accent, font, slug }));
