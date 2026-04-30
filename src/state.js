// Game state + localStorage persistence.
//
// `state` holds everything that persists across sessions, plus the derived
// `fancy` tier that the runtime updates. Functions on this module mutate it
// and broadcast `state-changed` so views can refresh on demand.

import { STARTER_UNLOCKS } from './config.js';

const STORAGE_KEY = 'little-chef-clicker:v1';
const SAVE_INTERVAL_MS = 5000;

function freshState() {
  return {
    coins: 0,
    totalClicks: 0,
    totalDishesCooked: 0,                     // completed dishes (success + fail)
    clickPower: 1,
    cps: 0,
    bought: {},                               // id -> count
    unlocked: new Set(STARTER_UNLOCKS),        // tag set
    cookedRecipes: new Set(),                  // dish names cooked at least once
    fancy: 0,                                 // current fancy tier (derived from cps)

    // Active cooking — multiple clicks per dish
    currentDish: null,                        // dish name being cooked, or null
    cookingProgress: 0,                       // accumulated progress points

    // Lifetime stats (for stats panel + achievements)
    totalEarned: 0,                           // every coin ever gained
    playTimeSeconds: 0,
    failedCooks: 0,
    biggestDishValue: 0,                      // max single-cook value
    upgradesBought: 0,                        // sum of all purchases

    achievements: new Set(),                   // unlocked achievement IDs
    lastSaved: 0,
  };
}

export const state = freshState();

// ---------- Persistence ----------

export function save() {
  const data = {
    coins:             state.coins,
    totalClicks:       state.totalClicks,
    totalDishesCooked: state.totalDishesCooked,
    clickPower:        state.clickPower,
    cps:               state.cps,
    bought:            state.bought,
    unlocked:          [...state.unlocked],
    cookedRecipes:     [...state.cookedRecipes],
    currentDish:       state.currentDish,
    cookingProgress:   state.cookingProgress,
    totalEarned:       state.totalEarned,
    playTimeSeconds:   state.playTimeSeconds,
    failedCooks:       state.failedCooks,
    biggestDishValue:  state.biggestDishValue,
    upgradesBought:    state.upgradesBought,
    achievements:      [...state.achievements],
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    state.lastSaved = Date.now();
  } catch (e) {
    console.warn('Save failed:', e);
  }
}

export function load() {
  let raw;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    return false;
  }
  if (!raw) return false;
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    return false;
  }
  state.coins             = data.coins             ?? 0;
  state.totalClicks       = data.totalClicks       ?? 0;
  state.totalDishesCooked = data.totalDishesCooked ?? state.totalClicks;
  state.clickPower        = data.clickPower        ?? 1;
  state.cps               = data.cps               ?? 0;
  state.bought            = data.bought            ?? {};
  state.unlocked          = new Set(data.unlocked      ?? STARTER_UNLOCKS);
  state.cookedRecipes     = new Set(data.cookedRecipes ?? []);
  state.currentDish       = data.currentDish       ?? null;
  state.cookingProgress   = data.cookingProgress   ?? 0;
  state.totalEarned       = data.totalEarned       ?? state.coins;
  state.playTimeSeconds   = data.playTimeSeconds   ?? 0;
  state.failedCooks       = data.failedCooks       ?? 0;
  state.biggestDishValue  = data.biggestDishValue  ?? 0;
  state.upgradesBought    = data.upgradesBought    ?? 0;
  state.achievements      = new Set(data.achievements ?? []);
  // Always re-add starter unlocks in case the schema added new ones.
  STARTER_UNLOCKS.forEach(t => state.unlocked.add(t));
  return true;
}

export function reset() {
  Object.assign(state, freshState());
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
}

export function startAutoSave() {
  setInterval(save, SAVE_INTERVAL_MS);
  // also save when the tab is hidden / closed
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') save();
  });
  window.addEventListener('beforeunload', save);
}
