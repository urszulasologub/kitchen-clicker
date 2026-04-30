// All visual effects: dish pops, splashes, glow, ghost finger, floats, flavors.
// Pure DOM/CSS spawners — they don't read or write game state.

import { $dishLayer, $ghostLayer, $glow, $splash, $float, $particles } from './dom.js';
import { state } from './state.js';
import { spritePath, fmt } from './util.js';
import { SPLASH_TIERS } from './config.js';

// ---------- Dish-pop ----------

// Dish size grows logarithmically with current earning power so cooking
// visibly scales with progress. Used by both manual and auto cook.
export function dishSize() {
  const earnRate = state.cps + state.clickPower;
  return 80 + Math.min(200, Math.log10(1 + earnRate) * 55);
}

export function spawnDish(spritePathRel, opts = {}) {
  const img = document.createElement('img');
  img.className = 'dish-pop' + (opts.auto ? ' auto' : '');
  img.src = spritePath(spritePathRel);
  img.style.setProperty('--ox', (opts.offsetX || 0) + 'px');
  if (opts.size) img.style.width = opts.size + 'px';
  $dishLayer.appendChild(img);
  setTimeout(() => img.remove(), opts.auto ? 850 : 1150);
}

// Real-ingredient tag → sprite. Tools (stove/oven/blender) are excluded
// — they're equipment, not things that fly out of the pot.
const INGREDIENT_SPRITES = {
  egg:       'Environment/Shelf/egg.png',
  milk:      'Environment/Shelf/blue_bottle.png',
  bread:     'Environment/Shelf/bread.png',
  banana:    'Environment/Shelf/banana.png',
  blueberry: 'Environment/Shelf/blueberrys.png',
  cheese:    'Environment/Shelf/cheese.png',
  salami:    'Environment/Shelf/salami.png',
  butter:    'Environment/Shelf/butter.png',
  oats:      'Environment/Shelf/oats_base.png',
  flour:     'Environment/Shelf/flour_base.png',
};

// Pop one random ingredient of the given dish out of the pot.
// Used during cooking so the visualization matches the recipe in progress
// — a Pancakes cook shows flour / egg / milk popping, not random foods.
export function spawnIngredient(dish, opts = {}) {
  if (!dish) return;
  const realTags = dish.requires.filter(r => INGREDIENT_SPRITES[r]);
  if (realTags.length === 0) return;
  const tag = realTags[Math.floor(Math.random() * realTags.length)];
  spawnDish(INGREDIENT_SPRITES[tag], {
    offsetX: opts.offsetX || 0,
    size: opts.size || 60,
    auto: opts.auto !== false,
  });
}

// ---------- Ghost finger (auto-cook) ----------

export function spawnGhostFinger(offsetX = 0) {
  const f = document.createElement('img');
  f.className = 'ghost-finger';
  f.src = spritePath('Cursor/Finger_Click_Glove.png');
  f.style.setProperty('--gx', offsetX + 'px');
  $ghostLayer.appendChild(f);
  setTimeout(() => f.remove(), 450);
}

// ---------- Splash (water around the pot) ----------

let splashTimer = null;
export function pickSplashFor(value) {
  return SPLASH_TIERS.find(t => value < t.maxValue) || SPLASH_TIERS[SPLASH_TIERS.length - 1];
}
export function playSplash(splashTier) {
  const frame = Math.floor(Math.random() * splashTier.frames);
  const num = String(frame).padStart(2, '0');
  $splash.src = spritePath(`Animations/Splashes/${splashTier.folder}/${splashTier.prefix}${num}.png`);
  $splash.style.width = splashTier.w + 'px';
  $splash.classList.add('show');
  clearTimeout(splashTimer);
  splashTimer = setTimeout(() => $splash.classList.remove('show'), 280);
}

// ---------- Glow burst ----------

export function showGlow() {
  $glow.classList.remove('show');
  void $glow.offsetWidth;
  $glow.classList.add('show');
  setTimeout(() => $glow.classList.remove('show'), 600);
}

// ---------- Floating "+$X" coin ----------

export function spawnFloat(text, x, y, variant = '') {
  const el = document.createElement('div');
  el.className = 'float-coin' + (variant ? ' ' + variant : '');
  el.textContent = text;
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  $float.appendChild(el);
  setTimeout(() => el.remove(), variant === 'big' ? 1700 : 1200);
}

// ---------- Screen flash on dish completion ----------
const $flash = document.getElementById('screen-flash');
let flashTimer = null;
export function flashScreen(kind) {
  if (!$flash) return;
  $flash.className = 'screen-flash flash-' + kind;
  void $flash.offsetWidth;
  $flash.classList.add('show');
  clearTimeout(flashTimer);
  flashTimer = setTimeout(() => $flash.classList.remove('show'), 700);
}

// ---------- Cooking progress widget ----------
const $progress       = document.getElementById('cook-progress');
const $progressIcon   = document.getElementById('progress-icon');
const $progressName   = document.getElementById('progress-name');
const $progressFill   = document.getElementById('progress-fill');
const $progressClicks = document.getElementById('progress-clicks');
const $progressValue  = document.getElementById('progress-value');

export function refreshProgressUI(dish, cost, progress, payout) {
  if (!$progress) return;
  $progress.classList.remove('hidden');
  $progressIcon.src = spritePath(`Dish/${dish.name}.png`);
  $progressName.textContent = dish.name.replace(/_/g, ' ');
  const pct = Math.min(100, (progress / cost) * 100);
  $progressFill.style.width = pct + '%';
  $progressClicks.textContent = `${Math.floor(Math.min(progress, cost))} / ${cost}`;
  if (payout != null) $progressValue.textContent = `Worth $${fmt(payout)}`;
}

export function hideProgressUI() {
  $progress?.classList.add('hidden');
}

// ---------- Cooking flavor banner ----------

export function spawnFlavor(text, type) {
  const el = document.createElement('div');
  el.className = 'flavor ' + type;
  el.textContent = text;
  // CSS positions it at left:50% top:32%; animation handles the float-up.
  $float.appendChild(el);
  setTimeout(() => el.remove(), 1700);
}

// ---------- Particle leaves ----------

export function spawnLeaf() {
  const leaf = document.createElement('img');
  leaf.className = 'leaf';
  leaf.src = spritePath(`Particles/${Math.random() < 0.5 ? 'Leaf' : 'LeafParticle'}.png`);
  leaf.style.left = Math.random() * 100 + 'vw';
  leaf.style.setProperty('--drift', (Math.random() * 240 - 120) + 'px');
  leaf.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
  const dur = 5 + Math.random() * 5;
  leaf.style.animationDuration = dur + 's';
  leaf.style.width = (24 + Math.random() * 24) + 'px';
  $particles.appendChild(leaf);
  setTimeout(() => leaf.remove(), dur * 1000 + 200);
}

export function burstLeaves(n) {
  for (let i = 0; i < n; i++) setTimeout(spawnLeaf, i * 35);
}

// ---------- Element-class restart helper ----------
// Toggling an animation class without forcing reflow won't restart the
// animation; this small helper fixes that.
export function retriggerClass(el, cls, removeAfter = 0) {
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
  if (removeAfter) setTimeout(() => el.classList.remove(cls), removeAfter);
}
