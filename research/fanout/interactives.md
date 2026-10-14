# Open interactives and tasks per topic (2026-10-15)

Data: `interactives.json`. It has 201 items covering 104 of the 142 concept ids: 73 PhET, 60 GeoGebra and 68 Illustrative Mathematics units. I checked every URL. The `fit` sentences are my own mapping and are marked draft (`fit_is_draft`). The concept ids that have no item are listed under `missing`.

## Key findings

1. **PhET changed its licence.** Simulations published after 2026-03-29 are **CC BY-NC 4.0**. Older versions were CC BY 4.0. A free, ad-free student app counts as non-commercial, so we may embed them.
   - PhET lists "Government or institutional distribution programs" as commercial use. A deal with the Ministry or a school chain would need a PhET licence.
   - The PhET logo must stay visible.
   - Required attribution: "Simulation by PhET Interactive Simulations, University of Colorado Boulder, licensed under CC BY-NC 4.0 (https://phet.colorado.edu)". This text may be translated into Mongolian.
   - Sources: https://phet.colorado.edu/en/licensing and https://phet.colorado.edu/en/licensing/html
2. **All 41 PhET math sims I checked have a Mongolian translation.** Each one listed in the PhET metadata API, and each `<sim>_mn.html` file loaded with HTTP 200. The files send no X-Frame-Options header, so they can go in an iframe.
   - Graphing Quadratics (Квадрат Функцын График) is fully Mongolian. Its screens include "Фокус ба Директрис".
   - These four look only partly translated: Expression Exchange, Proportion Playground, Plinko (its title is half English) and Area Builder. Check them in a browser.
3. **GeoGebra is free for non-commercial use with attribution.** Source: https://www.geogebra.org/license
   - The old `/material/iframe/id/<id>` URL now returns **410 Gone**.
   - Two working ways to embed:
     - The official way: `deployggb.js` with `material_id` (https://wiki.geogebra.org/en/Reference:GeoGebra_Apps_Embedding).
     - An iframe of `https://www.geogebra.org/m/<id>?embed`. It returns 200 with `frame-ancestors *`.
   - All 60 GeoGebra items are public. I confirmed each one through api.geogebra.org.
   - Activity texts are in English. Tim Brzezinski's books are the strongest sets: inscribed angles VUnBAhvB, parallel lines Mp5eG5hA, and similarity/trigonometry YHFzmrSJ.
4. **Tasks we may translate:** Illustrative Mathematics 6–8 and 9–12 are **CC BY 4.0**, so Mongolian adaptations are allowed with attribution. The IM name and logo may not be used. YouCubed is also CC BY 4.0.
   - The old tasks.illustrativemathematics.org site is CC BY-NC-SA.
   - Sources: https://im.kendallhunt.com/MS/students/1/index.html and https://www.youcubed.org/terms-of-use/
5. **Link only:**
   - NRICH: no mirroring or extraction.
   - Desmos: framing is not allowed, and the free API tier is for personal use. Ask partnerships@desmos.com first.
   - Desmos Classroom activities (Amplify): the terms forbid translating or framing them.
   - Open Middle: its English page says "All rights reserved" but its French page says CC BY-NC-SA, so ask first.
   - Polypad: iframes and the API are free on free sites, but only up to 10k requests a year.
   - Khan Academy Mongolian (mn.khanacademy.org): CC BY-NC-SA where marked. Link to it and embed its videos, but do not copy its exercises.

## What I could not find or verify

- I found no Mongolian-language GeoGebra activities. The material search API rate-limited me.
- I did not check whether GeoGebra's interface, Polypad or Desmos is available in Mongolian.
- I did not count translated strings for each PhET sim, apart from the spot check above.
- These ids have no good open interactive: number theory (divis, prime), sets, counting and perm-comb, tree, series, induction, diff-eq, rand-var, geo-prob, 3D vectors and space coordinates, matrix, and most of the grade 1–4 basics.
- I have not checked any `fit` against the Mongolian textbook lessons.
