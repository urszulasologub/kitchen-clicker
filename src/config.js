// All game-balance data: dishes, upgrades, flavor text, tier thresholds.
// Pure data — no DOM, no side effects.

// ---------- Tunable constants ----------
export const FAIL_RATE = 0.04;            // probability a completed dish fails
export const POSITIVE_FLAVOR_RATE = 0.30; // chance of bonus positive flavor on success
export const COST_SCALING = 1.22;         // each repurchase multiplies cost by this
export const STARTER_UNLOCKS = ['pan', 'egg']; // tags unlocked at game start

// Tools don't count as ingredients for click-cost purposes
const TOOL_TAGS = new Set(['pan', 'oven', 'blender']);

// How many click-progress points a dish needs to complete.
// Scales with the count of real ingredients (excluding tools).
export function clickCostOf(dish) {
  const real = dish.requires.filter(r => !TOOL_TAGS.has(r)).length;
  return Math.max(3, real * 3);
}

// Fancy tier thresholds (cps required to enter each tier)
export const FANCY_THRESHOLDS = [0, 5, 50, 200, 1000, 5000];
export const FANCY_LABELS = [
  '', 'WARMING UP!', 'GETTING TASTY!', 'KITCHEN PARTY!',
  'COOKING FRENZY!', 'BREAKFAST DISCO!!!',
];

// ---------- Recipes ----------
// Dishes need ingredients/tools to be cookable. Tags come from STARTER_UNLOCKS
// (free) or from upgrades' `unlocks` arrays.
// Values curve approximately by ingredient count, smoothed so unlocking a new
// tag doesn't 20× the average click. Picker weighting (in cooking.js) biases
// toward LOW values — high-value dishes are rare bonus moments.
export const DISHES = [
  // 1 real ingredient (+ tool) — pocket change
  { name: 'Boiled_Egg',        value: 1,    requires: ['egg'] },
  { name: 'Sunny_Side_Up_Egg', value: 1,    requires: ['egg', 'pan'] },
  { name: 'Hot_Milk',          value: 2,    requires: ['milk'] },
  { name: 'Burned_Toast',      value: 1,    requires: ['bread', 'pan'] },
  { name: 'Crispy_Toast',      value: 1,    requires: ['bread', 'pan'] },
  { name: 'Flat_Bread',        value: 2,    requires: ['flour', 'pan'] },
  { name: 'Fried_Banana',      value: 2,    requires: ['banana', 'pan'] },
  { name: 'Salami_Rose',       value: 5,    requires: ['salami'] },
  { name: 'Ghee',              value: 15,   requires: ['butter', 'pan'] },

  // 2 real ingredients
  { name: 'Egg_Sandwich',     value: 5,   requires: ['bread', 'egg'] },
  { name: 'Cheese_Sandwich',  value: 4,   requires: ['bread', 'cheese'] },
  { name: 'Salami_Sandwich',  value: 6,   requires: ['bread', 'salami'] },
  { name: 'Plain_Porridge',   value: 6,   requires: ['oats', 'milk'] },
  { name: 'Blueberry_Jam',    value: 12,  requires: ['blueberry', 'butter'] },
  { name: 'Fruit_Salad',      value: 25,  requires: ['banana', 'blueberry'] },

  // 3 real ingredients
  { name: 'Banana_Milk',     value: 12,  requires: ['banana', 'milk', 'blender'] },
  { name: 'Blueberry_Milk',  value: 14,  requires: ['blueberry', 'milk', 'blender'] },
  { name: 'French_Toast',    value: 12,  requires: ['bread', 'egg', 'milk', 'pan'] },
  { name: 'Cheese_Salami_Sandwich', value: 22,  requires: ['bread', 'cheese', 'salami'] },
  { name: 'Banana_Porridge',        value: 30,  requires: ['oats', 'milk', 'banana'] },
  { name: 'Blueberry_Porridge',     value: 35,  requires: ['oats', 'milk', 'blueberry'] },

  // 4 real ingredients
  { name: 'Pancakes',           value: 22,  requires: ['flour', 'egg', 'milk', 'pan'] },
  { name: 'Egg_Cheese_Sandwich',  value: 50,  requires: ['bread', 'egg', 'cheese'] },
  { name: 'Egg_Salami_Sandwich',  value: 60,  requires: ['bread', 'egg', 'salami'] },
  { name: 'Banana_Pancakes',      value: 50,  requires: ['flour', 'egg', 'milk', 'banana', 'pan'] },
  { name: 'Blueberry_Pancakes',   value: 55,  requires: ['flour', 'egg', 'milk', 'blueberry', 'pan'] },
  { name: 'Banana_French_Toast',    value: 60,  requires: ['bread', 'egg', 'milk', 'banana', 'pan'] },
  { name: 'Blueberry_French_Toast', value: 70,  requires: ['bread', 'egg', 'milk', 'blueberry', 'pan'] },
  { name: 'Charcuterie_Board',    value: 80,  requires: ['bread', 'cheese', 'salami'] },
  { name: 'Banana_Bread',         value: 110, requires: ['flour', 'banana', 'butter', 'oven'] },
  { name: 'Fondue',               value: 200, requires: ['cheese', 'milk', 'butter'] },

  // 5+ real ingredients
  { name: 'Egg_Cheese_Salami_Sandwich', value: 90,  requires: ['bread', 'egg', 'cheese', 'salami'] },
  { name: 'Blueberry_Banana_Porridge',  value: 110, requires: ['oats', 'milk', 'banana', 'blueberry'] },
  { name: 'Healthy_Pancakes',        value: 110, requires: ['flour', 'egg', 'milk', 'oats', 'pan'] },
  { name: 'Smoothie',                value: 130, requires: ['banana', 'blueberry', 'milk', 'blender'] },
  { name: 'Healthy_Blueberry_Pancakes', value: 160, requires: ['flour', 'egg', 'milk', 'oats', 'blueberry', 'pan'] },
  { name: 'Baked_Banana',  value: 180, requires: ['banana', 'butter', 'oven'] },
  { name: 'Mug_Cake',      value: 200, requires: ['flour', 'egg', 'butter', 'oven'] },
  { name: 'Granola',       value: 220, requires: ['oats', 'butter', 'oven'] },
  { name: 'Quiche',        value: 380, requires: ['flour', 'egg', 'cheese', 'milk', 'oven'] },
];

export const FAILED_DISHES = [
  'A_Painting', 'Baby_Groot', 'Banana_Mess', 'Bland_Sandwich',
  'Blueberry_Mess', 'Covered_Mess', 'Eggy_Mess', 'Fancy_Mess',
  'Flowery_Mess', 'Food_Drawing', 'Food_Monster', 'Getting_Mugged',
  'Mess_in_a_Mug', 'Monster_Cocktail', 'Salty_Mess', 'Scary_Porridge',
];

// ---------- Upgrades ----------
// type:    'click' (adds to click power) or 'auto' (adds to coins/sec)
// power:   amount added per purchase
// unlocks: tags added to state.unlocked on first purchase (idempotent)
// oneTime: single-purchase unlock; no stacking, gets the ✓ Owned state
// sprite:  optional shelf/counter sprite; each instance bought spawns one
// layout:  where instances pile up (anchor: 'top' for shelf, 'bottom' for counter)
export const UPGRADES = [
  {
    id: 'banana', name: 'Banana Boost', desc: '+1 per click • bananas',
    icon: 'Icons/banana_chalk.png', baseCost: 25, type: 'click', power: 1,
    unlocks: ['banana'],
    sprite: 'Environment/Shelf/banana.png',
    layout: { anchor: 'bottom', x: 4, y: 9, stepX: 1.3, stepY: 1.0, perRow: 5, max: 25, size: 50 },
  },
  {
    id: 'basket', name: 'Bread Basket', desc: '+2 per click • unlocks bread',
    icon: 'Icons/bread_chalk.png', baseCost: 150, type: 'click', power: 2,
    oneTime: true, unlocks: ['bread'],
  },
  {
    id: 'egg', name: 'Egg Helper', desc: '+1 / sec • more eggs',
    icon: 'Icons/egg_chalk.png', baseCost: 350, type: 'auto', power: 1,
    unlocks: ['egg'],
    sprite: 'Environment/Shelf/egg.png',
    layout: { anchor: 'bottom', x: 12, y: 8, stepX: 1.1, stepY: 1.0, perRow: 6, max: 30, size: 40 },
  },
  {
    id: 'knife', name: 'Knife Block', desc: '+3 per click • +1 / sec',
    icon: 'Icons/chalk2_chalk.png', baseCost: 800, type: 'click', power: 3,
    oneTime: true, autoBonus: 1,
  },
  {
    id: 'milk', name: 'Milk Boost', desc: '+2 per click • milk',
    icon: 'Icons/milk_chalk.png', baseCost: 1500, type: 'click', power: 2,
    unlocks: ['milk'],
    sprite: 'Environment/Shelf/blue_bottle.png',
    layout: { anchor: 'top', x: 16, y: 13, stepX: 1.7, stepY: 1.2, perRow: 5, max: 25, size: 65 },
  },
  {
    id: 'blender', name: 'Blender', desc: '+3 per click • smoothies & milkshakes',
    icon: 'Icons/blue/glass_chalk.png', baseCost: 4000, type: 'click', power: 3,
    oneTime: true, unlocks: ['blender'],
  },
  {
    id: 'blueberry', name: 'Blueberry Picker', desc: '+3 / sec • blueberries',
    icon: 'Icons/blueberry_chalk.png', baseCost: 8000, type: 'auto', power: 3,
    unlocks: ['blueberry'],
    sprite: 'Environment/Shelf/blueberrys.png',
    layout: { anchor: 'top', x: 6, y: 14, stepX: 1.4, stepY: 1.0, perRow: 6, max: 30, size: 50 },
  },
  {
    id: 'cheese', name: 'Cheese Stand', desc: '+10 / sec • cheese',
    icon: 'Icons/cheese_chalk.png', baseCost: 25000, type: 'auto', power: 10,
    unlocks: ['cheese'],
    sprite: 'Environment/Shelf/cheese.png',
    layout: { anchor: 'bottom', x: 30, y: 38, stepX: 2.0, stepY: 1.4, perRow: 3, max: 12, size: 70 },
  },
  {
    id: 'spice', name: 'Spice Rack', desc: '+30 / sec • +3 per click',
    icon: 'Icons/salt_chalk.png', baseCost: 60000, type: 'auto', power: 30,
    oneTime: true, clickBonus: 3,
  },
  {
    id: 'oven', name: 'Oven', desc: '+20 / sec • baked recipes',
    icon: 'Icons/mug_chalk.png', baseCost: 100000, type: 'auto', power: 20,
    oneTime: true, unlocks: ['oven'],
  },
  {
    id: 'salami', name: 'Salami Roll', desc: '+40 / sec • salami',
    icon: 'Icons/salami_chalk.png', baseCost: 200000, type: 'auto', power: 40,
    unlocks: ['salami'],
    sprite: 'Environment/Shelf/salami.png',
    layout: { anchor: 'top', x: 50, y: 16, stepX: 1.3, stepY: 0.8, perRow: 6, max: 30, size: 50 },
  },
  {
    id: 'bread', name: 'Bread Loaf', desc: '+100 / sec',
    icon: 'Icons/bread_chalk.png', baseCost: 600000, type: 'auto', power: 100,
    sprite: 'Environment/Shelf/bread.png',
    layout: { anchor: 'bottom', x: 53, y: 38, stepX: 2.2, stepY: 1.3, perRow: 4, max: 16, size: 55 },
  },
  {
    id: 'butter', name: 'Butter Block', desc: '+6 per click • butter',
    icon: 'Icons/butter_chalk.png', baseCost: 1500000, type: 'click', power: 6,
    unlocks: ['butter'],
    sprite: 'Environment/Shelf/butter.png',
    layout: { anchor: 'top', x: 27, y: 14, stepX: 1.5, stepY: 1.0, perRow: 5, max: 25, size: 50 },
  },
  {
    id: 'oats', name: 'Oats Jar', desc: '+300 / sec • oats',
    icon: 'Icons/oats_chalk.png', baseCost: 4000000, type: 'auto', power: 300,
    unlocks: ['oats'],
    sprite: 'Environment/Shelf/oats_base.png',
    layout: { anchor: 'top', x: 37, y: 13, stepX: 1.8, stepY: 1.2, perRow: 5, max: 25, size: 60 },
  },
  {
    id: 'flour', name: 'Master Flour', desc: '+1000 / sec • flour',
    icon: 'Icons/flour_chalk.png', baseCost: 12000000, type: 'auto', power: 1000,
    unlocks: ['flour'],
    sprite: 'Environment/Shelf/flour_base.png',
    layout: { anchor: 'bottom', x: 64, y: 38, stepX: 2.0, stepY: 1.4, perRow: 3, max: 12, size: 65 },
  },
  {
    id: 'hat', name: "Chef's Hat", desc: '+30 per click • +500 / sec',
    icon: 'Icons/chalk1_chalk.png', baseCost: 30000000, type: 'click', power: 30,
    oneTime: true, autoBonus: 500,
  },
];

// ---------- Cooking flavor messages ----------
export const POSITIVE_FLAVORS = [
  'PERFECT!', 'BIG TIP!', 'CUSTOMER LOVED IT!', 'YUM!',
  "CHEF'S KISS!", 'DELICIOUS!', 'FIVE STARS!',
];
export const NEGATIVE_FLAVORS = [
  'OVERCOOKED!', 'UNDERCOOKED!', 'BURNT!', 'RAW INSIDE!',
  'TOO SALTY!', 'CUSTOMER REFUSED!', 'INEDIBLE!', "WHAT IS THAT?",
];

// Splash animation tiers — chosen by dish value
export const SPLASH_TIERS = [
  { folder: 'Tiny',   prefix: 'Tiny_Splash',   frames: 10, w: 220, maxValue: 30 },
  { folder: 'Medium', prefix: 'Medium_Splash', frames: 17, w: 360, maxValue: 300 },
  { folder: 'Huge',   prefix: 'Huge_Splash',   frames: 19, w: 520, maxValue: Infinity },
];
