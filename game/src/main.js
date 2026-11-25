// main.js — loop game Ramen Rush: canvas, input, tick, dan mode screenshot.

import { newGame, tick } from './state.js';
import { drawGame } from './render.js';
import { handleClick, handleKey } from './input.js';
import { renderShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seed = Number(params.get('seed') || 7);

if (shot) {
  // Mode screenshot: render satu frame staging, tanpa loop.
  document.title = `Ramen Rush — shot ${shot}`;
  renderShot(ctx, shot, seed);
  window.__shotReady = true;
} else {
  const g = newGame(seed);
  let last = performance.now();

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    tick(g, dt);
    drawGame(ctx, g, mouse);
    requestAnimationFrame(frame);
  }

  const mouse = { x: -1, y: -1 };
  canvas.addEventListener('mousemove', (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = (e.clientX - r.left) * (canvas.width / r.width);
    mouse.y = (e.clientY - r.top) * (canvas.height / r.height);
  });
  canvas.addEventListener('click', (e) => {
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) * (canvas.width / r.width);
    const y = (e.clientY - r.top) * (canvas.height / r.height);
    handleClick(g, x, y);
  });
  window.addEventListener('keydown', (e) => {
    if ([' ', 'ArrowUp', 'ArrowDown'].includes(e.key)) e.preventDefault();
    handleKey(g, e.key);
  });

  requestAnimationFrame(frame);
}
