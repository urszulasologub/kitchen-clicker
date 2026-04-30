// Upgrade card UI + purchases (the items that pile up on shelves and counter).

import { $upgrades, $purchases, $book } from './dom.js';
import { state } from './state.js';
import { UPGRADES, COST_SCALING } from './config.js';
import { fmt, spritePath } from './util.js';
import { animateBasketOpen } from './basket.js';

// ---------- Special-case purchase callbacks ----------
// Keeps `config.js` as pure data — the basket animation lives in basket.js.
const ON_BUY = {
  basket: animateBasketOpen,
};

// ---------- Cost scaling ----------
export function costFor(upg) {
  const owned = state.bought[upg.id] || 0;
  return Math.floor(upg.baseCost * Math.pow(COST_SCALING, owned));
}

// ---------- Upgrade card DOM ----------
const upgradeEls = {}; // id -> { root, cost, count }

export function buildUpgrades() {
  $upgrades.innerHTML = '';
  for (const upg of UPGRADES) {
    const el = document.createElement('div');
    el.className = 'upgrade locked';
    el.innerHTML = `
      <img class="icon" src="${spritePath(upg.icon)}" />
      <div class="info">
        <div class="name">${upg.name}</div>
        <div class="desc">${upg.desc}</div>
        <div class="cost"></div>
      </div>
      <div class="count" style="display:none"></div>
    `;
    el.addEventListener('click', () => buy(upg));
    $upgrades.appendChild(el);
    upgradeEls[upg.id] = {
      root:  el,
      cost:  el.querySelector('.cost'),
      count: el.querySelector('.count'),
    };
  }
}

export function refreshUpgrades() {
  for (const upg of UPGRADES) {
    const owned = state.bought[upg.id] || 0;
    const cost = costFor(upg);
    const affordable = state.coins >= cost;
    const refs = upgradeEls[upg.id];

    if (upg.oneTime && owned > 0) {
      refs.cost.textContent = '✓ Owned';
      refs.root.classList.remove('locked', 'affordable');
      refs.root.classList.add('owned');
    } else {
      refs.cost.textContent = '$' + fmt(cost);
      refs.root.classList.toggle('locked', !affordable);
      refs.root.classList.toggle('affordable', affordable);
    }
    if (owned > 0 && !upg.oneTime) {
      refs.count.style.display = '';
      refs.count.textContent = 'x' + owned;
    }
  }
}

function shakeBook() {
  $book.animate(
    [{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' },
     { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }],
    { duration: 200 },
  );
}

export function buy(upg) {
  if (upg.oneTime && state.bought[upg.id]) return; // already owned
  const cost = costFor(upg);
  if (state.coins < cost) {
    shakeBook();
    return;
  }
  state.coins -= cost;
  state.bought[upg.id] = (state.bought[upg.id] || 0) + 1;
  state.upgradesBought++;

  if (upg.type === 'click') state.clickPower += upg.power;
  if (upg.type === 'auto')  state.cps        += upg.power;
  // Optional cross-type bonus (only on first purchase of a one-time upgrade)
  if (upg.oneTime && state.bought[upg.id] === 1) {
    if (upg.clickBonus) state.clickPower += upg.clickBonus;
    if (upg.autoBonus)  state.cps        += upg.autoBonus;
  }
  if (upg.unlocks) upg.unlocks.forEach(t => state.unlocked.add(t));

  ON_BUY[upg.id]?.();
  if (upg.sprite) spawnPurchase(upg);

  refreshUpgrades();
}

// ---------- Purchase items piling on shelf/counter ----------

const purchasedImgs = {}; // id -> [HTMLImageElement, ...]

export function spawnPurchase(upg) {
  if (!purchasedImgs[upg.id]) purchasedImgs[upg.id] = [];
  const list = purchasedImgs[upg.id];
  const layout = upg.layout;

  // Past visual cap — bounce a random existing instance to acknowledge the buy
  if (list.length >= layout.max) {
    const img = list[Math.floor(Math.random() * list.length)];
    img.classList.remove('bounce');
    void img.offsetWidth;
    img.classList.add('bounce');
    setTimeout(() => img.classList.remove('bounce'), 360);
    return;
  }

  const idx = list.length;
  const row = Math.floor(idx / layout.perRow);
  const col = idx % layout.perRow;
  // jitter so stacks don't look gridded
  const jx = (Math.random() - 0.5) * 0.4;
  const jy = (Math.random() - 0.5) * 0.3;
  const x = layout.x + col * layout.stepX + jx;
  const y = layout.y + row * layout.stepY + jy;

  const img = document.createElement('img');
  img.className = 'purchase';
  img.src = spritePath(upg.sprite);
  img.style.left = x + 'vw';
  if (layout.anchor === 'bottom') img.style.bottom = y + 'vh';
  else                            img.style.top    = y + 'vh';
  img.style.height = layout.size + 'px';
  // Higher rows render behind; later items in row render in front.
  img.style.zIndex = String(2 + (12 - row) * 3 + col);
  $purchases.appendChild(img);
  list.push(img);
  requestAnimationFrame(() => img.classList.add('show'));
}

// ---------- Restoration on load ----------
//
// Re-create the purchase pile (without animations) for items already bought
// and re-apply unlocks/cps/click-power totals from `state.bought`.
export function restorePurchasesFromState() {
  for (const upg of UPGRADES) {
    const count = state.bought[upg.id] || 0;
    if (!count) continue;
    if (upg.sprite) {
      // Spawn the visible pile silently (no entry animation)
      for (let i = 0; i < Math.min(count, upg.layout.max); i++) {
        spawnPurchase(upg);
      }
      // Also bounce-cap the rest so the count badge is correct (no extra DOM)
    }
  }
}
