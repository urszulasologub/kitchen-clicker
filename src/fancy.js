// Fancy tier system. As cps grows the kitchen escalates through 5 levels
// of visual chaos. Crossing a threshold flashes a banner and bursts leaves.

import { $scene, $frenzy } from './dom.js';
import { state } from './state.js';
import { FANCY_THRESHOLDS, FANCY_LABELS } from './config.js';
import { spawnLeaf, burstLeaves, retriggerClass } from './effects.js';

function tierForCps(cps) {
  for (let i = FANCY_THRESHOLDS.length - 1; i > 0; i--) {
    if (cps >= FANCY_THRESHOLDS[i]) return i;
  }
  return 0;
}

function flashFrenzy(label) {
  if (!label) return;
  $frenzy.textContent = label;
  retriggerClass($frenzy, 'show', 1400);
}

export function applyFancyTier() {
  const t = tierForCps(state.cps);
  if (t === state.fancy) return;
  for (let i = 0; i <= 5; i++) $scene.classList.remove(`fancy-${i}`);
  if (t > 0) $scene.classList.add(`fancy-${t}`);
  if (t > state.fancy) {
    flashFrenzy(FANCY_LABELS[t]);
    burstLeaves(20 + t * 8);
  }
  state.fancy = t;
}

// ---------- Periodic leaf rain at high tiers ----------

const LEAF_RATE = { 3: 1.5, 4: 4, 5: 8 }; // leaves/sec by tier
let leafAccum = 0;

export function leafTick(dt) {
  const rate = LEAF_RATE[state.fancy];
  if (!rate) { leafAccum = 0; return; }
  leafAccum += dt;
  const interval = 1 / rate;
  while (leafAccum > interval) {
    leafAccum -= interval;
    spawnLeaf();
  }
}
