# Математикийн аялал: app (v1 skeleton)

Vite + Svelte app. The build output is one self-contained `dist/index.html` for Netlify.

## Run

    npm install      # first time only
    npm run dev      # live preview at http://localhost:5173
    npm run build    # writes dist/index.html

## Where things live

- `content/spheres.json`: the 8 journey stops (spheres) in path order, with `needs` (prerequisite spheres) and `volume` (1-5, how much school math the area holds; sets the sphere size).
- `content/entries/*.json`: one file per entry (term, concept or sign). Fields: `id`, `type` (ойлголт / тэмдэг), `symbol`, `title`, `aliases` (search words, Latin spellings), `sphere`, `definition`, `visual`, `prereq`, `example.worked`, `example.life`, `mistakes`, `video`, `test`.
- Inside any text, `[[id]]` or `[[id|label]]` links to another entry and opens a quick preview.
- `src/lib/logic.js`: learning rules and thresholds (`PASS`, `ENTRY_PASS`), the goals, and the rule that no next step shows before the level is known.
- `src/lib/layout.js`: sphere sizes and positions (golden-angle sway, Fibonacci-word gaps).
- `src/lib/motion.js`: shared transition timings; motion turns off with "reduce motion".
- `src/lib/search.js`, `src/lib/mathfmt.js`: search and live math display.
- Progress is saved only in the browser (`localStorage` key `ayalal.progress.v1`).

The first prototype (plain HTML, before this app) is kept in `../archive/prototype/`.
