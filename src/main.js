// Entry point — wires modules together and runs the main loop.

import { $coins, $cps, $click, $pot, $resetBtn } from './dom.js';
import { state, load, save, reset, startAutoSave } from './state.js';
import { fmt, spritePath } from './util.js';
import { cook, syncCookingUI, cookingTick } from './cooking.js';
import { autoTick } from './autocook.js';
import { applyFancyTier, leafTick } from './fancy.js';
import { buildUpgrades, refreshUpgrades, restorePurchasesFromState } from './upgrades.js';
import { restoreBasketIfOwned, basketLoopTick } from './basket.js';
import { restoreKettleIfOwned } from './kettle.js';
import { restoreDecorFromState } from './decor.js';
import { checkAchievements } from './achievements.js';
import { togglePanel, closeAllPanels } from './panels.js';
import { wireKeyboard } from './keyboard.js';
import { toast } from './toast.js';
import { initAudio, isMuted, toggleMute, setMusicTrack } from './audio.js';

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
  document.getElementById('btn-recent')       ?.addEventListener('click', () => togglePanel('recent'));
  document.getElementById('panel-backdrop')   ?.addEventListener('click', closeAllPanels);
  document.querySelectorAll('.panel-close').forEach(btn =>
    btn.addEventListener('click', closeAllPanels)
  );
}

// ---------- Mute button ----------
function wireMuteButton() {
  const btn = document.getElementById('btn-mute');
  if (!btn) return;
  const refresh = () => {
    const m = isMuted();
    btn.textContent = m ? 'MUSIC: OFF' : 'MUSIC: ON';
    btn.classList.toggle('muted', m);
  };
  refresh();
  btn.addEventListener('click', () => { toggleMute(); refresh(); });
}

// ---------- Container item-scale ----------
// Items piled inside the fridge / cheese stand have hard-coded pixel sizes
// (set by JS in upgrades.js based on each upgrade's `layout.size`). To make
// them shrink with the container on smaller viewports, we publish an
// `--item-scale` custom property on each container, computed from the
// container's actual rendered width vs. its desktop reference width.
// CSS can't do this (calc(px / px) isn't allowed), so it lives here.
// `dim` selects width or height as the scale axis. The counter is always
// 100vw wide, so its width carries no signal — we measure height instead.
const ITEM_SCALE_REFS = [
  { containerSel: '#fridge-items',       measureSel: '.fridge',           dim: 'width',  refValue: 702 },
  { containerSel: '#shelves-items',      measureSel: '#shelves-decor',    dim: 'width',  refValue: 439 },
  { containerSel: '#counter-items',      measureSel: '#counter-items',    dim: 'height', refValue: 540 },
  { containerSel: '#basket-decor',       measureSel: '#basket-decor',     dim: 'width',  refValue: 351 },
  { containerSel: '#cheese-stand-decor', measureSel: '.cheese-stand-img', dim: 'width',  refValue: 130 },
];
function updateItemScales() {
  for (const { containerSel, measureSel, dim, refValue } of ITEM_SCALE_REFS) {
    const container = document.querySelector(containerSel);
    const measure   = document.querySelector(measureSel);
    if (!container || !measure) continue;
    const v = measure.getBoundingClientRect()[dim];
    if (v > 0) container.style.setProperty('--item-scale', (v / refValue).toFixed(3));
  }
}

// ---------- Cookbook toggle ----------
// Hamburger is shown on every viewport. Default state: open on desktop,
// closed on mobile. Burger toggles to either explicitly opened/closed.
function wireCookbookToggle() {
  const btn  = document.getElementById('btn-cookbook-toggle');
  const book = document.getElementById('book');
  if (!btn || !book) return;

  const isMobile = () => window.matchMedia('(max-width: 768px)').matches;
  let cookbookOpen = !isMobile();

  function applyState() {
    book.classList.toggle('book-opened', cookbookOpen);
    book.classList.toggle('book-closed', !cookbookOpen);
    btn.classList.toggle('open', cookbookOpen);
    btn.setAttribute('aria-expanded', String(cookbookOpen));
  }
  applyState();

  btn.addEventListener('click', () => {
    cookbookOpen = !cookbookOpen;
    applyState();
  });
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

  cookingTick(dt);  // cps fills the active-dish progress bar
  basketLoopTick(dt); // periodic basket open animation
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
  restoreKettleIfOwned(state);
  restoreDecorFromState(state);
  refreshUpgrades();
  updateStats();
  syncCookingUI();
  wirePotCursor();
  wireResetButton();
  wirePanels();
  wireCookbookToggle();
  // initAudio must run before wireMuteButton — the button label is computed
  // from the muted flag, which initAudio loads from localStorage.
  initAudio();
  // applyFancyTier only swaps tracks when tier *changes*, but on a returning
  // save the tier already matches — pin the initial track explicitly.
  setMusicTrack(state.fancy);
  wireMuteButton();
  wireKeyboard();
  $pot.addEventListener('click', () => { cook(); save(); });
  updateItemScales();
  // ResizeObserver picks up both viewport changes (fridge resizes via vw)
  // and decor appearing for the first time (cheese stand: hidden → visible).
  const ro = new ResizeObserver(updateItemScales);
  for (const { measureSel } of ITEM_SCALE_REFS) {
    const el = document.querySelector(measureSel);
    if (el) ro.observe(el);
  }
  startAutoSave();

  if (loaded && state.totalEarned > 0) {
    toast('Welcome back, chef!', { title: 'Saved game loaded', kind: 'info' });
  }

  requestAnimationFrame(frame);
}

init();
