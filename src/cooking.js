// Multi-click cooking system.
//
// Each dish has a `clickCost` (3-18 progress points based on ingredient count).
// Each click adds `clickPower` progress to the current dish; intermediate
// clicks just bounce the lid and fill the progress bar. When progress reaches
// the cost, the dish completes — big celebration, payout, flavor banner.

import { $pot, $recent } from './dom.js';
import { state } from './state.js';
import {
  DISHES, AWESOME_FLAVORS, NEGATIVE_FLAVORS, CALM_FLAVORS,
  AWESOME_MULT, SPLASH_TIERS, clickCostOf, spoiledFor,
} from './config.js';
import { rand, fmt, spritePath } from './util.js';
import {
  spawnDish, dishSize, pickSplashFor, playSplash, showGlow,
  spawnFloat, spawnFlavor, retriggerClass, flashScreen,
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
  refreshProgressUI(dish, clickCostOf(dish), state.cookingProgress, dish.value * state.clickPower);
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
    refreshProgressUI(dish, cost, state.cookingProgress, dish.value * state.clickPower);
  }
}

// ---------- Passive cooking ----------
// Called every frame from main.js. cps adds to the current dish's progress
// bar continuously; if no dish is active, one is auto-picked so passive
// income keeps flowing even when the player isn't clicking.
export function cookingTick(dt) {
  if (state.cps <= 0) return;

  if (!state.currentDish) {
    const next = pickDish();
    if (!next) return;
    state.currentDish = next.name;
    state.cookingProgress = 0;
  }

  const dish = dishByName(state.currentDish);
  if (!dish) {
    state.currentDish = null;
    state.cookingProgress = 0;
    return;
  }

  state.cookingProgress += state.cps * dt;
  const cost = clickCostOf(dish);

  if (state.cookingProgress >= cost) {
    completeDish(dish);
  } else {
    refreshProgressUI(dish, cost, state.cookingProgress, dish.value * state.clickPower);
  }
}

// ---------- Quality roll ----------
// Returns one of: 'bad', 'regular', 'awesome'.
function rollQuality() {
  const r = Math.random();
  if (r < state.badRate) return 'bad';
  if (r > 1 - state.awesomeRate) return 'awesome';
  return 'regular';
}

// ---------- Dish completion ----------
function completeDish(dish) {
  state.totalDishesCooked++;
  const quality = rollQuality();

  let dishPath;
  let value = 0;

  if (quality === 'bad') {
    state.failedCooks++;
    dishPath = `FailedDish/${spoiledFor(dish)}.png`;
  } else if (quality === 'awesome') {
    state.awesomeCooks++;
    value = dish.value * state.clickPower * AWESOME_MULT;
    dishPath = `Dish/${dish.name}.png`;
  } else {
    value = dish.value * state.clickPower;
    dishPath = `Dish/${dish.name}.png`;
  }

  if (value > 0) {
    state.coins += value;
    state.totalEarned += value;
    if (value > state.biggestDishValue) state.biggestDishValue = value;
  }

  pushRecent(dishPath);

  const rect = $pot.getBoundingClientRect();
  const fx = rect.left + rect.width / 2;
  const fy = rect.top - 40;

  // Visuals scale with quality
  if (quality === 'bad') {
    spawnDish(dishPath, { size: dishSize() * 1.25 });
    showGlow();
    retriggerClass($pot, 'click-big', 600);
    spawnFlavor(rand(NEGATIVE_FLAVORS), 'negative-big');
    flashScreen('red');

  } else if (quality === 'awesome') {
    spawnDish(dishPath, { size: dishSize() * 1.4 });
    showGlow();
    playSplash(pickSplashFor(value));
    retriggerClass($pot, 'click-big', 600);
    spawnFloat(`+$${fmt(value)}`, fx, fy, 'big');
    if (!state.cookedRecipes.has(dish.name)) {
      state.cookedRecipes.add(dish.name);
      spawnFlavor('NEW RECIPE!', 'special-big');
      flashScreen('rainbow');
    } else {
      spawnFlavor(rand(AWESOME_FLAVORS), 'positive-big');
      flashScreen('gold');
    }

  } else {
    // REGULAR — calm, no flash, no banner. Just dish + coin + small text.
    spawnDish(dishPath, { size: dishSize() });
    playSplash(pickSplashFor(value));
    spawnFloat(`+$${fmt(value)}`, fx, fy);
    if (!state.cookedRecipes.has(dish.name)) {
      // Discovery still gets the rainbow banner — it's a real moment.
      state.cookedRecipes.add(dish.name);
      spawnFlavor('NEW RECIPE!', 'special-big');
      flashScreen('rainbow');
    } else {
      spawnFlavor(rand(CALM_FLAVORS), 'calm');
    }
  }

  state.currentDish = null;
  state.cookingProgress = 0;
  hideProgressUI();
}
