// input.js — mouse + keyboard untuk Ramen Rush.
// Hit-test semua zona klik (stasiun, topping, pelanggan, tombol) dan
// menerjemahkannya jadi aksi state. Tanpa gambar, tanpa logika skor.

import {
  startBroth, startNoodles, pullNoodles, startBowl, addNoodlesToBowl,
  addTopping, clearBowl, serveCustomer, buyUpgrade, nextDay, newGame, startDay,
} from './state.js';
import { BROTHS, TOPPINGS, TOPPING_KEYS, NOODLE_TARGETS, UPGRADES } from './config.js';

// Zona klik, dihitung dari layout render.js (koordinat canvas 1280x800).
export const ZONES = {
  brothPot: { x: 60, y: 300, w: 210, h: 170 },
  noodlePot0: { x: 300, y: 300, w: 210, h: 170 },
  noodlePot1: { x: 300, y: 300, w: 210, h: 170 }, // digeser saat burner kedua aktif
  toppingRow: { x: 540, y: 300, w: 400, h: 170 },
  bowl: { x: 970, y: 300, w: 250, h: 170 },
  serveBell: { x: 1120, y: 500, w: 110, h: 90 },
  customers: [
    { x: 90, y: 560, w: 180, h: 180 },
    { x: 330, y: 560, w: 180, h: 180 },
    { x: 570, y: 560, w: 180, h: 180 },
  ],
  startBtn: { x: 490, y: 560, w: 300, h: 70 },
  nextDayBtn: { x: 490, y: 600, w: 300, h: 70 },
  restartBtn: { x: 490, y: 560, w: 300, h: 70 },
  playAgainBtn: { x: 490, y: 640, w: 300, h: 70 },
};

export function inRect(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

function toppingAt(x, y) {
  const row = ZONES.toppingRow;
  if (!inRect(x, y, row)) return null;
  const idx = Math.floor((x - row.x) / (row.w / 6));
  return TOPPING_KEYS[Math.min(idx, 5)];
}

function brothAt(x, y) {
  // Empat tombol kaldu di atas panci kaldu.
  const keys = Object.keys(BROTHS);
  for (let i = 0; i < keys.length; i++) {
    const r = { x: 60 + i * 52, y: 268, w: 48, h: 28 };
    if (inRect(x, y, r)) return keys[i];
  }
  return null;
}

export function handleClick(g, x, y) {
  if (g.screen === 'title') {
    if (inRect(x, y, ZONES.startBtn)) { g.day = 0; g.coins = 0; startDay(g); }
    return;
  }
  if (g.screen === 'shop') {
    for (let i = 0; i < UPGRADES.length; i++) {
      const r = { x: 240, y: 250 + i * 78, w: 800, h: 64 };
      if (inRect(x, y, r)) { buyUpgrade(g, UPGRADES[i].id); return; }
    }
    if (inRect(x, y, ZONES.nextDayBtn)) nextDay(g);
    return;
  }
  if (g.screen === 'win' || g.screen === 'loss') {
    if (inRect(x, y, ZONES.playAgainBtn)) {
      const seed = g.seed;
      Object.assign(g, newGame(seed + 1));
      g.screen = 'title';
    }
    return;
  }
  if (g.screen !== 'playing') return;

  // 1. Pilih kaldu (tombol kecil di atas panci kaldu).
  const broth = brothAt(x, y);
  if (broth) {
    if (g.brothPot.status === 'idle') startBroth(g, broth);
    return;
  }
  // 2. Panci kaldu: klik = mulai rebus kaldu terpilih / ambil kalau ready.
  if (inRect(x, y, ZONES.brothPot)) {
    if (g.brothPot.status === 'idle') startBroth(g, g.brothPot.broth);
    else if (g.brothPot.status === 'ready') startBowl(g);
    return;
  }
  // 3. Panci mie: klik = mulai rebus (target = order pertama yang butuh mie)
  //    atau tarik mie kalau sedang merebus.
  const potZones = g.noodlePots.length > 1
    ? [{ x: 300, y: 300, w: 100, h: 170 }, { x: 410, y: 300, w: 100, h: 170 }]
    : [ZONES.noodlePot0];
  for (let i = 0; i < potZones.length; i++) {
    if (inRect(x, y, potZones[i])) {
      const pot = g.noodlePots[i];
      if (pot.status === 'boiling') pullNoodles(g, i);
      else if (pot.status === 'idle') {
        const target = g.customers[0] ? g.customers[0].order.noodle : 'normal';
        startNoodles(g, i, target);
      }
      return;
    }
  }
  // 4. Topping: klik bin topping.
  const top = toppingAt(x, y);
  if (top) { addTopping(g, top); return; }
  // 5. Mangkuk: klik = tuang mie yang dipegang ke mangkuk.
  if (inRect(x, y, ZONES.bowl)) {
    if (g.heldNoodles) addNoodlesToBowl(g);
    return;
  }
  // 6. Lonceng / pelanggan: sajikan mangkuk yang sudah lengkap.
  if (inRect(x, y, ZONES.serveBell)) {
    const c = g.customers.find((cc) => cc.order.toppings.length === (g.bowl ? g.bowl.toppings.length : -1));
    if (c && g.bowl) serveCustomer(g, c.id);
    return;
  }
  for (let i = 0; i < g.customers.length; i++) {
    if (inRect(x, y, ZONES.customers[g.customers[i].seat])) {
      if (g.bowl) serveCustomer(g, g.customers[i].id);
      return;
    }
  }
}

export function handleKey(g, key) {
  if (g.screen !== 'playing') {
    if ((key === 'Enter' || key === ' ') && g.screen === 'title') {
      g.day = 0; g.coins = 0; startDay(g);
    }
    if (key === 'Enter' && g.screen === 'shop') nextDay(g);
    return;
  }
  const k = key.toLowerCase();
  if (k === ' ') {
    // Spasi: tarik mie dari panci pertama yang sedang merebus.
    const idx = g.noodlePots.findIndex((p) => p.status === 'boiling');
    if (idx >= 0) pullNoodles(g, idx);
    else if (g.heldNoodles) addNoodlesToBowl(g);
    return;
  }
  if (k === 'b') { if (g.brothPot.status === 'ready') startBowl(g); else startBroth(g, g.brothPot.broth); return; }
  if (k === 'n') {
    const idx = g.noodlePots.findIndex((p) => p.status === 'idle');
    if (idx >= 0) {
      const target = g.customers[0] ? g.customers[0].order.noodle : 'normal';
      startNoodles(g, idx, target);
    }
    return;
  }
  if (k === 'c') { clearBowl(g); return; }
  // 1-6: topping. q/w/e/r: pilih kaldu.
  const topIdx = TOPPING_KEYS.findIndex((t) => TOPPINGS[t].key === k);
  if (topIdx >= 0) { addTopping(g, TOPPING_KEYS[topIdx]); return; }
  const brothKeys = Object.keys(BROTHS);
  const bIdx = ['q', 'w', 'e', 'r'].indexOf(k);
  if (bIdx >= 0 && g.brothPot.status === 'idle') startBroth(g, brothKeys[bIdx]);
}
