// render.js — semua gambar canvas 2D Ramen Rush: kedai, papan order,
// stasiun masak, mangkuk ramen, pelanggan, HUD. Orisinal, digambar vektor.

import { PALETTE, BROTHS, TOPPINGS, TOPPING_KEYS, NOODLE_TARGETS, DAYS, UPGRADES } from './config.js';
import { ZONES, inRect } from './input.js';

const C = PALETTE;

export function drawGame(ctx, g, mouse) {
  ctx.clearRect(0, 0, 1280, 800);
  drawWall(ctx, g);
  if (g.screen === 'title') return drawTitle(ctx, g);
  if (g.screen === 'shop') return drawShop(ctx, g);
  if (g.screen === 'win') return drawEnd(ctx, g, true);
  if (g.screen === 'loss') return drawEnd(ctx, g, false);
  drawHUD(ctx, g);
  drawOrderBoard(ctx, g);
  drawStations(ctx, g, mouse);
  drawCustomers(ctx, g);
  drawMessage(ctx, g);
}

function drawWall(ctx, g) {
  // Dinding kedai + tirai noren + lampu lampion.
  ctx.fillStyle = C.wall;
  ctx.fillRect(0, 0, 1280, 800);
  ctx.fillStyle = C.wallDark;
  ctx.fillRect(0, 0, 1280, 60);
  // Papan kayu horizontal.
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  for (let y = 120; y < 260; y += 34) ctx.fillRect(0, y, 1280, 3);
  // Lampion merah.
  for (const x of [120, 640, 1160]) drawLantern(ctx, x, 30, g.time);
  // Tirai noren.
  ctx.fillStyle = '#e8dcc0';
  ctx.fillRect(500, 0, 280, 58);
  ctx.fillStyle = C.red;
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ラーメン', 640, 38);
  ctx.fillStyle = C.ink;
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('RAMEN RUSH', 640, 56);
}

function drawLantern(ctx, x, y, t) {
  const sway = Math.sin(t * 1.2 + x) * 2;
  ctx.save();
  ctx.translate(x + sway, y);
  ctx.strokeStyle = '#3a1508';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(0, 0); ctx.stroke();
  ctx.fillStyle = C.redBright;
  ctx.beginPath(); ctx.ellipse(0, 14, 26, 20, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,220,120,0.85)';
  ctx.beginPath(); ctx.ellipse(0, 14, 18, 13, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = C.ink;
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('麺', 0, 19);
  ctx.restore();
}

function drawTitle(ctx, g) {
  // Uap besar + mangkuk hero + judul.
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(0, 60, 1280, 740);
  drawSteam(ctx, 640, 430, g.time, 10);
  drawRamenBowl(ctx, 640, 470, 190, 'shoyu', 'perfect', ['egg', 'chashu', 'nori', 'negi'], g.time);
  ctx.textAlign = 'center';
  ctx.fillStyle = C.gold;
  ctx.font = 'bold 84px sans-serif';
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 18;
  ctx.fillText('RAMEN RUSH', 640, 210);
  ctx.shadowBlur = 0;
  ctx.fillStyle = C.cream;
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText('Kedai Ramen Paling Sibuk di Kota', 640, 255);
  ctx.font = '20px sans-serif';
  ctx.fillStyle = '#ffd9a0';
  ctx.fillText('Rebus mie dengan timing sempurna · Rakit sesuai tiket · Sajikan sebelum pelanggan pergi', 640, 300);
  // Tombol mulai.
  const b = ZONES.startBtn;
  ctx.fillStyle = C.redBright;
  roundRect(ctx, b.x, b.y, b.w, b.h, 14); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 30px sans-serif';
  ctx.fillText('▶  BUKA KEDAI', 640, b.y + 46);
  ctx.font = '17px sans-serif';
  ctx.fillStyle = C.cream;
  ctx.fillText('Klik / Enter untuk mulai · 5 hari · Kritikus VIP di hari terakhir', 640, 670);
  ctx.fillText('Kontrol: klik stasiun · Spasi = tarik mie · B = kaldu · 1-6 = topping · Q/W/E/R = pilih kaldu', 640, 700);
}

function drawHUD(ctx, g) {
  const day = DAYS[g.day];
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(0, 60, 1280, 46);
  ctx.textAlign = 'left';
  ctx.fillStyle = C.cream;
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText(day.name, 20, 90);
  ctx.fillStyle = C.gold;
  ctx.fillText(`🪙 ${g.coins} koin`, 300, 90);
  ctx.fillStyle = C.cream;
  ctx.fillText(`Hari ini: ${g.dayEarnings}/${day.target}`, 470, 90);
  // Timer hari.
  const remain = Math.max(0, day.duration - g.dayTime);
  ctx.fillStyle = '#333';
  roundRect(ctx, 700, 70, 220, 22, 8); ctx.fill();
  ctx.fillStyle = remain < 15 ? C.redBright : C.green;
  roundRect(ctx, 700, 70, 220 * (remain / day.duration), 22, 8); ctx.fill();
  ctx.fillStyle = C.cream;
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(`⏱ ${Math.ceil(remain)} dtk`, 930, 88);
  // Reputasi (hati) + rating + combo.
  let hx = 1060;
  ctx.font = '22px sans-serif';
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i < g.reputation ? '#ff5b6a' : 'rgba(255,255,255,0.25)';
    ctx.fillText('♥', hx + i * 28, 90);
  }
  ctx.fillStyle = C.gold;
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText(`★ ${g.rating.toFixed(1)}`, 1150, 90);
  if (g.combo >= 2) {
    ctx.fillStyle = '#ff9f1c';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`🔥 COMBO x${g.combo}`, 700, 130);
  }
}

function drawOrderBoard(ctx, g) {
  // Papan order kayu di atas dapur.
  ctx.fillStyle = C.woodDark;
  roundRect(ctx, 40, 116, 1200, 140, 10); ctx.fill();
  ctx.fillStyle = C.woodLight;
  roundRect(ctx, 46, 122, 1188, 128, 8); ctx.fill();
  ctx.fillStyle = C.ink;
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('📋 PAPAN ORDER', 60, 146);
  if (g.customers.length === 0) {
    ctx.fillStyle = 'rgba(43,22,16,0.6)';
    ctx.font = '18px sans-serif';
    ctx.fillText('Belum ada pelanggan… sebentar lagi datang!', 60, 200);
  }
  g.customers.forEach((c, i) => {
    const x = 60 + i * 290;
    drawTicket(ctx, c, x, 152, g);
  });
}

function drawTicket(ctx, c, x, y, g) {
  const o = c.order;
  ctx.fillStyle = c.vip ? '#ffe9a3' : C.paper;
  roundRect(ctx, x, y, 270, 92, 8); ctx.fill();
  ctx.strokeStyle = c.vip ? C.gold : '#d8c49a';
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, 270, 92, 8); ctx.stroke();
  ctx.fillStyle = C.ink;
  ctx.textAlign = 'left';
  ctx.font = 'bold 16px sans-serif';
  const title = c.vip ? `👑 VIP KRITIKUS #${c.id}` : `Pelanggan #${c.id}`;
  ctx.fillText(title, x + 10, y + 22);
  ctx.font = '15px sans-serif';
  ctx.fillStyle = BROTHS[o.broth].color === '#e8dcc0' ? '#7a5a2b' : BROTHS[o.broth].color;
  ctx.fillText(`🍜 ${BROTHS[o.broth].name} · Mie ${NOODLE_TARGETS[o.noodle].name}`, x + 10, y + 44);
  ctx.fillStyle = C.ink;
  ctx.fillText(`+ ${o.toppings.map((t) => TOPPINGS[t].name).join(' → ')}`, x + 10, y + 64);
  // Bar kesabaran.
  const ratio = Math.max(0, c.patience / c.maxPatience);
  ctx.fillStyle = '#ddd';
  roundRect(ctx, x + 10, y + 74, 250, 10, 5); ctx.fill();
  ctx.fillStyle = ratio > 0.6 ? C.green : ratio > 0.3 ? '#f39c12' : C.redBright;
  roundRect(ctx, x + 10, y + 74, 250 * ratio, 10, 5); ctx.fill();
}

function drawStations(ctx, g, mouse) {
  // Meja dapur panjang.
  ctx.fillStyle = C.counter;
  roundRect(ctx, 40, 290, 1200, 200, 12); ctx.fill();
  ctx.fillStyle = C.counterTop;
  roundRect(ctx, 40, 290, 1200, 26, 12); ctx.fill();

  drawBrothPot(ctx, g, mouse);
  drawNoodlePots(ctx, g, mouse);
  drawToppingRow(ctx, g, mouse);
  drawBowlStation(ctx, g, mouse);
  drawServeBell(ctx, g);
}

function drawBrothPot(ctx, g, mouse) {
  const r = ZONES.brothPot;
  ctx.textAlign = 'left';
  // Tombol pilih kaldu.
  Object.keys(BROTHS).forEach((k, i) => {
    const b = { x: 60 + i * 52, y: 268, w: 48, h: 28 };
    ctx.fillStyle = g.brothPot.broth === k ? BROTHS[k].color : 'rgba(255,255,255,0.25)';
    roundRect(ctx, b.x, b.y, b.w, b.h, 6); ctx.fill();
    ctx.fillStyle = g.brothPot.broth === k ? '#fff' : C.cream;
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(BROTHS[k].name.slice(0, 4), b.x + 5, b.y + 18);
  });
  // Panci.
  ctx.fillStyle = '#3d3d3d';
  roundRect(ctx, r.x + 15, r.y + 30, 180, 110, 16); ctx.fill();
  ctx.fillStyle = '#555';
  roundRect(ctx, r.x + 15, r.y + 30, 180, 22, 12); ctx.fill();
  const bp = g.brothPot;
  if (bp.status === 'simmering') {
    const ratio = Math.min(1, bp.t / BROTHS[bp.broth].simmer);
    ctx.fillStyle = BROTHS[bp.broth].color;
    ctx.beginPath(); ctx.ellipse(r.x + 105, r.y + 52, 78, 14, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.cream;
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${BROTHS[bp.broth].name} ${Math.round(ratio * 100)}%`, r.x + 105, r.y + 100);
    drawSteam(ctx, r.x + 105, r.y + 30, g.time, 4);
  } else if (bp.status === 'ready') {
    ctx.fillStyle = BROTHS[bp.broth].color;
    ctx.beginPath(); ctx.ellipse(r.x + 105, r.y + 52, 78, 14, 0, 0, Math.PI * 2); ctx.fill();
    drawSteam(ctx, r.x + 105, r.y + 30, g.time, 5);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✓ SIAP — klik untuk tuang', r.x + 105, r.y + 100);
  } else {
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Klik: rebus kaldu', r.x + 105, r.y + 90);
  }
  ctx.fillStyle = C.cream;
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🍲 KALDU', r.x + 105, r.y + 160);
}

function drawNoodlePots(ctx, g, mouse) {
  const pots = g.noodlePots;
  pots.forEach((pot, i) => {
    const w = pots.length > 1 ? 100 : 210;
    const x = pots.length > 1 ? 300 + i * 110 : 300;
    const r = { x, y: 300, w, h: 170 };
    ctx.fillStyle = '#3d3d3d';
    roundRect(ctx, r.x + 8, r.y + 30, r.w - 16, 110, 16); ctx.fill();
    ctx.fillStyle = '#555';
    roundRect(ctx, r.x + 8, r.y + 30, r.w - 16, 22, 12); ctx.fill();
    ctx.textAlign = 'center';
    if (pot.status === 'boiling') {
      // Air mendidih + jarum timing.
      ctx.fillStyle = '#7fb3d5';
      ctx.beginPath(); ctx.ellipse(r.x + r.w / 2, r.y + 52, (r.w - 32) / 2, 13, 0, 0, Math.PI * 2); ctx.fill();
      drawSteam(ctx, r.x + r.w / 2, r.y + 30, g.time + i, 3);
      drawTimingBar(ctx, r.x + 10, r.y + 82, r.w - 20, pot);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(`Mie ${NOODLE_TARGETS[pot.target].name} — klik/SPASI tarik!`, r.x + r.w / 2, r.y + 128);
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '14px sans-serif';
      ctx.fillText('Klik: rebus mie', r.x + r.w / 2, r.y + 90);
    }
    ctx.fillStyle = C.cream;
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(pots.length > 1 ? `🍝 MIE ${i + 1}` : '🍝 MIE — TIMING!', r.x + r.w / 2, r.y + 160);
  });
  if (g.heldNoodles) {
    ctx.fillStyle = '#ffe9a3';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Mie di tangan: ${g.heldNoodles.quality === 'perfect' ? '✨ SEMPURNA' : g.heldNoodles.quality === 'good' ? 'Bagus' : 'Kelembekan!'} — klik mangkuk`, 410, 505);
  }
}

function drawTimingBar(ctx, x, y, w, pot) {
  const target = NOODLE_TARGETS[pot.target];
  const maxT = target.good[1] + 1.5;
  // Zona: abu (jelek) — kuning (good) — hijau (perfect).
  ctx.fillStyle = '#666';
  roundRect(ctx, x, y, w, 16, 6); ctx.fill();
  ctx.fillStyle = '#f1c40f';
  ctx.fillRect(x + (target.good[0] / maxT) * w, y, ((target.good[1] - target.good[0]) / maxT) * w, 16);
  ctx.fillStyle = '#2ecc71';
  ctx.fillRect(x + (target.perfect[0] / maxT) * w, y, ((target.perfect[1] - target.perfect[0]) / maxT) * w, 16);
  // Jarum.
  const nx = x + Math.min(1, pot.t / maxT) * w;
  ctx.fillStyle = '#fff';
  ctx.fillRect(nx - 2, y - 5, 4, 26);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.strokeRect(nx - 2, y - 5, 4, 26);
}

function drawToppingRow(ctx, g, mouse) {
  const row = ZONES.toppingRow;
  ctx.textAlign = 'center';
  ctx.fillStyle = C.cream;
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('🥚 TOPPING (klik, urutan sesuai tiket!)', row.x + row.w / 2, row.y + 160);
  TOPPING_KEYS.forEach((k, i) => {
    const bx = row.x + i * 67;
    const by = row.y + 30;
    const inBowl = g.bowl && g.bowl.toppings.includes(k);
    ctx.fillStyle = inBowl ? '#2ecc71' : '#f5e6c8';
    roundRect(ctx, bx, by, 60, 60, 10); ctx.fill();
    ctx.strokeStyle = '#8a6d3b';
    ctx.lineWidth = 2;
    roundRect(ctx, bx, by, 60, 60, 10); ctx.stroke();
    drawToppingIcon(ctx, k, bx + 30, by + 26);
    ctx.fillStyle = C.ink;
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(TOPPINGS[k].name.split(' ')[0], bx + 30, by + 52);
    ctx.fillStyle = '#888';
    ctx.font = '10px sans-serif';
    ctx.fillText(`[${TOPPINGS[k].key}]`, bx + 30, by + 72);
  });
}

function drawToppingIcon(ctx, k, x, y) {
  ctx.save();
  ctx.translate(x, y);
  if (k === 'egg') {
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(0, 0, 14, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f5b041'; ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill();
  } else if (k === 'chashu') {
    ctx.fillStyle = '#c96f4a'; ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e8a87c'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#a04000'; ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill();
  } else if (k === 'nori') {
    ctx.fillStyle = '#1e3d1e'; ctx.fillRect(-11, -13, 22, 26);
    ctx.fillStyle = '#2e5d2e'; ctx.fillRect(-8, -10, 16, 20);
  } else if (k === 'negi') {
    ctx.fillStyle = '#7fb069';
    for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.arc(i * 8, 0, 4, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#fff';
    for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.arc(i * 8, 0, 1.5, 0, Math.PI * 2); ctx.fill(); }
  } else if (k === 'corn') {
    ctx.fillStyle = '#ffd94d';
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(-10 + i * 5, (i % 2) * 6 - 3, 3.5, 0, Math.PI * 2); ctx.fill(); }
  } else if (k === 'butter') {
    ctx.fillStyle = '#ffe9a3'; ctx.fillRect(-11, -7, 22, 14);
    ctx.fillStyle = '#f5d76e'; ctx.fillRect(-11, -7, 22, 5);
  }
  ctx.restore();
}

function drawBowlStation(ctx, g, mouse) {
  const r = ZONES.bowl;
  ctx.textAlign = 'center';
  if (!g.bowl) {
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '15px sans-serif';
    ctx.fillText('Mangkuk kosong', r.x + r.w / 2, r.y + 80);
    ctx.fillText('Tuang kaldu siap dulu', r.x + r.w / 2, r.y + 102);
  } else {
    const b = g.bowl;
    drawRamenBowl(ctx, r.x + r.w / 2, r.y + 88, 62, b.broth, b.noodleQuality, b.toppings, g.time);
    ctx.fillStyle = C.cream;
    ctx.font = 'bold 14px sans-serif';
    const need = g.customers[0] ? g.customers[0].order : null;
    if (b.stage === 'broth') ctx.fillText('Kaldu dituang — tambah mie!', r.x + r.w / 2, r.y + 132);
    else ctx.fillText(`Topping: ${b.toppings.length} ditambah`, r.x + r.w / 2, r.y + 132);
    if (need) {
      const ok = b.toppings.length === need.toppings.length;
      ctx.fillStyle = ok ? '#2ecc71' : C.gold;
      ctx.fillText(ok ? '✓ Lengkap — SAJIKAN!' : `Butuh ${need.toppings.length} topping`, r.x + r.w / 2, r.y + 150);
    }
  }
  ctx.fillStyle = C.cream;
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('🍜 MANGKUK RAKITAN', r.x + r.w / 2, r.y + 172);
}

function drawServeBell(ctx, g) {
  const r = ZONES.serveBell;
  ctx.fillStyle = C.gold;
  roundRect(ctx, r.x, r.y, r.w, r.h, 12); ctx.fill();
  ctx.fillStyle = C.ink;
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🔔', r.x + r.w / 2, r.y + 34);
  ctx.fillText('SAJIKAN', r.x + r.w / 2, r.y + 58);
  ctx.font = '12px sans-serif';
  ctx.fillText('klik pelanggan', r.x + r.w / 2, r.y + 76);
}

function drawCustomers(ctx, g) {
  // Tiga kursi pelanggan di bawah dapur.
  for (let seat = 0; seat < 3; seat++) {
    const z = ZONES.customers[seat];
    const c = g.customers.find((cc) => cc.seat === seat);
    // Kursi + meja kecil.
    ctx.fillStyle = '#5c3317';
    ctx.fillRect(z.x + 20, z.y + 120, 140, 14);
    ctx.fillStyle = C.wood;
    ctx.fillRect(z.x + 10, z.y + 134, 160, 10);
    if (!c) {
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.font = '15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('kursi kosong', z.x + 90, z.y + 100);
      continue;
    }
    const bob = Math.sin(g.time * 2 + c.bob) * 3;
    const cx = z.x + 90;
    const cy = z.y + 70 + bob;
    // Badan + kepala (karakter orisinal sederhana).
    const shirt = c.vip ? '#2c3e50' : ['#e67e22', '#3498db', '#9b59b6'][c.id % 3];
    ctx.fillStyle = shirt;
    roundRect(ctx, cx - 34, cy + 10, 68, 56, 14); ctx.fill();
    ctx.fillStyle = '#f5c99b';
    ctx.beginPath(); ctx.arc(cx, cy - 12, 24, 0, Math.PI * 2); ctx.fill();
    // Rambut.
    ctx.fillStyle = c.vip ? '#888' : ['#2b1610', '#6e3c1c', '#111'][c.id % 3];
    ctx.beginPath(); ctx.arc(cx, cy - 20, 24, Math.PI, 0); ctx.fill();
    if (c.vip) { ctx.fillStyle = C.gold; ctx.fillRect(cx - 14, cy - 40, 28, 6); }
    // Mata + mulut sesuai mood.
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.arc(cx - 8, cy - 12, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 8, cy - 12, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (c.mood === 'angry') { ctx.moveTo(cx - 8, cy + 2); ctx.lineTo(cx + 8, cy - 2); }
    else if (c.mood === 'impatient') { ctx.moveTo(cx - 7, cy + 1); ctx.lineTo(cx + 7, cy + 1); }
    else { ctx.arc(cx, cy - 2, 7, 0.15 * Math.PI, 0.85 * Math.PI); }
    ctx.stroke();
    // Gelembung order mini.
    ctx.fillStyle = 'rgba(255,246,227,0.95)';
    roundRect(ctx, cx - 70, z.y - 6, 140, 30, 8); ctx.fill();
    ctx.fillStyle = C.ink;
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${BROTHS[c.order.broth].name} · ${NOODLE_TARGETS[c.order.noodle].name}`, cx, z.y + 13);
  }
  if (g.servedFlash > 0) {
    ctx.fillStyle = `rgba(46,204,113,${Math.min(1, g.servedFlash)})`;
    ctx.font = 'bold 34px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✦ TERIMA KASIH! ✦', 640, 740);
  }
}

function drawMessage(ctx, g) {
  if (g.messageT <= 0 || !g.message) return;
  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  roundRect(ctx, 340, 510, 600, 40, 10); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 19px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(g.message, 640, 537);
}

function drawShop(ctx, g) {
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(0, 60, 1280, 740);
  ctx.textAlign = 'center';
  ctx.fillStyle = C.gold;
  ctx.font = 'bold 44px sans-serif';
  ctx.fillText(`Hari ${g.day + 1} Selesai!`, 640, 150);
  ctx.fillStyle = C.cream;
  ctx.font = '22px sans-serif';
  ctx.fillText(`Penghasilan hari ini: ${g.dayEarnings} koin · Total koin: ${g.coins} · Rating: ★ ${g.rating.toFixed(1)}`, 640, 195);
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('🛒 TOKO UPGRADE — klik untuk beli', 640, 235);
  UPGRADES.forEach((u, i) => {
    const y = 250 + i * 78;
    const lvl = g.upgrades[u.id];
    const maxed = lvl >= u.max;
    const afford = g.coins >= u.cost && !maxed;
    ctx.fillStyle = afford ? '#f5e6c8' : 'rgba(245,230,200,0.45)';
    roundRect(ctx, 240, y, 800, 64, 10); ctx.fill();
    ctx.fillStyle = C.ink;
    ctx.textAlign = 'left';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`${u.name}  ${'●'.repeat(lvl)}${'○'.repeat(u.max - lvl)}`, 260, y + 27);
    ctx.font = '16px sans-serif';
    ctx.fillText(u.desc, 260, y + 50);
    ctx.textAlign = 'right';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = maxed ? '#888' : afford ? C.red : '#a33';
    ctx.fillText(maxed ? 'MAX' : `${u.cost} koin`, 1020, y + 38);
  });
  const b = ZONES.nextDayBtn;
  ctx.fillStyle = C.redBright;
  roundRect(ctx, b.x, b.y, b.w, b.h, 14); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`▶  LANJUT HARI ${g.day + 2}`, 640, b.y + 45);
}

function drawEnd(ctx, g, won) {
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 60, 1280, 740);
  ctx.textAlign = 'center';
  if (won) {
    drawSteam(ctx, 640, 420, g.time, 8);
    drawRamenBowl(ctx, 640, 460, 150, 'tonkotsu', 'perfect', ['egg', 'chashu', 'nori', 'negi'], g.time);
    ctx.fillStyle = C.gold;
    ctx.font = 'bold 64px sans-serif';
    ctx.fillText('🏆 KEDAI LEGENDARIS!', 640, 200);
    ctx.fillStyle = C.cream;
    ctx.font = '24px sans-serif';
    ctx.fillText('Kritikus VIP memberi 5 bintang. Ramen Rush jadi kedai nomor satu di kota!', 640, 250);
  } else {
    ctx.fillStyle = C.redBright;
    ctx.font = 'bold 64px sans-serif';
    ctx.fillText('KEDAI TUTUP…', 640, 200);
    ctx.fillStyle = C.cream;
    ctx.font = '24px sans-serif';
    ctx.fillText(g.lossReason || 'Reputasi habis. Pelanggan tidak kembali.', 640, 250);
  }
  ctx.font = '20px sans-serif';
  ctx.fillText(`Melayani: ${g.stats.served} pelanggan · Rebus sempurna: ${g.stats.perfectBoils} · Combo terbaik: x${g.bestCombo} · Rating akhir: ★ ${g.rating.toFixed(1)}`, 640, 300);
  ctx.fillText(`Total koin: ${g.coins}`, 640, 330);
  const b = ZONES.playAgainBtn;
  ctx.fillStyle = C.redBright;
  roundRect(ctx, b.x, b.y, b.w, b.h, 14); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('↻  MAIN LAGI', 640, b.y + 45);
}

// --- Gambar mangkuk ramen (dipakai di title, stasiun, dan layar menang) -----
export function drawRamenBowl(ctx, cx, cy, r, broth, noodleQuality, toppings, t) {
  // Mangkuk.
  ctx.fillStyle = '#1a3a5c';
  ctx.beginPath(); ctx.ellipse(cx, cy, r, r * 0.42, 0, 0, Math.PI); ctx.fill();
  ctx.fillStyle = '#274b73';
  ctx.beginPath(); ctx.ellipse(cx, cy, r * 0.92, r * 0.36, 0, 0, Math.PI); ctx.fill();
  // Kuah.
  ctx.fillStyle = BROTHS[broth] ? BROTHS[broth].color : '#8a5a2b';
  ctx.beginPath(); ctx.ellipse(cx, cy - r * 0.06, r * 0.86, r * 0.3, 0, 0, Math.PI * 2); ctx.fill();
  // Mie: pusaran garis.
  ctx.strokeStyle = noodleQuality === 'bad' ? '#c9a86a' : '#f2d38a';
  ctx.lineWidth = Math.max(3, r / 22);
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(cx - r * 0.3 + i * r * 0.15, cy - r * 0.06, r * 0.16, Math.PI * 0.1, Math.PI * 1.1);
    ctx.stroke();
  }
  // Topping di atas kuah.
  const top = toppings || [];
  const spots = [[-0.45, -0.12], [0.42, -0.14], [0.05, -0.22], [-0.1, 0.08], [0.5, 0.05], [-0.5, 0.02]];
  top.forEach((k, i) => {
    const s = spots[i % spots.length];
    drawToppingIcon(ctx, k, cx + s[0] * r, cy + s[1] * r);
  });
  // Sumpit.
  ctx.strokeStyle = '#8a5a2b';
  ctx.lineWidth = Math.max(4, r / 18);
  ctx.beginPath(); ctx.moveTo(cx + r * 0.5, cy - r * 0.55); ctx.lineTo(cx + r * 1.05, cy - r * 0.95); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + r * 0.42, cy - r * 0.5); ctx.lineTo(cx + r * 0.95, cy - r * 0.82); ctx.stroke();
  // Uap.
  drawSteam(ctx, cx, cy - r * 0.5, t, 3);
}

export function drawSteam(ctx, x, y, t, n) {
  ctx.save();
  ctx.strokeStyle = C.steam;
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.5;
  for (let i = 0; i < n; i++) {
    const ox = (i - n / 2) * 16;
    const phase = t * 1.4 + i * 1.7;
    ctx.beginPath();
    ctx.moveTo(x + ox, y);
    ctx.bezierCurveTo(
      x + ox + Math.sin(phase) * 10, y - 18,
      x + ox + Math.sin(phase + 1) * 12, y - 36,
      x + ox + Math.sin(phase + 2) * 8, y - 55,
    );
    ctx.stroke();
  }
  ctx.restore();
}

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
