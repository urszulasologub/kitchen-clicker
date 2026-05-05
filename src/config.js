// All game-balance data: dishes, upgrades, flavor text, tier thresholds.
// Pure data — no DOM, no side effects.

// ---------- Tunable constants ----------
export const COST_SCALING = 1.22;         // each repurchase multiplies cost by this
export const STARTER_UNLOCKS = ['egg']; // tags unlocked at game start

// Cooking quality — rolled at dish completion.
//   BAD     → 0 coins, big red banner, screen shake
//   REGULAR → 1× payout, small calm text ("served.")
//   AWESOME → 5× payout, huge rainbow banner, gold flash
// Player starts struggling — one-time upgrades shift the odds in their favor.
export const BASE_BAD_RATE     = 0.25;    // ~1 in 4 dishes ruined at start
export const BASE_AWESOME_RATE = 0.05;    // ~1 in 20 dishes great at start
export const MIN_BAD_RATE      = 0.03;    // floor — even master chefs slip
export const MAX_AWESOME_RATE  = 0.45;    // cap — awesome can't be the norm
export const AWESOME_MULT      = 5;       // payout multiplier on awesome cooks

// Effort to cook a dish (progress points). Decoupled from `value` (payout):
// a dish always needs ten times its dollar worth in clicks, with a floor
// of 10 so the very cheapest start at exactly 10 clicks. Click power AND cps
// both fill the bar, so as you level up these costs melt away.
//   value=1   → 10    (Boiled Egg, Crispy Toast)
//   value=5   → 50    (Salami Rose, Egg Sandwich)
//   value=22  → 220   (Pancakes, Cheese Salami Sandwich)
//   value=80  → 800   (Charcuterie Board)
//   value=130 → 1300  (Smoothie)
//   value=200 → 2000  (Fondue, Mug Cake)
//   value=380 → 3800  (Quiche)
export const MIN_CLICK_COST = 6;
export const CLICK_COST_PER_VALUE = 10;
export function clickCostOf(dish) {
  return Math.max(MIN_CLICK_COST, dish.value * CLICK_COST_PER_VALUE);
}

// Fancy tier thresholds (cps required to enter each tier).
// Pushed up so the kitchen stays calm during the early grind and frenzy
// modes feel earned, not handed out.
export const FANCY_THRESHOLDS = [0, 25, 150, 600, 2500, 12000];
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
  { name: 'Boiled_Egg',        value: 5,     requires: ['egg'] },
  { name: 'Sunny_Side_Up_Egg', value: 5,     requires: ['egg', 'stove'] },
  { name: 'Hot_Milk',          value: 10,    requires: ['milk'] },
  { name: 'Burned_Toast',      value: 5,     requires: ['bread', 'stove'] },
  { name: 'Crispy_Toast',      value: 5,     requires: ['bread', 'stove'] },
  { name: 'Flat_Bread',        value: 10,    requires: ['flour', 'stove'] },
  { name: 'Fried_Banana',      value: 10,    requires: ['banana', 'stove'] },
  { name: 'Salami_Rose',       value: 25,    requires: ['salami'] },
  { name: 'Ghee',              value: 75,    requires: ['butter', 'stove'] },

  // 2 real ingredients
  { name: 'Egg_Sandwich',     value: 25,    requires: ['bread', 'egg'] },
  { name: 'Cheese_Sandwich',  value: 20,    requires: ['bread', 'cheese'] },
  { name: 'Salami_Sandwich',  value: 30,    requires: ['bread', 'salami'] },
  { name: 'Plain_Porridge',   value: 30,    requires: ['oats', 'milk'] },
  { name: 'Blueberry_Jam',    value: 60,    requires: ['blueberry', 'butter'] },
  { name: 'Fruit_Salad',      value: 125,   requires: ['banana', 'blueberry'] },

  // 3 real ingredients
  { name: 'Banana_Milk',     value: 60,    requires: ['banana', 'milk', 'blender'] },
  { name: 'Blueberry_Milk',  value: 70,    requires: ['blueberry', 'milk', 'blender'] },
  { name: 'French_Toast',    value: 60,    requires: ['bread', 'egg', 'milk', 'stove'] },
  { name: 'Cheese_Salami_Sandwich', value: 110,   requires: ['bread', 'cheese', 'salami'] },
  { name: 'Banana_Porridge',        value: 150,   requires: ['oats', 'milk', 'banana'] },
  { name: 'Blueberry_Porridge',     value: 175,   requires: ['oats', 'milk', 'blueberry'] },

  // 4 real ingredients
  { name: 'Pancakes',           value: 110,   requires: ['flour', 'egg', 'milk', 'stove'] },
  { name: 'Egg_Cheese_Sandwich',  value: 250,   requires: ['bread', 'egg', 'cheese'] },
  { name: 'Egg_Salami_Sandwich',  value: 300,   requires: ['bread', 'egg', 'salami'] },
  { name: 'Banana_Pancakes',      value: 250,   requires: ['flour', 'egg', 'milk', 'banana', 'stove'] },
  { name: 'Blueberry_Pancakes',   value: 275,   requires: ['flour', 'egg', 'milk', 'blueberry', 'stove'] },
  { name: 'Banana_French_Toast',    value: 300,   requires: ['bread', 'egg', 'milk', 'banana', 'stove'] },
  { name: 'Blueberry_French_Toast', value: 350,   requires: ['bread', 'egg', 'milk', 'blueberry', 'stove'] },
  { name: 'Charcuterie_Board',    value: 400,   requires: ['bread', 'cheese', 'salami'] },
  { name: 'Banana_Bread',         value: 550,   requires: ['flour', 'banana', 'butter', 'oven'] },
  { name: 'Fondue',               value: 1000,  requires: ['cheese', 'milk', 'butter', 'stove'] },

  // 5+ real ingredients
  { name: 'Egg_Cheese_Salami_Sandwich', value: 450,   requires: ['bread', 'egg', 'cheese', 'salami'] },
  { name: 'Blueberry_Banana_Porridge',  value: 550,   requires: ['oats', 'milk', 'banana', 'blueberry'] },
  { name: 'Healthy_Pancakes',        value: 550,    requires: ['flour', 'egg', 'milk', 'oats', 'stove'] },
  { name: 'Smoothie',                value: 650,    requires: ['banana', 'blueberry', 'milk', 'blender'] },
  { name: 'Healthy_Blueberry_Pancakes', value: 800,  requires: ['flour', 'egg', 'milk', 'oats', 'blueberry', 'stove'] },
  { name: 'Baked_Banana',  value: 900,   requires: ['banana', 'butter', 'oven'] },
  { name: 'Mug_Cake',      value: 1000,  requires: ['flour', 'egg', 'butter', 'oven'] },
  { name: 'Granola',       value: 1100,  requires: ['oats', 'butter', 'oven'] },
  { name: 'Quiche',        value: 1900,  requires: ['flour', 'egg', 'cheese', 'milk', 'oven'] },
];

export const FAILED_DISHES = [
  'A_Painting', 'Baby_Groot', 'Banana_Mess', 'Bland_Sandwich',
  'Blueberry_Mess', 'Covered_Mess', 'Eggy_Mess', 'Fancy_Mess',
  'Flowery_Mess', 'Food_Drawing', 'Food_Monster', 'Getting_Mugged',
  'Mess_in_a_Mug', 'Monster_Cocktail', 'Salty_Mess', 'Scary_Porridge',
];

// Pick a thematically-appropriate spoiled-dish sprite based on the recipe's
// ingredients — a ruined Boiled Egg shouldn't look like a ruined porridge.
export function spoiledFor(dish) {
  const tags = new Set(dish.requires);
  const opts = [];

  // Strong primary themes — distinct ingredients get their own mess sprite.
  if (tags.has('banana'))    opts.push('Banana_Mess', 'Baby_Groot');
  if (tags.has('blueberry')) opts.push('Blueberry_Mess');
  if (tags.has('egg'))       opts.push('Eggy_Mess');
  if (tags.has('oats'))      opts.push('Scary_Porridge');
  if (tags.has('blender'))   opts.push('Monster_Cocktail');
  if (tags.has('milk') && !tags.has('oats') && !tags.has('blender')) {
    opts.push('Mess_in_a_Mug', 'Getting_Mugged');
  }

  // Sandwich-y combinations get the Bland Sandwich
  if (tags.has('bread') && (tags.has('cheese') || tags.has('salami'))) {
    opts.push('Bland_Sandwich');
  }

  // Fallback by remaining ingredient if nothing strong matched
  if (opts.length === 0) {
    if (tags.has('bread'))       opts.push('Bland_Sandwich');
    else if (tags.has('salami')) opts.push('Flowery_Mess', 'Salty_Mess'); // Salami Rose
    else if (tags.has('cheese')) opts.push('Salty_Mess', 'Covered_Mess');
    else if (tags.has('butter')) opts.push('Covered_Mess', 'Salty_Mess'); // Ghee, etc.
    else if (tags.has('flour'))  opts.push('Food_Drawing', 'Fancy_Mess');
    else if (tags.has('oven'))   opts.push('Fancy_Mess');
  }

  if (opts.length === 0) {
    opts.push('Covered_Mess', 'Salty_Mess', 'Food_Drawing', 'Fancy_Mess');
  }
  return opts[Math.floor(Math.random() * opts.length)];
}

// ---------- Upgrades ----------
// type:    'click' (adds to click power) or 'auto' (adds to coins/sec)
// power:   amount added per purchase
// unlocks: tags added to state.unlocked on first purchase (idempotent)
// oneTime: single-purchase unlock; no stacking, gets the ✓ Owned state
// sprite:  optional shelf/counter sprite; each instance bought spawns one
// layout:  where instances pile up (anchor: 'top' for shelf, 'bottom' for counter)
export const UPGRADES = [
  {
    id: 'fridge', name: 'Fridge', desc: '+1 per click • cold storage for ingredients',
    icon: 'Icons/blue/chalk1_chalk.png', baseCost: 10, type: 'click', power: 1,
    oneTime: true,
  },
  {
    id: 'egg', name: 'Additional Eggs', desc: '+2 per click • more eggs',
    icon: 'Icons/egg_chalk.png', baseCost: 25, type: 'click', power: 2,
    unlocks: ['egg'],
    sprite: 'Environment/Shelf/egg.png',
    // Bottom door shelf of the fridge — % of fridge box
    layout: { container: 'fridge', x: 58, y: 48, stepX: 4.9, stepY: -4.4, perRow: 6, max: 12, size: 40 },
    requires: ['fridge'],
  },
  {
    id: 'banana', name: 'Banana Boost', desc: '+1 / sec • bananas',
    icon: 'Icons/banana_chalk.png', baseCost: 200, type: 'auto', power: 1,
    unlocks: ['banana'],
    sprite: 'Environment/Shelf/banana.png',
    // Bottom main shelf of the fridge (left side) — % of fridge box
    layout: { container: 'fridge', x: 10, y: 53, stepX: 8.2, stepY: -3.4, perRow: 5, max: 15, size: 44 },
    requires: ['fridge'],
  },
  {
    id: 'renovation', name: 'Renovation', desc: '+1 / sec • patches up the kitchen wall',
    icon: '../Custom-sprites/Background/wall.png', baseCost: 250,
    type: 'auto', power: 1, oneTime: true,
  },
  {
    id: 'counter', name: 'Counter', desc: '+1 / sec • prep space for cookware',
    icon: '../Custom-sprites/Background/counter.png', baseCost: 350,
    type: 'auto', power: 1, oneTime: true,
    requires: ['renovation'],
  },
  {
    id: 'basket', name: 'Bread Basket', desc: '+3 per click • unlocks bread',
    icon: 'Icons/bread_chalk.png', baseCost: 400, type: 'click', power: 3,
    oneTime: true, unlocks: ['bread'],
    requires: ['counter'],
  },
  {
    id: 'towel', name: 'Hand Towel', desc: '−5% bad cooks',
    icon: 'Icons/chalk3_chalk.png', baseCost: 500,
    oneTime: true, badReduce: 0.05,
    requires: ['counter'],
  },
  {
    id: 'stove', name: 'Stove', desc: 'Cooktop • unlocks fried recipes',
    icon: 'Icons/blue/chalk2_chalk.png', baseCost: 750,
    oneTime: true, unlocks: ['stove'],
    requires: ['counter'],
  },
  {
    id: 'knife', name: 'Knife Block', desc: '+5 per click • +2 / sec',
    icon: 'Icons/chalk2_chalk.png', baseCost: 1000, type: 'click', power: 5,
    oneTime: true, autoBonus: 2,
    requires: ['counter'],
  },
  {
    id: 'shelves', name: 'Wall Shelves', desc: 'Pantry storage on the wall',
    icon: 'Icons/blue/chalk3_chalk.png', baseCost: 1500,
    oneTime: true,
    requires: ['renovation'],
  },
  {
    id: 'milk', name: 'Milk Boost', desc: '+3 per click • milk',
    icon: 'Icons/milk_chalk.png', baseCost: 1800, type: 'click', power: 3,
    unlocks: ['milk'],
    sprite: 'Environment/Shelf/blue_bottle.png',
    // Top door shelf of the fridge — % of fridge box
    layout: { container: 'fridge', x: 57, y: 19, stepX: 3.4, stepY: -2.5, perRow: 10, max: 20, size: 50 },
    requires: ['fridge'],
  },
  {
    id: 'kettle', name: 'Coffee Kettle', desc: '+5 / sec • +2 per click',
    icon: 'Icons/blue/mug_chalk.png', baseCost: 2500, type: 'auto', power: 5,
    oneTime: true, clickBonus: 2,
    requires: ['counter'],
  },
  {
    id: 'blender', name: 'Blender', desc: '+5 per click • smoothies & milkshakes',
    icon: 'Icons/blue/glass_chalk.png', baseCost: 4000, type: 'click', power: 5,
    oneTime: true, unlocks: ['blender'],
    requires: ['counter'],
  },
  {
    id: 'furniture', name: 'Counter Furniture', desc: 'A cabinet for prep work',
    icon: 'Icons/blue/chalk4_chalk.png', baseCost: 4500,
    oneTime: true,
    requires: ['counter'],
  },
  {
    id: 'cookbook', name: 'Cookbook', desc: '+5% awesome cooks • requires shelves',
    icon: 'Icons/chalk4_chalk.png', baseCost: 6000,
    oneTime: true, awesomeBoost: 0.05,
    requires: ['shelves'],
  },
  {
    id: 'blueberry', name: 'Blueberry Picker', desc: '+3 / sec • blueberries',
    icon: 'Icons/blueberry_chalk.png', baseCost: 8000, type: 'auto', power: 3,
    unlocks: ['blueberry'],
    sprite: 'Environment/Shelf/blueberrys.png',
    // Middle door shelf of the fridge — % of fridge box
    layout: { container: 'fridge', x: 13, y: 35, stepX: 6.0, stepY: -2.5, perRow: 6, max: 12, size: 42 },
    requires: ['fridge'],
  },
  {
    id: 'cheesestand', name: 'Cheese Stand', desc: 'Display stand • requires furniture',
    icon: 'Environment/Shelf/cheese_stand.png', baseCost: 15000,
    oneTime: true, requires: ['furniture'],
  },
  {
    id: 'sharpknives', name: 'Sharp Knives', desc: '−5% bad • +3% awesome • requires shelves',
    icon: 'Icons/error_chalk.png', baseCost: 18000,
    oneTime: true, badReduce: 0.05, awesomeBoost: 0.03,
    requires: ['shelves'],
  },
  {
    id: 'wallpaper', name: 'Designer Wallpaper', desc: '+25 per click • premium kitchen finish',
    icon: '../Custom-sprites/Background/nice-wall.png', baseCost: 25000,
    type: 'click', power: 25, oneTime: true,
    requires: ['renovation'],
  },
  {
    id: 'cheese', name: 'Cheese', desc: '+10 / sec • requires cheese stand',
    icon: 'Icons/cheese_chalk.png', baseCost: 25000, type: 'auto', power: 10,
    unlocks: ['cheese'],
    sprite: 'Environment/Shelf/cheese.png',
    requires: ['cheesestand'],
    // Pile cheese pieces on top of the cheese stand — % of cheese-stand box
    layout: { container: 'cheesestand', x: 18, y: -30, stepX: 20, stepY: 0, perRow: 4, max: 4, size: 40 },
  },
  {
    id: 'spice', name: 'Spice Rack', desc: '+30 / sec • +5 per click',
    icon: 'Icons/salt_chalk.png', baseCost: 60000, type: 'auto', power: 30,
    oneTime: true, clickBonus: 5,
    requires: ['furniture'],
  },
  {
    id: 'oven', name: 'Oven', desc: '+20 / sec • baked recipes',
    icon: 'Icons/mug_chalk.png', baseCost: 100000, type: 'auto', power: 20,
    oneTime: true, unlocks: ['oven'],
    requires: ['counter'],
  },
  {
    id: 'plating', name: 'Plating Course', desc: '+8% awesome cooks',
    icon: 'Icons/flower_chalk.png', baseCost: 180000,
    oneTime: true, awesomeBoost: 0.08,
    requires: ['oven'],
  },
  {
    id: 'salami', name: 'Salami Roll', desc: '+40 / sec • salami',
    icon: 'Icons/salami_chalk.png', baseCost: 200000, type: 'auto', power: 40,
    unlocks: ['salami'],
    sprite: 'Environment/Shelf/salami.png',
    layout: { container: 'fridge', x: 10, y: 67, stepX: 5, stepY: -2, perRow: 8, max: 16, size: 56 },
    requires: ['fridge'],
  },
  {
    id: 'bread', name: 'Bread Loaf', desc: '+100 / sec',
    icon: 'Icons/bread_chalk.png', baseCost: 600000, type: 'auto', power: 100,
    sprite: 'Environment/Shelf/bread.png',
    // Spilled out below the basket — % of basket box. y > 100 puts the
    // loaves just under the basket's bottom edge.
    layout: { container: 'basket', x: 12, y: 105, stepX: 20, stepY: 22, perRow: 5, max: 5, size: 50 },
    requires: ['basket'],
  },
  {
    id: 'butter', name: 'Butter Block', desc: '+10 per click • butter',
    icon: 'Icons/butter_chalk.png', baseCost: 1500000, type: 'click', power: 10,
    unlocks: ['butter'],
    sprite: 'Environment/Shelf/butter.png',
    // Bottom main shelf of the fridge (right side, next to bananas) — % of fridge box
    layout: { container: 'fridge', x: 13.0, y: 19, stepX: 8, stepY: -3, perRow: 4, max: 8, size: 38 },
    requires: ['fridge'],
  },
  {
    id: 'michelin', name: 'Michelin Touch', desc: '−5% bad • +10% awesome',
    icon: 'Icons/unknwon_chalk.png', baseCost: 3000000,
    oneTime: true, badReduce: 0.05, awesomeBoost: 0.10,
    requires: ['cheesestand'],
  },
  {
    id: 'oats', name: 'Oats Jar', desc: '+300 / sec • oats',
    icon: 'Icons/oats_chalk.png', baseCost: 4000000, type: 'auto', power: 300,
    unlocks: ['oats'],
    sprite: 'Environment/Shelf/oats_base.png',
    // Top plank of the wall shelves — % of shelves box
    layout: { container: 'shelves', x: 40, y: 10, stepX: 14, stepY: 32, perRow: 4, max: 4, size: 60 },
    requires: ['shelves'],
  },
  {
    id: 'flour', name: 'Master Flour', desc: '+1000 / sec • flour',
    icon: 'Icons/flour_chalk.png', baseCost: 12000000, type: 'auto', power: 1000,
    unlocks: ['flour'],
    sprite: 'Environment/Shelf/flour_base.png',
    // Bottom plank of the wall shelves — % of shelves box
    layout: { container: 'shelves', x: 18, y: 58, stepX: 16, stepY: 0, perRow: 5, max: 5, size: 65 },
    requires: ['shelves'],
  },
  {
    id: 'luxurywalls', name: 'Luxury Walls', desc: '+500 per click • +10% bad cooks (demanding guests)',
    icon: '../Custom-sprites/Background/luxurious-wall.png', baseCost: 20000000,
    type: 'click', power: 500, oneTime: true,
    // Negative badReduce → flips the sign in buy() and increases the bad
    // rate by 10%. Discerning guests are harder to please.
    badReduce: -0.10,
    requires: ['wallpaper'],
  },
  {
    id: 'hat', name: "Chef's Hat", desc: '+1000 per click • +500 / sec',
    icon: 'Icons/chalk1_chalk.png', baseCost: 30000000, type: 'click', power: 1000,
    oneTime: true, autoBonus: 500,
    requires: ['luxurywalls'],
  },
];

// ---------- Cooking flavor messages ----------
// AWESOME — huge rainbow banner + gold flash
export const AWESOME_FLAVORS = [
  'PERFECT!', 'MASTERPIECE!', "CHEF'S KISS!", 'BIG TIP!',
  'CUSTOMER LOVED IT!', 'EXQUISITE!', 'FIVE STARS!', 'MICHELIN-WORTHY!',
];
// BAD — big red shake + red flash
export const NEGATIVE_FLAVORS = [
  'OVERCOOKED!', 'UNDERCOOKED!', 'BURNT!', 'RAW INSIDE!',
  'TOO SALTY!', 'CUSTOMER REFUSED!', 'INEDIBLE!', "WHAT IS THAT?",
];
// REGULAR — small italic text near the coin, no flash, no banner
export const CALM_FLAVORS = [
  'served.', 'plated.', 'ok.', 'fine.', 'good enough.',
  'on the menu.', 'passable.', 'edible.', 'served warm.',
];

// Splash animation tiers — chosen by dish value
export const SPLASH_TIERS = [
  { folder: 'Tiny',   prefix: 'Tiny_Splash',   frames: 10, w: 220, maxValue: 30 },
  { folder: 'Medium', prefix: 'Medium_Splash', frames: 17, w: 360, maxValue: 300 },
  { folder: 'Huge',   prefix: 'Huge_Splash',   frames: 19, w: 520, maxValue: Infinity },
];
