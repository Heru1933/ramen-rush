// state.js — seluruh state game Ramen Rush: pelanggan, order, panci, mangkuk,
// skor, hari, upgrade. Tanpa gambar, tanpa input: murni data + transisi.

import {
  BROTHS, NOODLE_TARGETS, TOPPINGS, DAY_RECIPES, DAYS,
  START_REPUTATION, TIP_PERFECT, TIP_FAST, COMBO_BONUS, UPGRADES,
} from './config.js';
import { mulberry32, pick, shuffle } from './random.js';

export function newGame(seed = 7) {
  return {
    seed,
    rng: mulberry32(seed),
    screen: 'title', // title | playing | shop | win | loss | dayEnd
    day: 0, // index 0..4
    dayTime: 0,
    coins: 0,
    dayEarnings: 0,
    totalServed: 0,
    totalPerfect: 0,
    combo: 0,
    bestCombo: 0,
    reputation: START_REPUTATION,
    rating: 5.0,
    ratings: [],
    customers: [], // {id, seat, order, patience, maxPatience, mood, vip, arrivedAt}
    nextCustomerId: 1,
    spawnTimer: 2,
    // Panci mie: {status:'idle'|'boiling'|'ready', t, target, quality, count}
    noodlePots: [newPot()],
    // Kaldu: {broth, status:'idle'|'simmering'|'ready', t}
    brothPot: { broth: 'shoyu', status: 'idle', t: 0 },
    // Mangkuk rakitan: {broth, noodleQuality, toppings:[], stage}
    bowl: null,
    heldNoodles: null, // {quality:'perfect'|'good'|'bad', target}
    message: '',
    messageT: 0,
    upgrades: { pot: 0, patience: 0, burner: 0, broth: 0 },
    stats: { served: 0, failed: 0, perfectBoils: 0 },
    time: 0,
    servedFlash: 0,
    vipServed: false,
  };
}

function newPot() {
  return { status: 'idle', t: 0, target: 'normal', quality: null };
}

export function dayConfig(g) { return DAYS[g.day]; }

export function noodleSpeed(g) {
  return 1 + 0.25 * g.upgrades.pot;
}
export function brothSpeed(g) {
  return 1 + 0.4 * g.upgrades.broth;
}
export function patienceBonus(g) {
  return 8 * g.upgrades.patience;
}

export function makeOrder(g, vip = false) {
  const rng = g.rng;
  const recipes = DAY_RECIPES[g.day];
  const r = pick(rng, recipes);
  const noodleTarget = pick(rng, Object.keys(NOODLE_TARGETS));
  const toppings = shuffle(rng, r.toppings);
  return {
    broth: r.broth,
    noodle: noodleTarget,
    toppings,
    vip,
    price: BROTHS[r.broth].price + toppings.reduce((s, t) => s + TOPPINGS[t].price, 0),
  };
}

export function spawnCustomer(g) {
  const day = dayConfig(g);
  const vip = day.vip && g.customers.length === 0 && g.totalServed >= 2 && !g.vipServed;
  const seat = freeSeat(g);
  if (seat === -1) return;
  const order = makeOrder(g, vip);
  const maxPatience = day.patience + patienceBonus(g) + (vip ? 15 : 0);
  g.customers.push({
    id: g.nextCustomerId++,
    seat,
    order,
    patience: maxPatience,
    maxPatience,
    mood: 'waiting',
    vip,
    bob: g.rng() * Math.PI * 2,
  });
}

export function freeSeat(g) {
  const used = new Set(g.customers.map((c) => c.seat));
  for (let i = 0; i < 3; i++) if (!used.has(i)) return i;
  return -1;
}

export function startDay(g) {
  g.screen = 'playing';
  g.dayTime = 0;
  g.dayEarnings = 0;
  g.customers = [];
  g.spawnTimer = 1.5;
  g.bowl = null;
  g.heldNoodles = null;
  g.noodlePots = [newPot()];
  if (g.upgrades.burner > 0) g.noodlePots.push(newPot());
  g.brothPot = { broth: 'shoyu', status: 'idle', t: 0 };
  g.message = DAYS[g.day].name;
  g.messageT = 2.5;
}

// --- Aksi pemain -----------------------------------------------------------

export function startBroth(g, broth) {
  if (g.brothPot.status !== 'idle') return false;
  g.brothPot = { broth, status: 'simmering', t: 0 };
  return true;
}

export function startNoodles(g, potIdx, target) {
  const pot = g.noodlePots[potIdx];
  if (!pot || pot.status !== 'idle') return false;
  pot.status = 'boiling';
  pot.t = 0;
  pot.target = target;
  pot.quality = null;
  return true;
}

// Tarik mie dari panci: kualitas ditentukan posisi jarum timing.
export function pullNoodles(g, potIdx) {
  const pot = g.noodlePots[potIdx];
  if (!pot || pot.status !== 'boiling') return null;
  const target = NOODLE_TARGETS[pot.target];
  const t = pot.t;
  let quality;
  if (t >= target.perfect[0] && t <= target.perfect[1]) quality = 'perfect';
  else if (t >= target.good[0] && t <= target.good[1]) quality = 'good';
  else quality = 'bad';
  pot.status = 'idle';
  pot.t = 0;
  if (quality === 'perfect') g.stats.perfectBoils++;
  g.heldNoodles = { quality, target: pot.target };
  return quality;
}

export function startBowl(g) {
  if (g.bowl) return false;
  if (g.brothPot.status !== 'ready') return false;
  g.bowl = { broth: g.brothPot.broth, noodleQuality: null, toppings: [], stage: 'broth' };
  g.brothPot = { broth: g.brothPot.broth, status: 'idle', t: 0 };
  return true;
}

export function addNoodlesToBowl(g) {
  if (!g.bowl || g.bowl.stage !== 'broth') return false;
  if (!g.heldNoodles) return false;
  g.bowl.noodleQuality = g.heldNoodles.quality;
  g.bowl.noodleTarget = g.heldNoodles.target;
  g.bowl.stage = 'noodles';
  g.heldNoodles = null;
  return true;
}

export function addTopping(g, topping) {
  if (!g.bowl || g.bowl.stage !== 'noodles') return false;
  if (g.bowl.toppings.includes(topping)) return false;
  g.bowl.toppings.push(topping);
  return true;
}

export function clearBowl(g) {
  g.bowl = null;
}

// Sajikan mangkuk ke pelanggan: cocokkan dengan ordernya.
export function serveCustomer(g, customerId) {
  const c = g.customers.find((x) => x.id === customerId);
  if (!c || !g.bowl) return null;
  const o = c.order;
  const b = g.bowl;
  const brothOk = b.broth === o.broth;
  const noodleOk = b.noodleTarget === o.noodle && b.noodleQuality !== 'bad';
  const noodlePerfect = noodleOk && b.noodleQuality === 'perfect';
  const toppingsOk = o.toppings.length === b.toppings.length &&
    o.toppings.every((t) => b.toppings.includes(t));
  // Urutan topping harus sama persis dengan tiket = presisi.
  const orderOk = toppingsOk && o.toppings.every((t, i) => b.toppings[i] === t);

  let result;
  if (brothOk && noodleOk && toppingsOk && orderOk) {
    const patienceRatio = c.patience / c.maxPatience;
    let tip = 0;
    if (noodlePerfect) tip += TIP_PERFECT;
    if (patienceRatio > 0.6) tip += TIP_FAST;
    g.combo += 1;
    g.bestCombo = Math.max(g.bestCombo, g.combo);
    tip += Math.min(g.combo - 1, 5) * COMBO_BONUS;
    const earned = o.price + tip;
    g.coins += earned;
    g.dayEarnings += earned;
    g.totalServed++;
    g.stats.served++;
    if (noodlePerfect) g.totalPerfect++;
    const stars = noodlePerfect && patienceRatio > 0.6 ? 5 : noodlePerfect || patienceRatio > 0.6 ? 4 : 3;
    g.ratings.push(stars);
    g.rating = g.ratings.reduce((a, b2) => a + b2, 0) / g.ratings.length;
    if (c.vip) g.vipServed = true;
    result = { ok: true, earned, tip, stars, perfect: noodlePerfect, message: `+${earned} koin${tip ? ` (tip ${tip})` : ''}` };
  } else {
    g.combo = 0;
    g.stats.failed++;
    const problems = [];
    if (!brothOk) problems.push('kaldu salah');
    if (!noodleOk) problems.push(b.noodleTarget === o.noodle ? 'mie kelewat matang' : 'tingkat kematangan mie salah');
    if (!toppingsOk) problems.push('topping tidak cocok');
    else if (!orderOk) problems.push('urutan topping salah');
    g.reputation -= 1;
    result = { ok: false, earned: 0, message: 'Ditolak: ' + problems.join(', ') };
  }
  g.customers = g.customers.filter((x) => x.id !== customerId);
  g.bowl = null;
  g.servedFlash = 1.2;
  g.message = result.message;
  g.messageT = 2.2;
  return result;
}

export function buyUpgrade(g, id) {
  const u = UPGRADES.find((x) => x.id === id);
  if (!u) return false;
  if (g.upgrades[id] >= u.max) return false;
  if (g.coins < u.cost) return false;
  g.coins -= u.cost;
  g.upgrades[id]++;
  if (id === 'burner' && g.noodlePots.length < 2) g.noodlePots.push(newPot());
  return true;
}

// --- Tick ------------------------------------------------------------------

export function tick(g, dt) {
  g.time += dt;
  if (g.screen !== 'playing') return;
  const day = dayConfig(g);
  g.dayTime += dt;
  if (g.messageT > 0) g.messageT -= dt;
  if (g.servedFlash > 0) g.servedFlash -= dt;

  // Spawn pelanggan.
  g.spawnTimer -= dt;
  if (g.spawnTimer <= 0 && g.customers.length < 3) {
    spawnCustomer(g);
    g.spawnTimer = day.spawnEvery * (0.85 + g.rng() * 0.3);
  }

  // Kaldu mendidih.
  const bp = g.brothPot;
  if (bp.status === 'simmering') {
    bp.t += dt * brothSpeed(g);
    if (bp.t >= BROTHS[bp.broth].simmer) bp.status = 'ready';
  }

  // Mie merebus (jarum timing jalan terus; lewat jendela good = gosong).
  for (const pot of g.noodlePots) {
    if (pot.status === 'boiling') {
      pot.t += dt * noodleSpeed(g);
      const target = NOODLE_TARGETS[pot.target];
      if (pot.t > target.good[1] + 1.2) {
        pot.status = 'idle';
        pot.t = 0;
        g.message = 'Mie gosong! Buang dan rebus lagi.';
        g.messageT = 2;
      }
    }
  }

  // Kesabaran pelanggan.
  for (const c of g.customers) {
    c.patience -= dt;
    c.mood = c.patience < c.maxPatience * 0.3 ? 'angry' : c.patience < c.maxPatience * 0.6 ? 'impatient' : 'waiting';
    if (c.patience <= 0) {
      g.customers = g.customers.filter((x) => x.id !== c.id);
      g.reputation -= 1;
      g.combo = 0;
      g.stats.failed++;
      g.ratings.push(1);
      g.rating = g.ratings.reduce((a, b) => a + b, 0) / g.ratings.length;
      g.message = 'Pelanggan pergi marah! Reputasi -1';
      g.messageT = 2.2;
    }
  }

  // Akhir hari.
  if (g.dayTime >= day.duration || g.reputation <= 0) {
    endDay(g);
  }
}

export function endDay(g) {
  g.customers = [];
  g.bowl = null;
  g.heldNoodles = null;
  if (g.reputation <= 0) {
    g.screen = 'loss';
    return;
  }
  const day = dayConfig(g);
  const passed = g.dayEarnings >= day.target;
  if (!passed) {
    g.screen = 'loss';
    g.lossReason = `Target hari ${g.day + 1} tidak tercapai (${g.dayEarnings}/${day.target} koin).`;
    return;
  }
  if (g.day >= DAYS.length - 1) {
    g.screen = 'win';
    return;
  }
  g.screen = 'shop';
}

export function nextDay(g) {
  g.day++;
  startDay(g);
}
