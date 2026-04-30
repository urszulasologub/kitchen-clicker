// Keyboard shortcuts: Space = cook, 1-9 = buy upgrade by visible index,
// R = recipe book, A = achievements, T = stats, Esc = close panel.

import { cook } from './cooking.js';
import { save } from './state.js';
import { UPGRADES } from './config.js';
import { buy } from './upgrades.js';
import { togglePanel, closeAllPanels } from './panels.js';

export function wireKeyboard() {
  window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    // ignore when typing in any input/textarea/contenteditable
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;

    switch (e.key) {
      case ' ':
        e.preventDefault();
        cook();
        save();
        return;
      case 'c': case 'C':
        e.preventDefault();
        togglePanel('recipes');
        return;
      case 'a': case 'A':
        e.preventDefault();
        togglePanel('achievements');
        return;
      case 't': case 'T':
        e.preventDefault();
        togglePanel('stats');
        return;
      case 'Escape':
        closeAllPanels();
        return;
    }

    // Number keys 1-9 → buy upgrade by index (only what's currently visible)
    if (e.key >= '1' && e.key <= '9') {
      const idx = parseInt(e.key, 10) - 1;
      const upg = UPGRADES[idx];
      if (upg) buy(upg);
    }
  });
}
