// config.js — semua konstanta, resep, dan definisi hari untuk Ramen Rush.
// Satu file satu job: file ini hanya data, tanpa logika gambar atau input.

export const VIEW = { w: 1280, h: 800 };

// Palet: merah hangat kedai ramen + kayu + uap.
export const PALETTE = {
  bg: '#2b1610',
  wall: '#7a2e1d',
  wallDark: '#5c2113',
  wood: '#a05a2c',
  woodLight: '#c07f45',
  woodDark: '#6e3c1c',
  counter: '#8a4b26',
  counterTop: '#b06a38',
  cream: '#f7ead2',
  paper: '#fff6e3',
  ink: '#2b1610',
  red: '#c0392b',
  redBright: '#e74c3c',
  gold: '#f1c40f',
  green: '#27ae60',
  steam: 'rgba(255,255,255,0.55)',
};

export const BROTHS = {
  shoyu:  { name: 'Shoyu',  color: '#8a5a2b', price: 12, simmer: 4.0, desc: 'Kaldu ayam + kecap' },
  miso:   { name: 'Miso',   color: '#a86432', price: 14, simmer: 5.0, desc: 'Kaldu miso fermentasi' },
  tonkotsu:{ name: 'Tonkotsu',color: '#e8dcc0', price: 16, simmer: 6.0, desc: 'Kaldu tulang babi 12 jam' },
  tantanmen:{ name: 'Tantanmen', color: '#b3402a', price: 18, simmer: 5.5, desc: 'Pedas wijen + cabai' },
};

// Doneness mie: jendela timing (detik sejak mulai rebus) untuk tiap target.
export const NOODLE_TARGETS = {
  firm:   { name: 'Keras',   label: 'Firm',   perfect: [2.2, 3.0], good: [1.6, 3.6] },
  normal: { name: 'Pas',     label: 'Normal', perfect: [3.4, 4.4], good: [2.8, 5.0] },
  soft:   { name: 'Lembek',  label: 'Soft',   perfect: [4.8, 5.8], good: [4.2, 6.4] },
};

export const TOPPINGS = {
  egg:    { name: 'Telur Ajitama', color: '#f5d76e', price: 3, key: '1' },
  chashu: { name: 'Chashu',        color: '#c96f4a', price: 4, key: '2' },
  nori:   { name: 'Nori',          color: '#1e3d1e', price: 2, key: '3' },
  negi:   { name: 'Daun Bawang',   color: '#7fb069', price: 2, key: '4' },
  corn:   { name: 'Jagung',        color: '#ffd94d', price: 2, key: '5' },
  butter: { name: 'Mentega',       color: '#ffe9a3', price: 3, key: '6' },
};
export const TOPPING_KEYS = Object.keys(TOPPINGS);

// Resep per hari: kombinasi yang boleh muncul.
export const DAY_RECIPES = [
  // Hari 1 — Shoyu saja, 2 topping.
  [{ broth: 'shoyu', toppings: ['egg', 'negi'] },
   { broth: 'shoyu', toppings: ['chashu', 'nori'] },
   { broth: 'shoyu', toppings: ['egg', 'chashu'] }],
  // Hari 2 — + Miso.
  [{ broth: 'shoyu', toppings: ['egg', 'negi', 'corn'] },
   { broth: 'miso', toppings: ['chashu', 'negi'] },
   { broth: 'miso', toppings: ['corn', 'butter'] },
   { broth: 'shoyu', toppings: ['nori', 'chashu', 'egg'] }],
  // Hari 3 — + Tonkotsu.
  [{ broth: 'tonkotsu', toppings: ['egg', 'chashu', 'negi'] },
   { broth: 'miso', toppings: ['egg', 'corn', 'negi'] },
   { broth: 'tonkotsu', toppings: ['nori', 'butter'] },
   { broth: 'shoyu', toppings: ['chashu', 'corn', 'butter'] }],
  // Hari 4 — + Tantanmen.
  [{ broth: 'tantanmen', toppings: ['egg', 'negi', 'corn'] },
   { broth: 'tonkotsu', toppings: ['chashu', 'egg', 'nori'] },
   { broth: 'tantanmen', toppings: ['butter', 'corn'] },
   { broth: 'miso', toppings: ['chashu', 'negi', 'butter'] }],
  // Hari 5 — VIP: semua resep, 3-4 topping.
  [{ broth: 'tonkotsu', toppings: ['egg', 'chashu', 'nori', 'negi'] },
   { broth: 'tantanmen', toppings: ['egg', 'chashu', 'corn', 'butter'] },
   { broth: 'shoyu', toppings: ['egg', 'chashu', 'nori', 'corn'] },
   { broth: 'miso', toppings: ['egg', 'negi', 'corn', 'butter'] }],
];

export const DAYS = [
  { name: 'Hari 1 — Pembukaan', target: 60,  duration: 75, spawnEvery: 14, patience: 45, vip: false },
  { name: 'Hari 2 — Miso Debut', target: 90, duration: 80, spawnEvery: 12, patience: 42, vip: false },
  { name: 'Hari 3 — Tonkotsu', target: 120, duration: 85, spawnEvery: 11, patience: 40, vip: false },
  { name: 'Hari 4 — Pedas!', target: 150, duration: 90, spawnEvery: 10, patience: 38, vip: false },
  { name: 'Hari 5 — Kritikus VIP', target: 190, duration: 95, spawnEvery: 9, patience: 36, vip: true },
];

export const UPGRADES = [
  { id: 'pot',    name: 'Panci Cepat',   desc: 'Mie matang 25% lebih cepat', cost: 30, max: 2 },
  { id: 'patience', name: 'Kursi Nyaman', desc: 'Kesabaran pelanggan +8 dtk', cost: 25, max: 2 },
  { id: 'burner', name: 'Kompor Kedua',  desc: 'Rebus 2 porsi mie sekaligus', cost: 50, max: 1 },
  { id: 'broth',  name: 'Kaldu Siap Saji', desc: 'Kaldu matang 40% lebih cepat', cost: 35, max: 2 },
];

export const WIN_RATING_TARGET = 4.5;
export const START_REPUTATION = 3; // hati
export const TIP_PERFECT = 6;
export const TIP_FAST = 4;
export const COMBO_BONUS = 2;
