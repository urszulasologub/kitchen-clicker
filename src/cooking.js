// Multi-click cooking system.
//
// Each dish has a `clickCost` (3-18 progress points based on ingredient count).
// Each click adds `clickPower` progress to the current dish; intermediate
// clicks just bounce the lid and fill the progress bar. When progress reaches
// the cost, the dish completes — big celebration, payout, flavor banner.

import { $pot, $recent } from './dom.js';
import { state } from './state.js';
import {
  DISHES, FAILED_DISHES, FAIL_RATE, POSITIVE_FLAVOR_RATE,
  POSITIVE_FLAVORS, NEGATIVE_FLAVORS, SPLASH_TIERS, clickCostOf,
} from './config.js';
import { rand, fmt, spritePath } from './util.js';
import {
  spawnDish, dishSize, pickSplashFor, playSplash, showGlow,
  spawnFloat, spawnFlavor, retriggerClass, burstLeaves, flashScreen,
  refreshProgressUI, hideProgressUI,
} from './effects.js';

// Recipes whose tag requirements are all unlocked right now.
export function unlockedDishes() {
  return DISHES.filter(d => d.requires.every(req => state.unlocked.has(req)));
}

// Pick a recipe weighted toward LOW values — common cooks are cheap, rare
// cooks are big-tip moments.
export function pickDish() {
  const pool = unlockedDishes();
  if (pool.length === 0) return null;
  const weights = pool.map(d => 1 / (1 + Math.log10(d.value + 1) * 0.7));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

function dishByName(name) {
  return DISHES.find(d => d.name === name);
}

function pushRecent(spritePathRel) {
  const img = document.createElement('img');
  img.src = spritePath(spritePathRel);
  img.classList.add('recent-pop');
  $recent.prepend(img);
  while ($recent.children.length > 6) $recent.removeChild($recent.lastChild);
}

// ---------- Public: refresh progress UI from state (used after load) ----------
export function syncCookingUI() {
  if (!state.currentDish) {
    hideProgressUI();
    return;
  }
  const dish = dishByName(state.currentDish);
  if (!dish) {
    state.currentDish = null;
    state.cookingProgress = 0;
    hideProgressUI();
    return;
  }
  refreshProgressUI(dish, clickCostOf(dish), state.cookingProgress);
}

// ---------- Pot click ----------
export function cook() {
  state.totalClicks++;

  // Start a new dish if needed
  if (!state.currentDish) {
    const next = pickDish();
    if (!next) {
      // Nothing the player can cook (shouldn't happen with starter unlocks)
      retriggerClass($pot, 'click');
      spawnFlavor('NOTHING TO COOK!', 'negative-big');
      return;
    }
    state.currentDish = next.name;
    state.cookingProgress = 0;
  }

  const dish = dishByName(state.currentDish);
  const cost = clickCostOf(dish);
  state.cookingProgress += state.clickPower;

  // Click feedback (every click)
  retriggerClass($pot, 'click');
  playSplash(SPLASH_TIERS[0]); // tiny

  if (state.cookingProgress >= cost) {
    completeDish(dish);
  } else {
    refreshProgressUI(dish, cost, state.cookingProgress);
  }
}

// ---------- Dish completion ----------
function completeDish(dish) {
  state.totalDishesCooked++;
  const failed = Math.random() < FAIL_RATE;

  let dishPath;
  let value = 0;

  if (failed) {
    state.failedCooks++;
    dishPath = `FailedDish/${rand(FAILED_DISHES)}.png`;
  } else {
    value = dish.value * state.clickPower;
    state.coins += value;
    state.totalEarned += value;
    if (value > state.biggestDishValue) state.biggestDishValue = value;
    dishPath = `Dish/${dish.name}.png`;
  }

  // Big celebration: extra-large dish pop, splash, glow, particle burst
  spawnDish(dishPath, { size: dishSize() * 1.25 });
  showGlow();
  if (!failed) {
    playSplash(pickSplashFor(value));
    burstLeaves(8 + Math.min(20, Math.floor(Math.log10(value + 1) * 4)));
  }
  retriggerClass($pot, 'click-big', 600);

  pushRecent(dishPath);

  // PROMINENT flavor banner + screen flash
  const rect = $pot.getBoundingClientRect();
  const fx = rect.left + rect.width / 2;
  const fy = rect.top - 40;

  if (failed) {
    spawnFlavor(rand(NEGATIVE_FLAVORS), 'negative-big');
    flashScreen('red');
  } else {
    spawnFloat(`+$${fmt(value)}`, fx, fy, 'big');

    if (!state.cookedRecipes.has(dish.name)) {
      state.cookedRecipes.add(dish.name);
      spawnFlavor('NEW RECIPE!', 'special-big');
      flashScreen('rainbow');
    } else if (Math.random() < POSITIVE_FLAVOR_RATE) {
      spawnFlavor(rand(POSITIVE_FLAVORS), 'positive-big');
      flashScreen('gold');
    } else {
      spawnFlavor('DONE!', 'positive-big');
      flashScreen('gold');
    }
  }

  // Reset for next dish
  state.currentDish = null;
  state.cookingProgress = 0;
  hideProgressUI();
}
