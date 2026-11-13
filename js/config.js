// ============================================
// WILDTRACK v2 — Configuration
// ============================================

const CONFIG = {
  MOVEBANK_API: 'https://www.movebank.org/movebank/service/direct-read',

  // ─── MOVEBANK CREDENTIALS (fill in your own) ─────────────────────────────
  // Go to https://www.movebank.org → Register → get a free account
  // Then enter your username/password in the login screen, OR fill here to auto-login:
  DEFAULT_USER: '',
  DEFAULT_PASS: '',
  // ─────────────────────────────────────────────────────────────────────────

  // Photo URLs for each species
  // To add your own photos: replace any URL below with a direct image link
  // Recommended: use Unsplash, Wikipedia Commons, or your own hosted images
  SPECIES_PHOTOS: {
    'Lion':              'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=400&q=80',
    'African Elephant':  'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=400&q=80',
    'Cheetah':           'https://images.unsplash.com/photo-1509220307011-3c83de0d72c2?w=400&q=80',
    'Giraffe':           'https://images.unsplash.com/photo-1547721064-da6cfb341d50?w=400&q=80',
    'Plains Zebra':      'https://images.unsplash.com/photo-1504173010664-32509107de85?w=400&q=80',
    'White Rhino':       'https://images.unsplash.com/photo-1598439210625-5067c578f3f6?w=400&q=80',
    'Hippopotamus':      'https://images.unsplash.com/photo-1551245738-dc310e89d8b4?w=400&q=80',
    'Wild Dog':          'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=400&q=80',
    'Leopard':           'https://images.unsplash.com/photo-1456926631375-92c8ce872def?w=400&q=80',
    'Wildebeest':        'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400&q=80',
    'Arctic Wolf':       'https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=400&q=80',
    'Grey Wolf':         'https://images.unsplash.com/photo-1564460576398-ef55d99548b2?w=400&q=80',
    'Bald Eagle':        'https://images.unsplash.com/photo-1611689342806-0863700ce1e4?w=400&q=80',
    'Jaguar':            'https://images.unsplash.com/photo-1551752534-14f8c12b9415?w=400&q=80',
    'Andean Condor':     'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400&q=80',
    'Puma':              'https://images.unsplash.com/photo-1497752531616-c3afd9760a11?w=400&q=80',
    'Grizzly Bear':      'https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=400&q=80',
    'Eurasian Lynx':     'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&q=80',
    'Brown Bear':        'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=400&q=80',
    'Red Deer':          'https://images.unsplash.com/photo-1484406566174-9da000fda645?w=400&q=80',
    'Amur Tiger':        'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=400&q=80',
    'Snow Leopard':      'https://images.unsplash.com/photo-1602491453631-e2a5ad90a131?w=400&q=80',
    'Asian Elephant':    'https://images.unsplash.com/photo-1551316679-9c6ae9dec224?w=400&q=80',
    'Giant Panda':       'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=400&q=80',
    'Orangutan':         'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=400&q=80',
    'Great White Shark': 'https://images.unsplash.com/photo-1560275619-4cc5fa59d3ae?w=400&q=80',
    'Humpback Whale':    'https://images.unsplash.com/photo-1568430462989-44163eb1752f?w=400&q=80',
    'Leatherback Turtle':'https://images.unsplash.com/photo-1591025207163-942350e47db2?w=400&q=80',
    'Bottlenose Dolphin':'https://images.unsplash.com/photo-1607153333879-c174d265f1d2?w=400&q=80',
    'Blue Whale':        'https://images.unsplash.com/photo-1547721064-da6cfb341d50?w=400&q=80',
    'Manta Ray':         'https://images.unsplash.com/photo-1544552866-d3ed42536cfd?w=400&q=80',
    'Polar Bear':        'https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=400&q=80',
    'Emperor Penguin':   'https://images.unsplash.com/photo-1551986782-d0169b3f8fa7?w=400&q=80',
    'Weddell Seal':      'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=400&q=80',
  },

  STUDIES: [
    { id: 1473348957, name: 'Lion – Serengeti',    emoji: '🦁', species: 'Lion', continent: 'Africa', color: '#ff6b35' },
    { id: 7101420516, name: 'Elephant – Kruger',   emoji: '🐘', species: 'African Elephant', continent: 'Africa', color: '#a0c4a0' },
    { id: 496295053,  name: 'Cheetah – Botswana',  emoji: '🐆', species: 'Cheetah', continent: 'Africa', color: '#ffd166' },
    { id: 8047089126, name: 'Wolf – Kivalliq',     emoji: '🐺', species: 'Arctic Wolf', continent: 'Americas', color: '#ffffff' },
    { id: 120,        name: 'Eagle – LifeTrack',   emoji: '🦅', species: 'Bald Eagle', continent: 'Americas', color: '#fdcb6e' },
    { id: 45309522,   name: 'Shark – U Miami',     emoji: '🦈', species: 'Great White Shark', continent: 'Ocean', color: '#0984e3' },
    { id: 7614384993, name: 'Penguin – Antarctica',emoji: '🐧', species: 'Emperor Penguin', continent: 'Antarctica', color: '#dfe6e9' },
  ],

  CONTINENTS: ['All', 'Africa', 'Americas', 'Asia', 'Europe', 'Ocean', 'Arctic', 'Antarctica'],

  MAX_POINTS: 200,
  PREDICT_STEPS: 12,
  ANIMATION_INTERVAL: 100,
};
