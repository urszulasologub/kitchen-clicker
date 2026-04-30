// Entry point — wires modules together and runs the main loop.

import { $coins, $cps, $click, $pot, $resetBtn } from './dom.js';
import { state, load, save, reset, startAutoSave } from './state.js';
import { fmt, spritePath } from './util.js';
import { cook, syncCookingUI } from './cooking.js';
import { autoTick } from './autocook.js';
import { applyFancyTier, leafTick } from './fancy.js';
import { buildUpgrades, refreshUpgrades, restorePurchasesFromState } from './upgrades.js';
import { restoreBasketIfOwned } from './basket.js';
import { checkAchievements } from './achievements.js';
import { togglePanel, closeAllPanels } from './panels.js';
import { wireKeyboard } from './keyboard.js';
import { toast } from './toast.js';

// ---------- Stats display ----------
function updateStats() {
  $coins.textContent = '$' + fmt(state.coins);
  $cps.textContent   = fmt(state.cps) + ' / sec';
  $click.textContent = '+' + fmt(state.clickPower) + ' / click';
}

// ---------- Cursor swap on press / release ----------
function wirePotCursor() {
  $pot.addEventListener('mousedown', () => {
    $pot.style.cursor = `url('${spritePath('Cursor/Finger_Grab_Glove.png')}') 16 4, pointer`;
  });
  $pot.addEventListener('mouseup', () => {
    $pot.style.cursor = `url('${spritePath('Cursor/Finger_Click_Glove.png')}') 16 4, pointer`;
  });
}

// ---------- Reset button ----------
function wireResetButton() {
  $resetBtn.addEventListener('click', () => {
    if (!confirm('Reset all progress? This cannot be undone.')) return;
    reset();
    location.reload();
  });
}

// ---------- Panel buttons + backdrop ----------
function wirePanels() {
  document.getElementById('btn-recipes')      ?.addEventListener('click', () => togglePanel('recipes'));
  document.getElementById('btn-achievements') ?.addEventListener('click', () => togglePanel('achievements'));
  document.getElementById('btn-stats')        ?.addEventListener('click', () => togglePanel('stats'));
  document.getElementById('panel-backdrop')   ?.addEventListener('click', closeAllPanels);
  document.querySelectorAll('.panel-close').forEach(btn =>
    btn.addEventListener('click', closeAllPanels)
  );
}

// ---------- Main loop ----------
let lastTime = performance.now();
let upgradeRefreshAccum = 0;
let achievementCheckAccum = 0;
const UPGRADE_REFRESH_INTERVAL = 0.2;
const ACHIEVEMENT_CHECK_INTERVAL = 0.5;

function frame(t) {
  const dt = Math.min(0.1, (t - lastTime) / 1000);
  lastTime = t;

  // passive earnings
  if (state.cps > 0) {
    const earned = state.cps * dt;
    state.coins += earned;
    state.totalEarned += earned;
  }
  state.playTimeSeconds += dt;

  autoTick(dt);
  leafTick(dt);
  applyFancyTier();
  updateStats();

  upgradeRefreshAccum += dt;
  if (upgradeRefreshAccum >= UPGRADE_REFRESH_INTERVAL) {
    upgradeRefreshAccum = 0;
    refreshUpgrades();
  }

  achievementCheckAccum += dt;
  if (achievementCheckAccum >= ACHIEVEMENT_CHECK_INTERVAL) {
    achievementCheckAccum = 0;
    checkAchievements();
  }

  requestAnimationFrame(frame);
}

// ---------- Boot ----------
function init() {
  const loaded = load();
  buildUpgrades();
  restorePurchasesFromState();
  restoreBasketIfOwned(state);
  refreshUpgrades();
  updateStats();
  syncCookingUI();
  wirePotCursor();
  wireResetButton();
  wirePanels();
  wireKeyboard();
  $pot.addEventListener('click', () => { cook(); save(); });
  startAutoSave();

  if (loaded && state.totalEarned > 0) {
    toast('Welcome back, chef!', { title: 'Saved game loaded', kind: 'info' });
  }

  requestAnimationFrame(frame);
}

init();
