# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML/CSS/JS with no build step. The deployed product must be a single self-contained `index.html` (all data, styles and scripts inline), because it is published by dropping one file onto Netlify. `structure.html` and `data.js` are local working files only and are not deployed.

## Users

Primary: Mongolian teenagers who have fallen behind in school math. Their gap is either specific terms and concepts they never learned, or the overall structure: they do not see how topics connect, what depends on what, or where to restart. They use it on their own, mostly on a phone.

Secondary: teachers and tutors who fold the map into their teaching or advice, using it to show a student where they are and what to study next.

## Product Purpose

A map of school mathematics as a journey. It shows every topic, what each one depends on, and which topics make sense to learn together. The student can find their own gaps and follow a clear path forward.

Success, in order:
1. The student catches up to their grade level.
2. Later, the student prepares for the ЭЕШ (university entrance exam).
3. Finally, students who want to can go further into mathematics for its own sake.

## Positioning

Organized by prerequisite and compatibility, not by school grade. Topics are grouped into journey stops where they genuinely support each other: for example, fractions with ratio, and quadratic equations with parabolas. A student who is behind can see exactly which earlier topic is blocking them, instead of restarting a whole grade.

## Operating Context

- A student alone on a phone, often with low confidence in math, trying to work out what they missed.
- A teacher or tutor pointing at the map during a lesson or advice session.
- Learning itself currently happens elsewhere (school, tutors, books, videos). The map is the plan and the progress record.

## Capabilities and Constraints

- Interactive map: 39 topics as spheres, grouped into 8 journey stops, linked by prerequisites. Companion topics are shown as taught together.
- Each topic has a short explanation, prerequisites, unlocks, and a reason for any companion pairing.
- Students mark topics as learned. Progress is stored only in that browser (`localStorage`). There are no accounts, and progress does not sync between devices.
- Topic states: learned, ready (all prerequisites learned), locked (still viewable and markable, since students who are behind may already know some later topics).
- All interface text is in Mongolian (Cyrillic).
- Planned, not built: each topic will link to lessons or exercises.
- Undecided: placement or skip-ahead tests, and a dedicated view or tools for teachers.
- The topic list and stage order were drafted without review by a Mongolian math teacher. Treat the curriculum structure and Mongolian wording as needing expert review.

## Brand Commitments

- Name: "Математикийн аялал" (Math Journey).
- The spheres-on-a-map format is a user-confirmed core of the product. The spheres stay; they are arranged as a pannable journey map.
- Language: Mongolian throughout.

## Evidence on Hand

- Topic data, prerequisites and companion reasons: inline in `index.html` (source copy in `data.js`).
- No users, testimonials, teacher endorsements, curriculum approvals or outcome data exist yet. Do not fabricate any.

## Product Principles

1. Show the structure. A student should see why a topic matters and what it unlocks, not just a list of topics.
2. Meet students where they are. Nothing is hard-locked; a student can mark what they already know and start from their real gap.
3. Grade level first, exam second, depth third. Early stops serve catching up; the ЭЕШ and deeper math build on top.
4. Mongolian first. Terms match what students hear in Mongolian classrooms.
5. Useful to a teacher too. The map must be clear enough to explain with, not only to click through alone.

## Accessibility & Inclusion

- Phone-first, touch-first. It must work well on low-to-mid-range phones and small screens.
- Students may have low confidence in math. Wording should be encouraging and plain, never shaming about gaps.
