// Bread basket: hidden until purchased. On buy it drops in, opens its cloth
// cover via a frame animation, then settles closed. After purchase it
// re-opens periodically — the more total money earned, the more often.

import { $basketDecor, $basketCover } from './dom.js';
import { state } from './state.js';
import { spritePath } from './util.js';
import { showGlow, burstLeaves, retriggerClass } from './effects.js';

const FRAME_SEQUENCE = [1, 1, 1, 2, 3, 4, 5, 6, 6, 6, 5, 4, 3, 2, 1];
const FRAME_INTERVAL_MS = 90;

let frameTimer = null;

// Just play the cloth open-and-close frame cycle on the existing basket.
function playFrameSequence() {
  if (frameTimer) return; // already animating
  let i = 0;
  const tick = () => {
    if (i >= FRAME_SEQUENCE.length) {
      frameTimer = null;
      return;
    }
    $basketCover.src = spritePath(`Animations/Basket/basket_${FRAME_SEQUENCE[i]}.png`);
    i++;
    frameTimer = setTimeout(tick, FRAME_INTERVAL_MS);
  };
  tick();
}

// Full first-time celebration: drop in + cloth animation + glow + leaves.
export function animateBasketOpen() {
  $basketDecor.classList.remove('hidden');
  retriggerClass($basketDecor, 'appear');
  setTimeout(playFrameSequence, 280);
  showGlow();
  burstLeaves(12);
}

export function restoreBasketIfOwned(state) {
  if (state.bought.basket) {
    $basketDecor.classList.remove('hidden');
  }
}

// ---------- Periodic auto-opening ----------
// Interval shrinks as total earnings grow. Each order-of-magnitude of total
// earned trims about 7 seconds off the interval, floor at 4 seconds.
const BASE_INTERVAL = 60;       // seconds when the player has nothing
const PER_DECADE   = 7;         // seconds shaved per ×10 in totalEarned
const MIN_INTERVAL = 4;

let basketAccum = 0;

function basketInterval() {
  if (state.totalEarned <= 0) return BASE_INTERVAL;
  const decades = Math.log10(state.totalEarned + 1);
  return Math.max(MIN_INTERVAL, BASE_INTERVAL - decades * PER_DECADE);
}

export function basketLoopTick(dt) {
  if (!state.bought.basket) return;
  basketAccum += dt;
  if (basketAccum >= basketInterval()) {
    basketAccum = 0;
    playFrameSequence();
  }
}
