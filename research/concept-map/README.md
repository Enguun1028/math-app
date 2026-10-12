# Concept map draft

`draft-v1.js` is the new knowledge structure (2026-10-13): 142 concepts (24 grade 1–4 basics, 118 full concepts for grade 5–12) and 258 typed links, each with a short reason. Every concept lists the curriculum codes it covers; together they cover all 547 objectives in `../curriculum/mn-2019-objectives.tsv`.

The same data drives two maps:
- **Curriculum map** (home, keeps the current neon sphere look): the journey path goes through grades 5–12. Each grade is one sphere holding every topic taught that year (a concept is in grade g when one of its curriculum codes starts with g), shown as dots grouped by strand: filled = new that year, ring = the topic returns at a deeper level. Selecting a topic draws its thread through every grade it appears in. Grade 1–4 basics are not on it; they open from prerequisite links and sit on the math map. (`CURRICULUM_LANES` is from an earlier layered version the owner rejected; kept for now as topic families.)
- **Pure math map**: ten branches as columns, concepts placed below everything they need.

Review page with per-concept comments: https://claude.ai/artifact/FFSvLahGwZSfi3GhV6CXSv

`check.mjs` checks ids, curriculum codes, prerequisite cycles, grade order and coverage: `node research/concept-map/check.mjs`.

Status: draft written by Claude (AI). Names, links and reasons need the owner's review before they go into the app.
