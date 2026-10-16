# Widgets the lesson storyboards need (build order)

Counted from `storyboards-*.json` (118 grade 5–12 lessons, 2026-10-16). The storyboards name about 90 different
widgets, but most are one of **seven engines** with a different setup. Building the engines, not 90 widgets, is
the plan. Every engine must follow the owner's motion rules: pause/resume, restart, step dots
([[animations-need-pause]]), `lockInput()` during transitions, fractions stacked.

Already in the app: `Visual.svelte` kinds `numberline`, `place`, `scale`, `grid`, `blocks`, `fraction`;
tools `NumberLineTool`, `NumberOps`, `FractionOps`/`FractionTool`/`FractionPlay`, `CoordTool`, `ScaleTool`.

| # | Engine | Storyboard widgets it covers | Lessons | Status |
|---|---|---|---|---|
| 1 | **Graph plotter**: function(s) with sliders for parameters, draggable points, shaded regions, tangent/secant lines, Riemann rectangles, slope field, mirror/reflection, scatter + trend line | graph, secant-zoom, graph-deriv, riemann, slope-field, graph-mirror, scatter-fit, growth-race, normal-curve | 20 | new (biggest win) |
| 2 | **Geometry board**: draggable points, segments, circles, angle and length readouts, construction steps, coordinate grid on/off | coord, triangle-tear, triangle-builder, triangle-centers, triangle-solver, trig-triangle, inscribed-angle, line-circle, transversal, pyth-squares, polygon-split, angle-maker, compass-steps, compass-rose, locus-dots, shadow-similar, transform-tracing, circle-unroll, circle-slices, sector-slider, radian-wrap, unit-circle-trace, vector-add, vector-dot, complex-plane, matrix-transform | 29 | `CoordTool` is a start |
| 3 | **Number line+** (extend `NumberLineTool`): jumps, two parallel lines, zoom, log scale, power ladder | numberline, double-numberline, decimal-hop, log-scale, power-ladder | 13 | extend existing |
| 4 | **Area & tiles grid**: unit squares/cubes, algebra tiles (x², x, 1), split rectangles, fill and level animations | area-model, algebra-tiles, hundred-grid, array-rect, complete-square, fill-square, scale-grid, rect-fence, rect-area-fixed, square-builder, level-bars, fraction-bars, fraction | 18 | `blocks`, `grid`, `fraction` are a start |
| 5 | **Chance lab**: simulations with counters (dice, coins, Galton board, random dots), icon arrays, tree diagrams, sample picker | dice-sim, galton, random-dots, icon-array, tree, sample-sim, distribution-balance, slots-vs-basket, venn-numbers, chart-switch, histogram-bins, box-dot | 17 | new |
| 6 | **Step machine**: a row of boxes that change one step at a time (algebra steps, balance, function machine, long division, factor tree, proof ladder, domino, multiplier chain, unit ladder, Pascal triangle, matrix multiply) | scale, factor-cancel, long-division-cycle, long-division-poly, function-machine, factor-tree, proof-ladder, domino, multiplier-chain, unit-ladder, pascal, matrix-multiply, matrix-equation, pattern-builder, staircase, doubling, ratio-table, tank-fill | 22 | `ScaleTool` is a start |
| 7 | **3D view**: rotate a solid, nets that fold, slicing plane, 3D axes | net-fold, cube-box, slice-3d, space-3d | 5 | new (last: heaviest) |

Counts overlap a little because a lesson can use two engines.

## Suggested order
1. Graph plotter: 20 lessons from grade 6 to 12, and the ЭЕШ's heaviest topics (quadratic function, derivative, integral).
2. Area & tiles grid: grades 5–8 foundations, where the owner's target students fall behind.
3. Step machine: turns the existing balance (`ScaleTool`) into a general one; cheap.
4. Geometry board: most lessons, but the most work.
5. Chance lab, Number line+, 3D view.
