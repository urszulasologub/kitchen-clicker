// Achievement definitions + check loop. Achievements are checked once per
// frame; on first match, the ID is added to state.achievements and a toast
// is fired.

import { state } from './state.js';
import { DISHES } from './config.js';
import { toast } from './toast.js';
import { spritePath } from './util.js';
import { playSfx } from './audio.js';

// Each achievement has:
//   id:    stable string for save persistence
//   name:  shown in toast and panel
//   desc:  one-line description
//   check: returns true once unlocked
export const ACHIEVEMENTS = [
  { id: 'first-cook',    name: 'First Steps',     desc: 'Cook your first dish.',
    check: s => s.totalDishesCooked >= 1 },
  { id: 'sous-chef',     name: 'Sous Chef',       desc: 'Cook 100 dishes.',
    check: s => s.totalDishesCooked >= 100 },
  { id: 'master-chef',   name: 'Master Chef',     desc: 'Cook 1,000 dishes.',
    check: s => s.totalDishesCooked >= 1000 },
  { id: 'iron-chef',     name: 'Iron Chef',       desc: 'Cook 10,000 dishes.',
    check: s => s.totalDishesCooked >= 10000 },

  { id: 'penny',         name: 'Penny Pincher',   desc: 'Earn $100 total.',
    check: s => s.totalEarned >= 100 },
  { id: 'thousand',      name: 'Thousandaire',    desc: 'Earn $1,000 total.',
    check: s => s.totalEarned >= 1000 },
  { id: 'mil',           name: 'High Roller',     desc: 'Earn $1,000,000 total.',
    check: s => s.totalEarned >= 1_000_000 },
  { id: 'bil',           name: 'Bread Tycoon',    desc: 'Earn $1,000,000,000 total.',
    check: s => s.totalEarned >= 1_000_000_000 },

  { id: 'recipe-10',     name: 'Recipe Hunter',   desc: 'Discover 10 recipes.',
    check: s => s.cookedRecipes.size >= 10 },
  { id: 'recipe-25',     name: 'Recipe Collector', desc: 'Discover 25 recipes.',
    check: s => s.cookedRecipes.size >= 25 },
  { id: 'recipe-all',    name: 'Cookbook Complete', desc: 'Discover every recipe.',
    check: s => s.cookedRecipes.size >= DISHES.length },

  { id: 'tier-1',        name: 'Warming Up',      desc: 'Reach +5 / sec.',
    check: s => s.fancy >= 1 },
  { id: 'tier-3',        name: 'Kitchen Party',   desc: 'Reach +200 / sec.',
    check: s => s.fancy >= 3 },
  { id: 'tier-5',        name: 'Disco Inferno',   desc: 'Reach +5,000 / sec.',
    check: s => s.fancy >= 5 },

  { id: 'shopper',       name: 'Shopper',         desc: 'Buy 10 upgrades.',
    check: s => s.upgradesBought >= 10 },
  { id: 'investor',      name: 'Investor',        desc: 'Buy 50 upgrades.',
    check: s => s.upgradesBought >= 50 },
  { id: 'mogul',         name: 'Kitchen Mogul',    desc: 'Buy 200 upgrades.',
    check: s => s.upgradesBought >= 200 },

  { id: 'banana-pile',   name: 'Banana Mountain', desc: 'Own 25 bananas.',
    check: s => (s.bought.banana || 0) >= 25 },
  { id: 'all-tools',     name: 'Fully Equipped',  desc: 'Own every one-time tool.',
    check: s => ['stove','basket','blender','oven','knife','spice','hat',
                 'kettle','shelves','furniture','cheesestand']
                  .every(id => s.bought[id]) },
  { id: 'all-skills',    name: 'Culinary Genius',  desc: 'Own all 5 skill upgrades.',
    check: s => ['towel','cookbook','sharpknives','plating','michelin']
                  .every(id => s.bought[id]) },

  { id: 'butterfingers', name: 'Butterfingers',   desc: 'Fail 50 cooks.',
    check: s => s.failedCooks >= 50 },
  { id: 'big-tip',       name: 'Big Tip',         desc: 'Earn $10,000 from a single dish.',
    check: s => s.biggestDishValue >= 10000 },

  { id: 'first-awesome', name: 'Awesome!',        desc: 'Cook your first awesome dish.',
    check: s => s.awesomeCooks >= 1 },
  { id: 'awesome-100',   name: 'Five Stars',      desc: 'Cook 100 awesome dishes.',
    check: s => s.awesomeCooks >= 100 },
  { id: 'master-touch',  name: 'Master Touch',
    desc: 'Reduce bad-cook chance to its minimum.',
    check: s => s.badRate <= 0.06 },
];

const byId = Object.fromEntries(ACHIEVEMENTS.map(a => [a.id, a]));

export function getAchievement(id) { return byId[id]; }

export function checkAchievements() {
  for (const a of ACHIEVEMENTS) {
    if (state.achievements.has(a.id)) continue;
    if (a.check(state)) unlock(a);
  }
}

function unlock(a) {
  state.achievements.add(a.id);
  playSfx('achievement');
  toast(a.desc, {
    title: a.name,
    kind: 'achievement',
    icon: spritePath('UI/NEW_STAR.png'),
    long: true,
  });
}
