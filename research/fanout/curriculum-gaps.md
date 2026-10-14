# Curriculum gaps: the 4 topics with no core-textbook content, plus a map-vs-curriculum check

Stream: CURRICULUM GAPS, 2026-10-14. Written by Claude (AI). Nothing here has been checked by a person yet.

## 1. The four topics

`concepts.txt` has exactly four grade 5–12 ids with `has textbook content = no`. All the other "no" rows are grade 1–4 basics (`b-*`).

| id | Name | 2019 curriculum code | In the core book Математик XII (2020, book 343)? |
|---|---|---|---|
| `induction` | Математик индукц | 12.10а* | No |
| `binom-dist` | Бином тархалт | 12.12в*, 12.12г* | No |
| `normal` | Хэвийн тархалт | 12.13а*, 12.13б*, 12.13в* | No |
| `geo-prob` | Геометр магадлал | 12.15б* | No |

### Answer: yes, all four are in the official curriculum, as elective (сонгон судлах) objectives

- **2019 curriculum.** All four are grade 12 objectives in the full secondary curriculum (Бүрэн дунд боловсролын сургалтын хөтөлбөр, 2019, pp. 37–38). The book marks each one with `*`, which means it is for students who chose the extended (сонгон) program. Source: `research/curriculum/mn-2019-objectives.tsv`; PDF: https://cdn.greensoft.mn/uploads/users/2649/files/Curriculum/EBS/Akhlakh.pdf
- **Core textbook.** I read the table of contents of Математик XII (https://econtent.edu.mn/content/12rangi/mat/pages/mat-343-3.jpg and `-4.jpg`). Chapter VI "Магадлал ба статистик" has only 6.1 Дискрет санамсаргүй хувьсагч, 6.2 Математик дундаж and 6.3 Дисперс. There is no chapter on induction. This confirms the earlier finding.
- **econtent.edu.mn has no elective student book.** I scanned the book viewer `pages/more.php?id=230…480`. Its only math books are 233, 244, 253, 273, 279, 284, 294, 310, 324 and 343, which are the core books (233 and 244 are lower grades). The 10rangi, 11rangi and 12rangi shelves each list one math book.
- **The official elective teacher's book covers all four topics.**
  - The book: *Багшийн ном. Математик X-XII. Ерөнхий боловсролын сургуулийн 10-12 дугаар ангийн сонгон судлах хичээл.* Б. Баяржаргал, Д. Анхтуяа et al. (12 authors), editor Д. Пүрэвсүрэн. It was printed "with permission of the Ministry of Education, Culture, Science and Sports (БСШУСЯ)", Ulaanbaatar 2018, first edition, for school libraries and not for sale.
  - Section pages in volume 2 (printed page numbers):
    - Математик индукц: pp. 88–90
    - Геометр магадлал: pp. 127–128
    - Бином тархалт: pp. 131–134
    - Хэвийн тархалт, with the normal approximation to the binomial: pp. 134–140
  - **Caveat:** I could only find the book as a third-party upload on pubhtml5 (vol. 1: https://pubhtml5.com/tibb/xvhw/basic/, vol. 2: https://pubhtml5.com/tibb/inzh/basic/), uploaded by "Ч.Энхбаатар". It is not on a ministry host. Other sources confirm that the book exists as the official elective teacher's book:
    - EEC cites "Баяржаргал Б. нар, Багшийн ном Математик X-XII (2018)": http://ebook.eec.mn/pdf/207.pdf
    - A JICA/mnier report says the ministry approved 14 elective teacher's books for grades X–XII, including Математик X-XII: https://mnier.mn/api/media/file/JICA_Tailan_29d53b6803.pdf
    - I did not check whether a newer edition exists.
- **Official tele-lessons exist for three of the topics** (econtent.edu.mn, grade 12 math, 2020). I checked the titles only and did not watch the videos.
  - Бином тархалт: https://econtent.edu.mn/lessons/EBS/12rangi/mat/191 (practical use) and https://econtent.edu.mn/lessons/EBS/12rangi/mat/220 (mean, variance, standard deviation)
  - Хэвийн тархалтын хэрэглээ: https://econtent.edu.mn/lessons/EBS/12rangi/mat/735
  - Геометр магадлал: https://econtent.edu.mn/lessons/EBS/12rangi/mat/960
  - The same list also has "Бүтэн магадлал" (/1047). I found no induction tele-lesson.
- **ЭЕШ.** EEC's 2021 math blueprint says the exam is built from the **compulsory** (заавал судлах) content of the curriculum. Its probability and statistics rows are data analysis (X–XI), combinatorics (VI–VII) and probability (IX–X). Source: https://eec.mn/wp-content/uploads/2021/04/Математик.pdf, seen in a search snippet; the file now returns 404.
  - So these four elective topics are **outside the stated ЭЕШ scope**, at least for 2021.
  - I could not open the blueprints for 2022–2026.
  - Commercial ЭЕШ prep sites do teach all four (eyesh.mn, integral.mn problem 15257 on B(100, 0.64)), so students do meet them.

### Recommendation: keep all four, labelled as elective

1. They are official curriculum objectives (12.10а*, 12.12в–г*, 12.13а–в*, 12.15б*), so the map is right to include them. Dropping them would leave holes in the grade 12 statistics chain: `rand-var` leads to `binom-dist`, which leads to `normal`.
2. There is now an official source to write from: the content is in `content-gaps.json`.
3. Show them with an "Сонгон судлах" or "нэмэлт" badge, and say they are not in the core book and not in the ЭЕШ blueprint. Then a student who skips them knows it is safe to do so.
4. Have the owner (or a teacher) check the teacher's-book content before it goes live, because the source is a third-party upload. Two small errors in the teacher's book were avoided in my content:
   - p. 133 calls D(X) "дундаж хазайлт" (mean deviation); it should be дисперс.
   - The p. 130 worked example uses 0.24 where the table has 0.25.
   - The core book uses Var(X); the teacher's book uses D(X). My content uses D(X) and notes both.

## 2. Content written

`research/fanout/content-gaps.json` has 4 topics (`induction`, `binom-dist`, `normal`, `geo-prob`) in the AGENT-BRIEF format. Each topic has a definition, src, formulas, rules, method and 3 examples, so 12 examples in all.
- Each topic also has extra fields: `url`, `curriculum` (codes), `elective: true` and `video`.
- All examples use my own numbers, and every number was recomputed in Python. Normal-table values are Φ(1) = 0.8413, Φ(1.5) = 0.9332 and Φ(0.9) = 0.8159.
- The normal-approximation example (P(X ≤ 45), X ~ B(100, 0.5) gives ≈ 0.184) was checked against the exact binomial value of 0.1841.
- The whole file is a draft until the owner checks it, as the `_note` says.

## 3. concepts.txt vs the 2019 curriculum (grades 5–12)

Method: `app/content/map.json` stores the curriculum `codes` for every concept. I joined these codes to `mn-2019-objectives.tsv`. Note that this checks the mapping already in the app; it is not an independent re-mapping.

### Objectives covered by no concept: **none (0 of 467)**
Every grade 5–12 objective code is attached to at least one concept, and every code in map.json exists in the tsv.
- Two grade-5 objectives are covered **only by read-only basics cards**: 5.1д (multi-digit addition and subtraction) via `b-add`, and 5.1ж (properties of operations; equations and inequalities) via `b-equal`.
- If grade 5 should be a full lesson grade, these two have no lesson-level concept.

### Concept ids that match no objective: **none**
All 142 concepts have at least one valid code.

### But some of the coverage is thin or loose
These are worth fixing in the concept map. They are my own reading of the summaries.
- **Folded-in sub-topics that the official materials teach as separate lessons:**
  - 12.15а* Бүтэн магадлал (total probability and Bayes) sits inside `cond-prob`, but it has its own tele-lesson (/1047) and its own teacher's-book section (p. 126).
  - 12.13в* (normal approximation to the binomial) sits inside `normal`. That is fine; my content covers it.
  - 12.14а–б* (counting with restrictions, combinations with repetition) sit inside `perm-comb`.
  - 12.9ж* (binomial series) sits inside `series`.
- **Codes that do not fit their concept well:**
  - 12.3ж* (equations with a parameter) is under `fn-props`.
  - 12.3з* (curves and their equations) is under `coord-geo`.
  - 7.3е (order of operations) is under `expr`.
  - 5.1н (logic puzzles) is under `pct`.
  - 12.1а (grade 12 modulus equations and inequalities) is under grade 7 `abs`. The grade 12 book teaches it in chapter I, so the grade 7 card does not cover it.
- **Concepts with only one code, which they share with another concept:**
  - `int-ops` (7.1а, shared with `abs`)
  - `proof` (7.7б, shared with `tri`)
  - `trig-right` (9.6в, shared with `pyth`)
  - `circle` (only 6.7е "draw circles with a compass", shared with `construct`; nothing about radius/diameter as content)
- **Very broad concepts** that would need several lessons:
  - `transform` (14 codes, grades 5–9)
  - `trig-fn` and `integral` (11 each, mixing core and elective)
  - `charts` (11)
  - `coord-geo` and `units` (10 each)
- **Concept grade ≠ earliest objective grade:**
  - `frac`, `frac-add`, `ratio` (from grade 4)
  - `sets`, `seq`, `prob` (from grade 5)
  - `counting` (from grade 2)
  - `fn-props` (from grade 9)
  - `spread` (from grade 8)
  - `construct`, `congruent` (from grade 6)
  - `lin-sys-mat` (from grade 10)
  - `perim-area` is labelled grade 5, but its earliest code is 6.9д; the grade 5 perimeter objective 5.2б is under `units`.
- **Elective (`*`) objectives in the map**, for the badge idea above:
  - Fully elective concepts: `induction`, `binom-dist`, `normal`, `geo-prob`, `series`, `diff-eq`, `binomial-th`, `radian`, `perm-comb`
  - Partly elective: `trig-fn`, `space-coord`, `complex`, `deriv-app`, `def-int`, `cond-prob`, and others
  - `radian` (11.6а–б*) and `binomial-th` (11.4г–е*) are elective in the curriculum but do have core-book content, so "elective" does not always mean "not in the book".

## Could not verify
- Whether the pubhtml5 upload matches the printed 2018 teacher's book exactly, and whether a newer edition exists.
- Whether a student elective book exists. None was found on econtent.edu.mn or in search.
- ЭЕШ blueprints for 2022–2026; the 2021 PDF is now 404.
- What the tele-lesson videos contain; I checked titles only.
