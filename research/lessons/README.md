# Lesson storyboards (research, 2026-10-16)

Lessons exist for only 14 topics (`app/content/entries/`), mostly grade 1–4. The owner's scope is lessons
from grade 5 up ([[scope-grade5-up-basics-readonly]] in Claude's memory) and wants concrete school methods,
not prose: column calculation, cubes, pictures that move, every animation with pause, restart and step dots.

These files plan one lesson per grade 5–12 topic so it can be built quickly later. **All text is a DRAFT** written
by Claude from the official textbooks (`app/content/topic-content.json`, source pages in `src`) and the
fan-out research (misconceptions, practice questions). The owner or a teacher checks it before it ships.

## Files
- `storyboards-g5.json` … `storyboards-g12.json`: one entry per topic id, keyed by the grade the topic starts in.
- `storyboards-basics.json`: short animations (no lesson, no test) for the 24 read-only grade 1–4 basics.
- `widgets.md`: the interactive pictures the storyboards need, which already exist in `Visual.svelte` / `tools/`,
  which are new, and how many lessons each one unlocks (build order).

## Entry shape
```json
"topic-id": {
  "hook": "One real question that opens the lesson.",
  "model": "The concrete picture or object used, and why it fits.",
  "widget": "area-model",
  "frames": [
    {"show": "What the picture shows at this step (for the builder).", "say": "One short sentence the student reads."}
  ],
  "try": "What the student moves or types themselves.",
  "trap": "The one misconception this lesson must break (see research/fanout/misconceptions-*.json).",
  "check": "One exit question idea.",
  "src": "Textbook pages."
}
```
`say` lines are student-facing: polite (та), one idea, at most about 20 words, fractions written as \frac{a}{b}.
