// One-time decor unlocks: wall shelves, furniture cabinet, cheese stand.
// Each is a `<div>` with `class="hidden"` until purchased; buying drops it
// in with a bouncy spring animation.

const $stove       = document.getElementById('stove-decor');
const $shelves     = document.getElementById('shelves-decor');
const $shelvesItems = document.getElementById('shelves-items');
const $furniture   = document.getElementById('furniture-decor');
const $cheeseStand = document.getElementById('cheese-stand-decor');
const $oven        = document.getElementById('oven-decor');
const $fridge      = document.querySelector('.fridge');
const $fridgeItems = document.getElementById('fridge-items');
const $bgWall      = document.getElementById('bg-wall');
const $bgCounter   = document.getElementById('bg-counter');

const POOR_WALL    = 'Sprites/Custom-sprites/Background/poor-wall.png';
const NICE_WALL    = 'Sprites/Custom-sprites/Background/wall.png';
const FANCY_WALL   = 'Sprites/Custom-sprites/Background/nice-wall.png';
const LUXURY_WALL  = 'Sprites/Custom-sprites/Background/luxurious-wall.png';

function dropIn(el) {
  if (!el) return;
  el.classList.remove('hidden');
  el.classList.remove('appear');
  void el.offsetWidth;
  el.classList.add('appear');
  setTimeout(() => el.classList.remove('appear'), 600);
}

export const animateStoveAppear       = () => dropIn($stove);
export const animateShelvesAppear     = () => {
  dropIn($shelves);
  if ($shelvesItems) $shelvesItems.classList.remove('hidden');
};
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

// Designer Wallpaper: tier-2 renovation, swaps the plain finished wall
// for the patterned one.
export const animateWallpaperAppear = () => {
  if (!$bgWall) return;
  $bgWall.classList.add('renovating');
  $bgWall.src = FANCY_WALL;
  setTimeout(() => $bgWall.classList.remove('renovating'), 800);
};

// Luxury Walls: top-tier renovation, swaps the patterned wallpaper for
// the luxurious one. Demanding guests come with the territory.
export const animateLuxuryWallsAppear = () => {
  if (!$bgWall) return;
  $bgWall.classList.add('renovating');
  $bgWall.src = LUXURY_WALL;
  setTimeout(() => $bgWall.classList.remove('renovating'), 800);
};

// Counter top reveal — bg-counter is the kitchen counter sprite that
// appliances sit on. Stays hidden until the player buys Counter. Uses the
// same dropIn pattern (with a forced reflow) the other decor relies on so
// the animation kicks in cleanly after the display:none → block flip.
export const animateCounterAppear = () => {
  if (!$bgCounter) return;
  $bgCounter.classList.remove('hidden');
  $bgCounter.classList.remove('counter-reveal');
  void $bgCounter.offsetWidth;
  $bgCounter.classList.add('counter-reveal');
  setTimeout(() => $bgCounter.classList.remove('counter-reveal'), 700);
};

// Re-show after save load (silent — no animation).
export function restoreDecorFromState(state) {
  if (state.bought.stove       && $stove)       $stove.classList.remove('hidden');
  if (state.bought.shelves     && $shelves)     $shelves.classList.remove('hidden');
  if (state.bought.shelves     && $shelvesItems) $shelvesItems.classList.remove('hidden');
  if (state.bought.furniture   && $furniture)   $furniture.classList.remove('hidden');
  if (state.bought.cheesestand && $cheeseStand) $cheeseStand.classList.remove('hidden');
  if (state.bought.oven        && $oven)        $oven.classList.remove('hidden');
  if (state.bought.fridge      && $fridge)      $fridge.classList.remove('hidden');
  if (state.bought.fridge      && $fridgeItems) $fridgeItems.classList.remove('hidden');
  // Wall src follows the highest-tier renovation owned. Order matters —
  // each subsequent tier overwrites the previous src.
  if (state.bought.renovation  && $bgWall)      $bgWall.src = NICE_WALL;
  if (state.bought.wallpaper   && $bgWall)      $bgWall.src = FANCY_WALL;
  if (state.bought.luxurywalls && $bgWall)      $bgWall.src = LUXURY_WALL;
  if (state.bought.counter     && $bgCounter)   $bgCounter.classList.remove('hidden');
}
