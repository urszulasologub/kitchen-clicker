// Generic panel/modal toggling + the achievements and stats renderers.

import { state } from './state.js';
import { ACHIEVEMENTS } from './achievements.js';
import { DISHES } from './config.js';
import { fmt, spritePath } from './util.js';
import { renderRecipeBook } from './recipebook.js';

const RENDERERS = {
  recipes:      renderRecipeBook,
  achievements: renderAchievements,
  stats:        renderStats,
};

export function openPanel(id) {
  closeAllPanels();
  RENDERERS[id]?.();
  document.getElementById('panel-' + id)?.classList.add('open');
  document.getElementById('panel-backdrop')?.classList.add('open');
}

export function closeAllPanels() {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('open'));
  document.getElementById('panel-backdrop')?.classList.remove('open');
}

export function togglePanel(id) {
  const el = document.getElementById('panel-' + id);
  if (el?.classList.contains('open')) closeAllPanels();
  else openPanel(id);
}

// ---------- Achievements ----------

function renderAchievements() {
  const $list = document.getElementById('achievements-list');
  $list.innerHTML = '';
  const total = ACHIEVEMENTS.length;
  const earned = ACHIEVEMENTS.filter(a => state.achievements.has(a.id)).length;

  const summary = document.createElement('div');
  summary.className = 'panel-summary';
  summary.textContent = `${earned} / ${total} unlocked`;
  $list.appendChild(summary);

  const grid = document.createElement('div');
  grid.className = 'achievements-grid';

  for (const a of ACHIEVEMENTS) {
    const got = state.achievements.has(a.id);
    const card = document.createElement('div');
    card.className = 'ach-card' + (got ? ' got' : ' locked');

    const badge = document.createElement('div');
    badge.className = 'ach-badge';
    if (got) {
      const img = document.createElement('img');
      img.src = spritePath('UI/NEW_STAR.png');
      img.alt = '';
      badge.appendChild(img);
    }
    card.appendChild(badge);

    const body = document.createElement('div');
    body.className = 'ach-body';

    const name = document.createElement('div');
    name.className = 'ach-name';
    name.textContent = got ? a.name : '???';
    body.appendChild(name);

    const desc = document.createElement('div');
    desc.className = 'ach-desc';
    desc.textContent = a.desc;
    body.appendChild(desc);

    card.appendChild(body);
    grid.appendChild(card);
  }
  $list.appendChild(grid);
}

// ---------- Stats ----------

function formatTime(s) {
  s = Math.floor(s);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h) return `${h}h ${m}m ${sec}s`;
  if (m) return `${m}m ${sec}s`;
  return `${sec}s`;
}

function renderStats() {
  const $list = document.getElementById('stats-list');
  $list.innerHTML = '';

  const rows = [
    ['Coins on hand',         '$' + fmt(state.coins)],
    ['Total earned',          '$' + fmt(state.totalEarned)],
    ['Per click',             '+' + fmt(state.clickPower)],
    ['Per second',            '+' + fmt(state.cps)],
    ['Total clicks',          fmt(state.totalClicks)],
    ['Dishes cooked',         fmt(state.totalDishesCooked)],
    ['Failed dishes',         fmt(state.failedCooks)],
    ['Awesome dishes',        fmt(state.awesomeCooks)],
    ['Bad-cook chance',       (state.badRate * 100).toFixed(0) + '%'],
    ['Awesome-cook chance',   (state.awesomeRate * 100).toFixed(0) + '%'],
    ['Best single dish',      '$' + fmt(state.biggestDishValue)],
    ['Recipes discovered',    `${state.cookedRecipes.size} / ${DISHES.length}`],
    ['Achievements unlocked', `${state.achievements.size} / ${ACHIEVEMENTS.length}`],
    ['Upgrades bought',       fmt(state.upgradesBought)],
    ['Time playing',          formatTime(state.playTimeSeconds)],
    ['Current tier',          state.fancy === 0 ? '—' : `Tier ${state.fancy}`],
  ];

  for (const [label, value] of rows) {
    const row = document.createElement('div');
    row.className = 'stat-row';
    const k = document.createElement('div');
    k.className = 'stat-label';
    k.textContent = label;
    const v = document.createElement('div');
    v.className = 'stat-value';
    v.textContent = value;
    row.appendChild(k);
    row.appendChild(v);
    $list.appendChild(row);
  }
}
