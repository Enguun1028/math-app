# матемап (Math Map)

A free, phone-first web app that helps Mongolian teenagers who have fallen behind in school math find the exact topic that is blocking them, and climb back from there.

**Live:** https://matematikiin-ayalal.pages.dev (Mongolian interface; installs to the home screen on iPhone and Android)

<p>
  <img src="docs/screenshots/map.png" width="200" alt="The journey map: math areas as spheres along a path">
  <img src="docs/screenshots/sphere.png" width="200" alt="Inside one sphere: topics linked by prerequisites">
  <img src="docs/screenshots/entry.png" width="200" alt="A topic page: definition, visual, prerequisites, examples, common mistakes">
  <img src="docs/screenshots/start.png" width="200" alt="The optional start check that finds a student's gaps">
</p>

## Why I am building it

In my class there were 45 students. With that many children, the lesson can't slow down for anyone, including for my questions. The room was loud just from the number of people in it. Even when I understood math well, I often fell behind. In Mongolia this is normal:

- Some Ulaanbaatar schools average 48–52 students per class ([UB Post, 2025](https://www.ubpost.mn/a/13558)).
- The country is about 4,200 teachers short, 2,400 of them in Ulaanbaatar (Ministry of Education figure in a [2025 teacher-education report](https://reteach.mn/storage/outcomes/June2025/1sRyHHwxcs2G8NLivYfU.pdf)).
- In PISA 2022, Mongolia averaged 425 in math (OECD average 472). Only 49% of 15-year-olds reached the basic level (OECD 69%) ([OECD country note](https://www.oecd.org/en/publications/pisa-2022-results-volume-i-and-ii-country-notes_ed6fbcc5-en/mongolia_a93e1396-en.html)).
- The average raw math score on the university entrance exam fell from about 26 out of 100 (2020-2023) to 19 in 2025.
- School closures during COVID lasted from January 2020 to September 2021, mostly with TV lessons. The students who were in grades 1-9 then are today's teenagers.

Once a child falls behind, catching up is close to impossible. Teachers have no time left for one student. And a child can't easily find their own weak spot, or work through textbooks and the internet alone without a guide. My two younger brothers, in grades 6 and 8, are curious and love math and science, and they face the same wall.

I've helped classmates with math for years, and I like explaining. What I learned is that students rarely quit because math is too hard; they quit because the explanation loses them. Research also shows the gap is fixable: a student who is behind is usually missing specific earlier pieces, and once those pieces are supplied, they learn at a normal pace. Existing Mongolian resources are organised by school grade or by exam. None of them shows a teenager *which earlier topic* is blocking them. So I am building two things: a search that understands math the way a student types it, and a map of all of school math that shows exactly where a student stands and what to learn next.

There is a bigger reason too. In Ulaanbaatar, school drives the city: roads are empty in summer and jammed in the school year, families choose apartments by school, and my brother crosses two dangerous roads every day to reach a math tutor. If a student can catch up from home, that is one less trip. I want this app to be a first step toward tools that make learning less dependent on where you live.

## What it does

- **A journey map of school math.** 142 topics from the official 2019 curriculum (grades 1–12), linked by what depends on what. Grade spheres 5–12 open with a camera zoom into a grade map; a second view shows the same topics as one map of mathematics.
- **Find your gap.** An optional, short start check ("Дутагдлаа олъё") tests the basics first and marks which spheres the student already knows. It is never forced, and a student can stop at any point.
- **A dictionary inside the map.** Every term, concept and sign (=, −, ÷, %, √ …) has its own page: a one-sentence definition, a visual, prerequisites, what it unlocks, worked and real-life examples, common mistakes, and a mini test.
- **Learning by doing.** Worked examples for column addition and subtraction run one step per tap, then the student solves a new problem themselves on a digit keypad, with a hint for the exact column they got wrong.
- **Feedback that teaches.** A wrong answer first gets a hint and another try, then the worked step and a link to the topic underneath. Every question has an "I don't know" button, so nobody has to guess. Wrong answers are shown calmly, never in red.
- **Kind progress.** After the start check, known areas light up on the map and the next step is named. Results say what the student has, not what they lack. Coming back after a few days brings a welcome and a 3-question warm-up instead of a broken streak.
- **Search for all of math ("Бүхнийг хай").** The middle tab of an Instagram-style bottom bar. A typed formula is recognised by its shape, so `a²+b²=c²`, `x^2+y^2=z^2` and `c^2=a^2+b^2` all open the Pythagorean theorem: what it is, where it comes from, how to prove it, where it is used and what comes next. When a formula could mean two things, both are offered. Search also knows what kind of thing was typed (`x^2+5x+6=0` is a quadratic equation, `2^x=8` an exponential one, `3/4` a fraction, `∠` an angle). Every one of the 142 topics and 147 named formulas and theorems (Vieta, Heron, Bayes, Newton–Leibniz…) has an answer page with the textbook definition, a step-by-step example, a short reason why it is true and where it comes from in history (drafts, checked over time).
- **Math-aware search.** Typing `3x+7^2` shows it the way a textbook prints it and finds the related topics.
- **Graph calculator (Desmos-style).** Type `y = a x^2 + b x + c`, `x^2 + y^2 = 9` or a point `(2; 3)` and see it drawn; every other letter becomes a slider. Topic cards for functions open it with their own equation, and math typed into search can be opened as a graph. Built on [JSXGraph](https://jsxgraph.org) (MIT/LGPL) with the app's own expression reader, so nothing is run with `eval`.
- **Tools.** A number line, balance scale, fraction tools, area grid and coordinate plane. The second tab of the bottom bar holds whichever tool the student pins there; the graph calculator is the default.
- **Feedback on every page.** Students can report a mistake or say a part is unclear.

There are no accounts. Progress is stored only on the student's own device.

## How I built it

I built this with an AI coding assistant (Claude Code), and I want to be clear about who did what.

**My part:** I came up with the idea and the reason for it, from my own crowded classroom and my brothers. I decided who the app is for, directed the research and chose what to act on. I made the product and design decisions: the explorable dark map instead of a fixed lesson path (I rejected a lighter, linear design), the start check, the dictionary-inside-a-map search, the two-colour fraction operations tool, letting fractions go past one whole, and the Instagram-style bottom bar. I set the rules for how math and language must look: fractions always stacked, never written with a slash, and polite Mongolian instead of curt commands. I test every change on my iPhone and turn what I find into fixes.

None of this came from one prompt. Each concept went through many rounds: I tried it on my phone, said what was wrong, and had it rebuilt until it matched what I had in mind. The commit history shows that process, and I am still continuing it.

**The AI's part:** writing most of the code, collecting and summarising research sources (which I then checked and decided on), and drafting content for me to review.

Commits made with the assistant are marked `Co-Authored-By: Claude`.

## Status

- A pilot release with a small group of students is planned for October 2026.
- All 142 topics on the map (grades 1-12) have a topic card with a definition, examples and a textbook source; 14 full step-by-step lessons are written so far, and lesson storyboards (model, animation steps, misconception, exit question) are planned for all 118 grade 5–12 topics in `research/lessons/`. Practice questions, common mistakes and videos are AI-drafted and marked as drafts. The curriculum structure and the Mongolian math terms still need review by a Mongolian math teacher.
- There are no users or learning results to report yet.

## Technical overview

- [Svelte 5](https://svelte.dev) and [Vite](https://vite.dev). The build bundles everything into one self-contained `index.html`, which makes the app fast to load on weak mobile connections and simple to host.
- Installable as a home-screen app (web app manifest and icons).
- Hosted on Cloudflare Pages as a static site, so there is no server or database to run. (Moved from Netlify in October 2026 after the free plan's deploy credits ran out.) The in-app feedback form was built on Netlify Forms and is being moved to a new form service.
- Content lives in plain JSON files, one per topic page, so content can be edited without touching code.
- Security headers (Content Security Policy and others) in `app/public/_headers`.

Run it locally:

```bash
cd app
npm install
npm run dev      # http://localhost:5173
npm run build    # writes dist/index.html
```

## Repository layout

| Path | What is there |
|---|---|
| `app/` | The app: source in `src/`, content in `content/` |
| `research/` | The research behind the design, with every source linked (`left-behind-brief.md` is the summary) |
| `docs/` | Design decisions and screenshots |
| `archive/` | Earlier prototypes, kept to show how the idea evolved |
| `PRODUCT.md` | Product definition: users, purpose, capabilities and rules |

## License

Code is released under the [MIT License](LICENSE).
