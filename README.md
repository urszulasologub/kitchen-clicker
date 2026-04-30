# Kitchen Clicker

![demo](demo.gif)

You start with one egg, an empty kitchen, and a pot that pays out a pittance per click. Cook your way out of it: stack ingredients on shelves, drop a fridge into the corner, sprout a coffee maker, and slowly upgrade from boiled-egg poverty to a full Breakfast Disco where the walls hue-shift and pancakes rain from the sky. Every recipe needs the right ingredients (and the right gear — no fried eggs without a stove), every cook rolls bad / regular / awesome with a payout to match, and every coin you spend visibly fills the kitchen.

Built with vanilla HTML/CSS/JS (ES modules) — no framework, no build step. Saves to `localStorage`. Designed to deploy as static files to GitHub Pages.

## Run

ES modules need to be served over HTTP, not opened from `file://`. Pick whichever you have:

```bash
python3 -m http.server 8000     # built into macOS / most Linux
npx serve                       # if you have Node
```

Then visit <http://localhost:8000>.

## Credits

All sprites in Sprites/Sprites directory are from the **[Little Chef sprite pack](https://truebiger.itch.io/little-chef)** by **Hello Erika** ([@helloerika](https://www.youtube.com/@helloerika)), released under CC0.
