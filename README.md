# Terra & Lore - website source

Open `index.html` from any static host (it needs HTTP, not file://, because the models are fetched).

- `index.html` - the whole page: tokens, component CSS, fonts (inlined), scripts. Built from the parts below.
- `hero3d.js` - the 3D hero and product stage (Three.js r147). `TL3D.mountHero(el, options)` and `TL3D.mountStage(el, options)`; the option list is at the top of the file.
- `hero-config.js` - the forest island transform, the cat's route (waypoints in world units), where it jumps, speed and camera. Add `debug: true` to draw the route and log the point you click on the island, to pick new waypoints.
- `models/` - web-sized GLBs (meshopt compressed): forest 6 MB, rigged cat with Running/Walking/Jump_Run/Regular_Jump 0.9 MB, static cats 0.6 MB each.
- `core.js` - navigation, rune menu, hotbar wheel, bag, toasts, tooltips, product data (`TerraLoreRealm.items`).
- `page.js` - home and item views, routing by hash (`#item-scarf-cat`).
- `components.css`, `page.css`, `tokens.json` - the design system: colours, type, spacing, radii, glows, motion.
- `js/` - three.min.js, GLTFLoader.js, meshopt_decoder.js (three@0.147.0).
- `img/` - product renders and logos.

Fonts: Archivo (condensed, expanded, regular instances), Fraunces Italic, DM Mono, Noto Sans/Serif Georgian, all inlined into index.html.
