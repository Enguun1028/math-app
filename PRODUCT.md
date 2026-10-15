# Product

<!-- impeccable:product-schema 1 -->

## Platform

web (installable to the phone home screen)

## Stack

Svelte 5 and Vite in `app/`. The build bundles everything into one self-contained `index.html`; per-topic extras (practice, common mistakes, videos) are small JSON files in `app/public/extras/`, fetched when a topic opens. Content lives in JSON under `app/content/`. Hosted on Netlify. No server, no database, no accounts.

## Users

Primary: Mongolian teenagers who have fallen behind in school math, usually in crowded classes where the lesson cannot slow down for them. Their gap is specific earlier topics they never learned, and they cannot see which ones. They use the app alone, mostly on a phone.

Secondary: teachers, tutors and older siblings who use the map to show a student where they are and what to study next.

## Product Purpose

A map of all of school mathematics (grades 1-12) plus a search that understands math the way a student types it. The student finds the exact earlier topic that is blocking them and climbs back from there.

Success, in order:
1. The student catches up to their grade level.
2. Later, the student prepares for the ЭЕШ (university entrance exam).
3. Finally, students who want to can go further into mathematics for its own sake.

## Positioning

Organized by prerequisite, not by school grade or by exam. Existing Mongolian resources are lists of grade lessons or exam drills; none shows a teenager which earlier topic is blocking them. This app does, and it explains topics with concrete school methods (column arithmetic, fraction bars, cubes) rather than long prose.

## Operating Context

- A student alone on a phone, often with low confidence in math, trying to work out what they missed.
- A teacher, tutor or family member pointing at the map to explain.
- Weak mobile connections: the app must load fast and work as a single file.

## Capabilities and Constraints

- Explorable dark neon map: 142 topics across grades 1-12, linked by prerequisites; a glowing "next step" guides without forcing a fixed path. Grades 1-4 are read-only basics; lessons start at grade 5.
- Topic card for every topic: definition, formulas, rules, method, worked examples and textbook source (official 2020 Mongolian textbooks). Plus, as drafts: practice questions with hints, common mistakes, real-life uses, a video and outside interactives, and the topic's ЭЕШ weight.
- 14 full step-by-step lessons so far (mainly number basics).
- Start check (level test, grades 4-12) that lights up known areas; a 3-question warm-up after a break instead of a broken streak.
- "Бүхнийг хай" search: recognises typed formulas (e.g. a²+b²=c² opens the Pythagorean theorem), Mongolian terms, and Russian or Latin spellings.
- Tool bag: number line, balance scale, fraction bar (including fractions above 1 and two-fraction operations), coordinate plane, column arithmetic.
- Feedback button on every page (Netlify Forms).
- Progress stays on the device (`localStorage`); nothing syncs.
- All interface text is in Mongolian (Cyrillic), polite form (та).
- Not built yet: HOT TOPICS stories (the owner writes them by hand), more full lessons, teacher view.

## Brand Commitments

- Name: "матемап" (Математикийн газрын зураг). The repo and older docs also use "Математикийн аялал" (Math Journey).
- The dark neon explorable map is the confirmed core of the product. Ask the owner before any big visual shift.
- Fractions are always stacked (numerator over denominator), never written with a slash.
- Mongolian throughout, polite and encouraging.
- No zoom gestures except on the circular grade map.

## Evidence on Hand

- Topic content from the official textbooks: `app/content/topic-content.json`.
- Research and AI-drafted extras: `research/` (fact-checked for math; some facts flagged in `research/fanout/fact-check.md`).
- No users, testimonials, teacher endorsements, curriculum approvals or outcome data exist yet. Do not fabricate any.

## Product Principles

1. Show the structure. A student should see why a topic matters and what it unlocks.
2. Meet students where they are. Nothing is hard-locked; a student starts from their real gap.
3. Grade level first, exam second, depth third.
4. Concrete over prose. Use the methods students see in school; never invent lesson content, and mark every AI draft as a draft until a person checks it.
5. Mongolian first. Terms match what students hear in Mongolian classrooms.

## Accessibility & Inclusion

- Phone-first, touch-first. It must work well on low-to-mid-range phones and small screens.
- Students may have low confidence in math. Wrong answers get a hint and another try, are never shown in red, and every question has an "I don't know" button.
- Every auto-playing animation has pause, restart and step dots.
