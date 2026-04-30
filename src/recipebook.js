// Recipe book modal — shows every recipe; undiscovered ones appear as
// silhouettes with a `???` name.

import { state } from './state.js';
import { DISHES } from './config.js';
import { spritePath, fmt } from './util.js';

const $panel = document.getElementById('panel-recipes');
const $list  = document.getElementById('recipes-list');

export function renderRecipeBook() {
  $list.innerHTML = '';
  const cooked = state.cookedRecipes;
  const total = DISHES.length;
  const found = [...DISHES].filter(d => cooked.has(d.name)).length;

  const header = document.createElement('div');
  header.className = 'panel-summary';
  header.textContent = `${found} / ${total} recipes discovered`;
  $list.appendChild(header);

  const grid = document.createElement('div');
  grid.className = 'recipe-grid';

  for (const dish of DISHES) {
    const discovered = cooked.has(dish.name);
    const card = document.createElement('div');
    card.className = 'recipe-card' + (discovered ? '' : ' locked');

    const img = document.createElement('img');
    img.src = spritePath(discovered ? `Dish/${dish.name}.png` : 'Book/Questionmark.png');
    img.className = 'recipe-img';
    card.appendChild(img);

    const info = document.createElement('div');
    info.className = 'recipe-info';

    const name = document.createElement('div');
    name.className = 'recipe-name';
    name.textContent = discovered ? dish.name.replace(/_/g, ' ') : '???';
    info.appendChild(name);

    if (discovered) {
      const value = document.createElement('div');
      value.className = 'recipe-value';
      value.textContent = `$${fmt(dish.value)}`;
      info.appendChild(value);

      const reqs = document.createElement('div');
      reqs.className = 'recipe-reqs';
      reqs.textContent = dish.requires.join(' • ');
      info.appendChild(reqs);
    } else {
      const hint = document.createElement('div');
      hint.className = 'recipe-reqs';
      hint.textContent = `${dish.requires.length} ingredient${dish.requires.length === 1 ? '' : 's'}`;
      info.appendChild(hint);
    }

    card.appendChild(info);
    grid.appendChild(card);
  }

  $list.appendChild(grid);
}

export const recipeBookPanel = $panel;
