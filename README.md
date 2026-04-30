# Kitchen Clicker

A cute kitchen-themed idle clicker. Click the pot to cook breakfast dishes, earn coins, and buy upgrades that unlock ingredients, kitchen tools and passive income. As your cps grows, the kitchen escalates through five tiers of visual chaos, ending in full Breakfast Disco.

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
