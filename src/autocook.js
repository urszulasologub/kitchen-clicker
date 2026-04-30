// Auto-cook visualization. When cps > 0 the pot keeps cooking by itself —
// a ghost finger pokes the lid, a smaller dish pops out, mini-coins float up.
//
// The visualization rate caps regardless of cps so it stays readable.

import { $pot } from './dom.js';
import { state } from './state.js';
import { fmt } from './util.js';
import {
  spawnIngredient, spawnGhostFinger, playSplash, spawnFloat, retriggerClass,
} from './effects.js';
import { SPLASH_TIERS } from './config.js';
import { pickDish, dishByName } from './cooking.js';

const MAX_VISUAL_RATE = 8;     // hz cap
const MAX_CATCHUP_FRAMES = 4;  // after a tab-switch, only fire this many at once

let accum = 0;

function visRate() {
  if (state.cps <= 0) return 0;
  return Math.min(MAX_VISUAL_RATE, 1 + Math.log10(state.cps + 1) * 1.6);
}

function autoVisualClick() {
  // Use the dish currently being cooked so ingredients match the recipe.
  // Fall back to a random pick if nothing's in progress yet.
  const dish = (state.currentDish && dishByName(state.currentDish)) || pickDish();
  if (!dish) return;
  const offX = (Math.random() - 0.5) * 160;
  const fingerX = offX * 0.5;

  spawnGhostFinger(fingerX);
  retriggerClass($pot, 'click');

  // Slight delay so the finger lands before the ingredient pops
  setTimeout(() => {
    spawnIngredient(dish, {
      offsetX: offX,
      size: 50 + Math.random() * 20,
    });
    if (Math.random() < 0.8) playSplash(SPLASH_TIERS[0]); // tiny splash
  }, 110);

  // Tiny coin showing the per-tick share
  const rect = $pot.getBoundingClientRect();
  const fx = rect.left + rect.width / 2 + offX * 0.6;
  const fy = rect.top - 20; // above the pot, like the click coin
  const share = Math.max(1, Math.round(state.cps / Math.max(1, visRate())));
  spawnFloat(`+$${fmt(share)}`, fx, fy, 'auto');
}

export function autoTick(dt) {
  if (state.cps <= 0) { accum = 0; return; }
  const rate = visRate();
  accum += dt;
  const interval = 1 / rate;
  let safety = 0;
  while (accum > interval && safety < MAX_CATCHUP_FRAMES) {
    accum -= interval;
    autoVisualClick();
    safety++;
  }
  if (accum > interval) accum = interval;
}
