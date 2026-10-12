# Brainstorm decisions (in progress)

> **Moved (2026-09-28):** the master copy of these decisions is now the Obsidian note `OmniRoute-Study-Vault/Projects/Math App - Математикийн аялал/01 Decisions.md`. This file is a snapshot; update the vault note instead.

Running record of what the owner has decided during the 2026-09-28 brainstorm. The full spec will be written from this. Research behind it: `research/left-behind-brief.md` and `research/raw/01-10`.

## Product identity

- A map study app with a great dictionary inside it. Not primarily a dictionary.
- One authoritative voice: terms follow official Mongolian textbooks, checked once by an expert. Not customised per class or teacher. "An internet haven that earns respect."
- Only the core team edits content. Teachers and students send feedback; the team decides.
- All interface text in Mongolian.
- Phone-first; professional look.
- All videos and the video catalogue are placeholders, to be reviewed, improved, and later replaced by the owner's own recordings.

## Phasing

- Phase 1: no server, no accounts; progress on the device; deployed as one `index.html` on Netlify.
- Phase 2: friends, teachers, class codes.
- Phase 3: photo search, questions routed to teachers, co-op class battles (co-op, not 1v1; damage from correct answers, speed only a small bonus).

## Build approach

Option C: content in separate files (one per entry), app built with Vite + Svelte, output bundled into a single `index.html`.

## Screens (Section 1, revised)

- Home: large search bar "Хүссэн зүйлээ асуу" on top, the path below.
- Search: also accepts math typed as plain text and shows it live as a textbook would print it (e.g. `3x+7^2` shown as 3x + 7²), then matches entries. Handles questions, Latin spelling, typos.
- The path is the main attraction: geometric, clean, beautiful, simple, easy to follow. No overcomplication.
- Map rules from the owner:
  - Prerequisite connections are not drawn by default; shown only when a sphere is tapped or focused.
  - No small spheres inside spheres, no overlapping text.
  - Zoomed in: only the most prominent concepts of a sphere show. Tapping opens the full content in an organised page.
  - Zoomed all the way out: no large empty space; the map fills the screen.
  - Zooming must be smooth and fast.
- Goals: Ахих (хоцрогдол арилгах), ЭЕШ, Гүнзгийрэх. Plus the exam goal "Дараагийн шалгалтаа давъя!" (pick grade or test topics; the path lights up what that test needs).
- "Хаанаас эхлэх вэ?" start check: optional, tempting, never forced. Split into short sections: the first is the simplest (signs and basics); after each, the student can continue immediately (fast transition) or stop, keeping partial results.
- Test results decide which spheres are known ("Мэднэ").
- Entry page: title, one-sentence definition, main visual, prerequisite chips ("Суурь") and unlock chips ("Нээгдэх"), examples ("Жишээ", replacing "Амьдрал дээр"), common mistakes ("Нийтлэг алдаа"), video card when available, mini test (3-5 questions; how a topic becomes known), feedback ("Алдаа мэдэгдэх"). Terms inside text open a quick preview.
- Sign entries (=, −, ÷, %, √, x, …) use the same layout, type "тэмдэг". Errors like the "=" misconception highlight the sign and open its common-mistake section (balance-scale explanation). No separate "=" sphere. Same pattern for other misconceptions.
- Tool bag (persistent "weapons"): number line (Тооны шулуун), balance scale, fraction bar, area grid, coordinate plane; always one tap away; entries reference them.
- Help card for teachers: when a student lacks spheres, the app produces a clear list of topics and specific instructions they can show a teacher.
- Share with a teacher in Phase 1: QR code or share code showing a read-only snapshot of the map. Friend list in Phase 2.
- Student feedback: "Алдаа мэдэгдэх / Ойлгомжгүй байна" per entry (Netlify Forms, no server).

## Wording decided

- Sphere states: "Мэднэ" (known), "Дараагийн алхам" (ready to learn next: all prerequisites known), not yet.
- "Сурах цаг!" (owner's suggestion): used as the call-to-action on a "Дараагийн алхам" sphere (assumed; confirm).
- "Жишээ" is one section with two parts: worked example first, then the real-life example (default; owner may split later).

## Content model (Section 2, owner input 2026-09-28)

- Every entry lists the terms used inside its own explanation. Each such term links to its own entry and shows which family (sphere / stop) it belongs to.

## Learning logic (Section 3, owner input 2026-09-28)

- Two levels of testing: a mini test per subject (term/topic) inside a sphere, and an overall test for the whole sphere.
- A sphere counts as known ("Мэднэ") when the student knows everything in it, or scores roughly 60-70% on it (exact threshold to be set in the spec).
- Nothing is ever truly locked. Spheres the student is not ready for are softly discouraged; once the student is ready, the app strongly urges them toward it.
- An algorithm weighs what the student knows against what the next sphere requires and decides whether that sphere lights up ("Дараагийн алхам").

## Still to design

Section 2 content model (rest), Section 3 learning logic (rest), Section 4 feedback and tone, Section 5 technical architecture, Section 6 visual direction (after UI UX Pro Max is installed), then the written spec, the build plan, and the human-labour list.
