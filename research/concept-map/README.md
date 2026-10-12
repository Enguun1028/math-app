# Concept map draft

`draft-v1.js` is the new knowledge structure (2026-10-13): 142 concepts (24 grade 1–4 basics, 118 full concepts for grade 5–12) and 258 typed links, each with a short reason. Every concept lists the curriculum codes it covers; together they cover all 547 objectives in `../curriculum/mn-2019-objectives.tsv`.

The same data drives two maps:
- **Curriculum map** (home): six school strands as spheres, grade 5 at the centre to grade 12 at the edge.
- **Pure math map**: ten branches as columns, concepts placed below everything they need.

Review page with per-concept comments: https://claude.ai/artifact/FFSvLahGwZSfi3GhV6CXSv

`check.mjs` checks ids, curriculum codes, prerequisite cycles, grade order and coverage: `node research/concept-map/check.mjs`.

Status: draft written by Claude (AI). Names, links and reasons need the owner's review before they go into the app.
