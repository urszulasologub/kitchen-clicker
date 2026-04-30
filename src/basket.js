// Bread basket: hidden until purchased. On buy it drops in, opens its cloth
// cover via a frame animation, then settles closed.

import { $basketDecor, $basketCover } from './dom.js';
import { spritePath } from './util.js';
import { showGlow, burstLeaves, retriggerClass } from './effects.js';

const FRAME_SEQUENCE = [1, 1, 1, 2, 3, 4, 5, 6, 6, 6, 5, 4, 3, 2, 1];
const FRAME_INTERVAL_MS = 90;

export function animateBasketOpen() {
  $basketDecor.classList.remove('hidden');
  retriggerClass($basketDecor, 'appear');

  // Step through the frame sequence
  let i = 0;
  const tick = () => {
    if (i >= FRAME_SEQUENCE.length) return;
    $basketCover.src = spritePath(`Animations/Basket/basket_${FRAME_SEQUENCE[i]}.png`);
    i++;
    setTimeout(tick, FRAME_INTERVAL_MS);
  };
  setTimeout(tick, 280); // wait for the drop-in animation to land

  // Celebration
  showGlow();
  burstLeaves(12);
}

// Re-show the basket on load if it had been bought before.
export function restoreBasketIfOwned(state) {
  if (state.bought.basket) {
    $basketDecor.classList.remove('hidden');
    // already-bought baskets stay closed (frame 1 is the default `src` in HTML)
  }
}
