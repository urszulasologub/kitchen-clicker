// One-time decor unlocks: wall shelves, furniture cabinet, cheese stand.
// Each is a `<div>` with `class="hidden"` until purchased; buying drops it
// in with a bouncy spring animation.

const $stove       = document.getElementById('stove-decor');
const $shelves     = document.getElementById('shelves-decor');
const $furniture   = document.getElementById('furniture-decor');
const $cheeseStand = document.getElementById('cheese-stand-decor');
const $oven        = document.getElementById('oven-decor');
const $fridge      = document.querySelector('.fridge');
const $fridgeItems = document.getElementById('fridge-items');
const $bgWall      = document.getElementById('bg-wall');

const POOR_WALL = 'Sprites/Custom-sprites/Background/poor-wall.png';
const NICE_WALL = 'Sprites/Custom-sprites/Background/wall.png';

function dropIn(el) {
  if (!el) return;
  el.classList.remove('hidden');
  el.classList.remove('appear');
  void el.offsetWidth;
  el.classList.add('appear');
  setTimeout(() => el.classList.remove('appear'), 600);
}

export const animateStoveAppear       = () => dropIn($stove);
export const animateShelvesAppear     = () => dropIn($shelves);
export const animateFurnitureAppear   = () => dropIn($furniture);
export const animateCheeseStandAppear = () => dropIn($cheeseStand);
export const animateOvenAppear        = () => dropIn($oven);
export const animateFridgeAppear      = () => {
  dropIn($fridge);
  if ($fridgeItems) $fridgeItems.classList.remove('hidden');
};

// Renovation: swap the cracked default wall for the finished one. A short
// fade keeps the transition from being jarring.
export const animateRenovationAppear = () => {
  if (!$bgWall) return;
  $bgWall.classList.add('renovating');
  $bgWall.src = NICE_WALL;
  setTimeout(() => $bgWall.classList.remove('renovating'), 800);
};

// Re-show after save load (silent — no animation).
export function restoreDecorFromState(state) {
  if (state.bought.stove       && $stove)       $stove.classList.remove('hidden');
  if (state.bought.shelves     && $shelves)     $shelves.classList.remove('hidden');
  if (state.bought.furniture   && $furniture)   $furniture.classList.remove('hidden');
  if (state.bought.cheesestand && $cheeseStand) $cheeseStand.classList.remove('hidden');
  if (state.bought.oven        && $oven)        $oven.classList.remove('hidden');
  if (state.bought.fridge      && $fridge)      $fridge.classList.remove('hidden');
  if (state.bought.fridge      && $fridgeItems) $fridgeItems.classList.remove('hidden');
  if (state.bought.renovation  && $bgWall)      $bgWall.src = NICE_WALL;
}
