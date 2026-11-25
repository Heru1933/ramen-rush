// shots.js — staging screenshot deterministik.
// Baca query ?shot=title|play|serve|win|loss&seed=N, bangun state nyata dari
// seed itu, render SATU frame. Dipakai headless Chromium untuk screenshot.

import { newGame, startDay, spawnCustomer, startBroth, startNoodles, startBowl, addTopping, addNoodlesToBowl, pullNoodles } from './state.js';
import { drawGame } from './render.js';

export function stageShot(g, shot, seed) {
  const game = newGame(seed);
  game.time = 3.2; // uap/lampion di posisi tetap
  if (shot === 'title') {
    game.screen = 'title';
    return game;
  }
  if (shot === 'win') {
    game.screen = 'win';
    game.stats = { served: 24, failed: 2, perfectBoils: 18 };
    game.bestCombo = 6;
    game.coins = 212;
    game.rating = 4.8;
    game.day = 4;
    return game;
  }
  if (shot === 'loss') {
    game.screen = 'loss';
    game.reputation = 0;
    game.lossReason = 'Target hari 3 tidak tercapai (84/120 koin).';
    game.stats = { served: 9, failed: 4, perfectBoils: 3 };
    game.bestCombo = 2;
    game.coins = 84;
    game.rating = 2.9;
    game.day = 2;
    return game;
  }
  // play / serve: hari berjalan dengan pelanggan + dapur aktif.
  game.day = 1; // hari 2: miso sudah kebuka
  game.coins = 47;
  startDay(game);
  game.dayTime = 23;
  spawnCustomer(game);
  spawnCustomer(game);
  spawnCustomer(game);
  // Kaldu miso hampir matang.
  startBroth(game, 'miso');
  game.brothPot.t = 4.2;
  // Mie sedang direbus, jarum di zona perfect.
  startNoodles(game, 0, game.customers[0].order.noodle);
  const target = { firm: 2.6, normal: 3.9, soft: 5.3 }[game.customers[0].order.noodle];
  game.noodlePots[0].t = target;
  if (shot === 'serve') {
    // Mangkuk lengkap siap saji untuk pelanggan pertama.
    game.brothPot.status = 'ready';
    startBowl(game);
    pullNoodles(game, 0); // tarik di zona perfect -> heldNoodles 'perfect'
    addNoodlesToBowl(game);
    for (const t of game.customers[0].order.toppings) addTopping(game, t);
    game.message = 'Mangkuk lengkap — sajikan ke pelanggan!';
    game.messageT = 5;
    game.combo = 3;
  } else {
    // play: mie sedang direbus (jarum di zona perfect) + mangkuk berisi kaldu
    // = dish mid-assembly dengan mekanik timing yang kelihatan.
    game.brothPot.status = 'ready';
    startBowl(game);
    game.message = 'Mie hampir sempurna — tarik sekarang!';
    game.messageT = 5;
  }
  game.screen = 'playing';
  return game;
}

export function renderShot(ctx, shot, seed) {
  const g = stageShot(null, shot, seed);
  drawGame(ctx, g, { x: -1, y: -1 });
  return g;
}
