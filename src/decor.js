// One-time decor unlocks: wall shelves, furniture cabinet, cheese stand.
// Each is a `<div>` with `class="hidden"` until purchased; buying drops it
// in with a bouncy spring animation.

const $shelves     = document.getElementById('shelves-decor');
const $furniture   = document.getElementById('furniture-decor');
const $cheeseStand = document.getElementById('cheese-stand-decor');

function dropIn(el) {
  if (!el) return;
  el.classList.remove('hidden');
  el.classList.remove('appear');
  void el.offsetWidth;
  el.classList.add('appear');
  setTimeout(() => el.classList.remove('appear'), 600);
}

export const animateShelvesAppear     = () => dropIn($shelves);
export const animateFurnitureAppear   = () => dropIn($furniture);
export const animateCheeseStandAppear = () => dropIn($cheeseStand);

// Re-show after save load (silent — no animation).
export function restoreDecorFromState(state) {
  if (state.bought.shelves     && $shelves)     $shelves.classList.remove('hidden');
  if (state.bought.furniture   && $furniture)   $furniture.classList.remove('hidden');
  if (state.bought.cheesestand && $cheeseStand) $cheeseStand.classList.remove('hidden');
}
