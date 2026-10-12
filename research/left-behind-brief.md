# How students fall behind in math, and what it means for Математикийн аялал

Research brief, 2026-09-27. Built from four parallel research tracks (raw reports with every source link in `raw/`):

1. `raw/01-mechanics.md`: how math gaps form (international research)
2. `raw/02-mongolia.md`: the Mongolian context
3. `raw/03-teens-and-catch-up.md`: the teenager side, and which catch-up methods work
4. `raw/04-products.md`: how existing apps find and fill gaps, and the Mongolian market

Confidence tags: **[high]** replicated or read in the source; **[medium]** single source or abstract only; **[low]** thin or indirect.

Three key numbers were re-checked by hand against their original pages: PISA 2022 Mongolia (425 maths; 49% at Level 2+), the 2025 entrance exam raw scores (ikon.mn), and the UNICEF numeracy decline. All matched.

---

## 1. The short version

- **About half of Mongolian 15-year-olds are below basic maths proficiency.** PISA 2022: mean 425 (OECD 472); 49% reached Level 2 (OECD 69%); 2% top performers. [high]
- **The entrance exam is quietly collapsing.** Mean raw maths score, out of 100: 26-27 from 2020 to 2023, 24 in 2024, **19 in 2025** (median 18; only 1% of 28,637 students above 60). The scaled score is always normed to 500, which hides this. [high]
- **The gap starts in primary school and COVID widened it.** Only 41% of grade 5 students were proficient in 2018. Primary numeracy proficiency fell from 53.5% (2019) to 38.2% (2021). Mongolia had one of the world's longest school closures (January 2020 to September 2021, mostly TV lessons). **The students who were in grades 1-9 during COVID are today's teenagers, our exact users.** [high]
- **Gaps are cumulative but fixable.** Students keep their rank year to year (r = .53), but once a missing prerequisite is supplied, a behind student learns at a normal rate. [high] This is the core promise of a prerequisite map, and it is backed by evidence.
- **Nobody in Mongolia shows a teenager which earlier topic is blocking them.** Existing resources are organised by grade (Medle, econtent, Eduten for grades 1-9) or by exam (iMath, Mmind, LIT, teacher YouTube test banks). None is a free, phone-first, Mongolian prerequisite map. [medium]

---

## 2. The mechanics: how a student falls behind

### 2.1 It compounds

Math is hierarchical. Early math knowledge is the strongest academic predictor of later achievement, ahead of reading and attention (Duncan et al. 2007). Students who struggle early and stay struggling grow the slowest (Morgan et al. 2009). The effect of prior math knowledge grows with age (Lin & Powell 2022, 580,000 students). [high]

But the key nuance: prior knowledge predicts **where** a student is, not **how fast** they learn once the gap is targeted (Simonsmeier et al. 2022). A behind teenager is not slow. They are missing specific pieces. [high]

### 2.2 The breakpoints, ranked by evidence

These are the places students drop off, ordered by how strongly they predict later failure. The right-hand column maps each to our map.

| Rank | Breakpoint | Evidence | Our topic |
|---|---|---|---|
| 1 | **Fractions** | Fraction knowledge at age 10 was the strongest predictor of algebra at 16, after controlling for IQ, working memory and family income (Siegler et al. 2012, UK and US). [high] | n5 Энгийн бутархай |
| 2 | **Division** | Second-strongest predictor in the same study. [high] | n3 Үржих ба хуваах, n4 Хуваагдах чанар |
| 3 | **The equals sign** | Many students read "=" as "write the answer", not "same value". Only about 30% of grade 5 understand it relationally. Relational understanding predicts equation-solving at every grade. [high] | **Missing from our map** |
| 4 | **Negative numbers** | Algebra teachers name integers as a top weakness; sign errors spread into everything after. [medium-high] | n9 Сөрөг тоо |
| 5 | **Proportional reasoning** | Additive thinking where multiplication is needed, and the reverse. [medium-high] | n8 Харьцаа ба пропорц, n7 Процент |
| 6 | **Variables** | Letter-as-object ("a = apples") in up to 80% of students aged 11-16. [high] | a1 Хувьсагч ба илэрхийлэл |
| 7 | **Graphs and slope** | Graph read as a picture; "higher line = steeper". [high for existence] | f2 Шугаман функц |

Later topics (logarithms, the unit circle, limits, derivatives, integrals) mostly fail **because of** ranks 1-7. When a student is stuck on a derivative, the map should send them back down, not add more at the top.

### 2.3 The misconceptions students would recognise

Most come from "whole-number bias": using rules that worked for whole numbers where they no longer apply.

- **Fractions:** 1/3 + 1/4 = 2/7. "1/8 is bigger than 1/6 because 8 > 6." Estimating 12/13 + 7/8, only 27% of US 8th graders picked 2; most picked 19 or 21.
- **Decimals:** "longer is bigger", so 0.125 > 0.3 (about 40% of grade 5).
- **Multiplying and dividing:** "multiplying always makes bigger" (fails for 0.5 × 8).
- **Negatives:** −7 > −3; "two negatives make a positive" applied everywhere (−3 − 5 = 8).
- **Equals sign:** answering 12 to 8 + 4 = □ + 5; writing 3 + 4 = 7 + 2 = 9.
- **Variables:** 2x + 3 = 5x; "six times as many students as teachers" written 6S = T.
- **Proportion:** enlarging a 2×3 photo to width 4 gives height 5.
- **Graphs:** a speed graph read as the shape of a hill.

Each of these is a ready-made diagnostic question: the wrong answer a student picks tells us which earlier topic to send them to. [high]

### 2.4 Two hidden gaps: understanding and vocabulary

- **Procedure without understanding.** Many students run steps they don't understand, and the knowledge breaks on anything unfamiliar. The two kinds of knowledge build each other (Rittle-Johnson et al. 2015). [high]
- **Maths vocabulary.** Vocabulary correlates with maths performance at r ≈ .49, still .17-.41 after controlling for reading, and more strongly at secondary level (Lin et al. 2021). Terms like хүртвэр (numerator), хуваарь (denominator), коэффициент, "factor" vs "multiple", and "expression" vs "equation" are a real barrier. [high]

This matches your own description of the primary user: teens who lack **specific terms** or the **overall structure**.

---

## 3. Mongolia: why it happens here

### 3.1 The numbers

| Indicator | Value | Confidence |
|---|---|---|
| PISA 2022 maths mean | 425 (OECD 472, Asia 451); 47th of 81 | high |
| At or above basic maths level (Level 2) | 49% (OECD 69%) | high |
| Rich vs poor quartile gap | 94 points | high |
| Grade 5 maths proficiency, 2018 | 41.2% | high |
| Primary numeracy proficiency | 53.5% (2019) to 38.2% (2021) | high |
| 2021 post-COVID diagnostic, all subjects | grade 9 lowest of all grades (34.2%) | high |
| Entrance exam maths, mean raw score out of 100 | 27 (2023), 24 (2024), 19 (2025) | high |
| Entrance exam 2025, share above 60/100 | 1% | high |

### 3.2 The drivers

- **COVID closures.** About half of instruction over two school years was remote or TV. During remote learning, 47% of students had trouble understanding assignments at least weekly, and **40% had nobody to help them** (OECD average 24%). 174,000 children were officially counted in learning loss. [high]
- **Overloaded, unstable curriculum.** Frequent changes to syllabus and textbooks; primary and lower-secondary hours are 844 above the OECD average; teachers say there is too much content. In 12,000+ comments on 118 textbooks, teachers called content hard to teach, overlapping and unevenly spread. Teaching relies on rote memorisation. [high]
- **Weak at application.** The ministry's own reading of PISA: students are weakest at applying maths and reasoning, and PISA-style problems felt completely new next to familiar exam formats. [high]
- **Crowded schools and missing teachers.** Ulaanbaatar has 363,000 students, about 100,000 more than in 2018/19. The class cap was raised to 45 in 2023. 53,000+ new teachers are needed by 2030. Only 59% of students say their maths teacher gives extra help when needed (OECD 70%). [high]
- **Rural, herder and minority students.** 34,700 children live in 522 dormitories. Soum schools lag aimag centres, which lag Ulaanbaatar. Kazakh-minority pupils scored 10% lower in early-grade maths, and only 23 textbooks have Kazakh translations. [high]
- **A tutoring economy.** In the last rigorous survey (2005-06), 71% of first-year university students had been tutored in their final school year, and **54% in maths**, often by their own class teacher. A year of online maths prep costs about 1,000,000₮ today. Students who can't pay fall further behind. [high for 2005; dated]
- **A confusing exam.** From 2026 the exam is **ЭШ (Элсэлтийн шалгалт)**. It has a mandatory learning-aptitude test (Суралцах чадварын шалгалт; core maths; threshold 400) plus **Математик I** (average level) and **Математик II** (advanced). [high]

### 3.3 Words students and teachers actually use

- хичээлийн / сурлагын хоцрогдол: falling behind
- хоцрогдол нөхөх: catching up
- түвшин нөхөх: filling in the level
- оношлох үнэлгээ: diagnostic assessment
- давтлага: extra practice
- сорил: mock test
- хувийн багш: private tutor
- сургалтын төв: tutoring centre
- ЭШ (formerly ЭЕШ), анхны оноо (raw score), босго оноо (threshold)

Full glossary in `raw/02-mongolia.md`.

### 3.4 What we could not find

- No official report on **which maths topics** Mongolian students fail. The Education Evaluation Center's item-level data was unreachable.
- No maths-specific COVID figure, and no national grade 5 or 9 maths trend after 2021.
- No current survey of how common tutoring is.

The topic ranking in 2.2 therefore relies on international evidence. A Mongolian teacher's input is the best available substitute. See section 7.

---

## 4. The teenager: what keeps them stuck

- **Anxiety and avoidance feed each other.** Across the OECD, 65% of 15-year-olds worry about poor maths marks. Anxious people pick easy, low-reward problems to avoid effort (Choe et al. 2019). Lesson: **make the first step tiny.** [high]
- **Shame blocks help-seeking.** Low achievers avoid asking for help most, because needing help feels like proof they are incapable (Ryan, Pintrich & Midgley). A private phone app lowers this. [medium-high]
- **Building real competence is itself the best anxiety cure.** Across 50 studies, interventions cut anxiety (g = −0.47) and raised performance (g = +0.50), most for students over 12. [medium]
- **"Believe in yourself" slogans barely work.** Growth-mindset effect on achievement: d = 0.08. It only helps alongside real, visible progress. [medium]
- **Relevance helps low-confidence students most.** Writing how a topic connects to one's own life raised interest and grades, mainly for students who expected to fail (Hulleman & Harackiewicz 2009). [medium-high]
- **Grade labels stigmatise.** Framing review as "back to grade 4" is an anti-pattern. [medium]

---

## 5. What works for catch-up, and the warning signs

### Works

| Approach | Effect | Notes |
|---|---|---|
| Adaptive software at the right level (Mindspark, India, grades 6-9, most students several grades behind) | +0.37 SD in 4.5 months | **Closest analogue to our app.** Biggest relative gains for the weakest. [high] |
| Teaching at the Right Level (TaRL) | Among the largest effects in education | Short test, group by level not grade. Fails without a clear level tool. [high] |
| Tutoring for teens (Saga, Chicago, grades 9-10) | Up to 0.40 SD; maths course failures halved | "Not Too Late": teenagers can catch up. [high] |
| Interleaved review | 61% vs 38% on a delayed test | [high] |
| Worked examples with self-explanation | g = 0.48 | [high] |
| Misconception-based questions (Eedi) | +0.30 SD in a 2-year RCT | [medium] |
| Mastery learning | About +6 months in maths | High move-on bar, fast correction. [medium-high] |

### Warning signs for a phone app like ours

- **The 5% problem.** Khan Academy, IXL and others work at the recommended dose, but only about 5-9% of students reach it, mostly the ones who would succeed anyway. [medium-high]
- **Automated content alone did not work in Botswana.** SMS problems alone had no effect; SMS plus a weekly 15-minute human call worked. [high for primary age]
- **The "map" itself has a history.** Khan Academy removed its pannable knowledge map around 2013 (partly for technical reasons, partly because "linear progression works best"). Duolingo replaced its skill tree with a linear path in 2022 because learners didn't know where to go next. [medium-high] **A map alone overwhelms. A map with one clear next step does not.**

---

## 6. What this means for our app today

What the current app gets right:
- **Prerequisite structure.** This is exactly the evidence-backed mechanism.
- **Soft locks.** "Dim but still markable" matches the research against hard locks.
- **Companion pairs.** These match Math Academy's "encompassings" idea.
- **Mongolian, free, and phone-first.** This fills the market gap.

Where it falls short of the evidence:
1. **Self-marked "learned" is the weakest signal.** The research consistently says mastery needs evidence (2-3 correct answers, then spaced re-checks).
2. **No starting point.** A student has to judge 39 topics themselves. Every strong product starts with a short diagnostic.
3. **No single next step.** All 39 spheres carry equal weight: the Khan and Duolingo overload problem.
4. **Missing nodes.** The equals sign (rank 3 breakpoint) and a number line / magnitude thread have no sphere.
5. **The progress bar reads as a debt** ("0/39 сэдэв"). ALEKS students called their percentage pie "guilt-tripping".
6. **Nothing for teachers yet**, although human contact is what keeps self-directed learners going.

---

## 7. Ideas, ranked

Ranked by evidence strength × fit with the product principles × cost to build in a single `index.html`.

### Tier 1: high evidence, fits now, no backend needed

1. **"Хаанаас эхлэх вэ?" (Where do I start?) placement check.** 8-12 questions, about 1 per stop, stepping down from the student's grade. Every wrong option is a known misconception that points to a specific sphere. Always include "Үүнийг үзээгүй" (I haven't learned this). Result: "your starting point", never a score or grade level. Under 10 minutes, resumable.
   *Evidence: TaRL, Eedi, IXL "not learned yet", ALEKS.*
2. **The "ready now" frontier.** Highlight only the 3-5 spheres whose prerequisites are all learned, and mark one "Эндээс эхэл" (start here). Everything else stays visible but quiet, so the map stays a map and never becomes a wall.
   *Evidence: ALEKS outer fringe, Duolingo path, game skill-tree research.*
3. **A goal-first route ("accelerate, don't remediate").** The student picks what they need now: a school topic ("Квадрат тэгшитгэл") or a target ("ЭШ Математик I"). The map lights up only that goal's prerequisite chain, and the student works up it just in time.
   *Evidence: TNTP/Zearn, Saga, Khan "Get ready for".*
4. **Quick check before "learned".** Replace the plain button with 2-3 questions (one concept question, one procedure question). Pass: the sphere fills. Fail: point to the single most likely prerequisite ("Эхлээд энийг: Энгийн бутархай") instead of saying "wrong".
   *Evidence: mastery learning, Math Academy, Zearn Boost.*
5. **A key-terms card in every topic sheet.** 3-6 terms with the Mongolian term, a plain explanation and a tiny example, e.g. хүртвэр / хуваарь, илэрхийлэл vs тэгшитгэл.
   *Evidence: vocabulary meta-analysis r ≈ .49; matches the "lacks specific terms" user.*
6. **"Алдаатай бодлого" (spot the mistake).** For each breakpoint topic, show the classic misconception as a worked example with an error: "Бат 1/3 + 1/4 = 2/7 гэж бодсон. Юу нь буруу вэ?" Recognition beats shame.
   *Evidence: worked examples with incorrect examples, EEF misconceptions guidance.*
7. **Progress as unlocks, not debt.** Swap "0/39 сэдэв" for "Энэ долоо хоногт 3 сэдэв нээлээ" (you opened 3 topics this week). No percentage of what's left, no leaderboard, no streak punishment.

### Tier 2: strong fit, more content work

8. **Add missing spheres:** "Тэнцүүгийн тэмдэг (=)" before linear equations, and a "Тооны шулуун" (number line) thread linking place value, negatives, fractions and decimals. Maybe split fractions into magnitude vs operations.
9. **Fading and review.** A sphere learned weeks ago slowly dims; one question refreshes it. Review questions are mixed across topics.
   *Evidence: interleaving d = 0.83.*
10. **Real-life hook per topic.** One line on where it shows up in Mongolian life: prices at the market (percent), livestock counts and herd ratios (proportion), bus fare and distance (linear functions), apartment floor area (area).
    *Evidence: utility value; the ministry's "weak at application" finding.*
11. **Tutor snapshot.** A shareable link or QR code encoding the student's map state (no accounts; state lives in the URL). A teacher or tutor opens it and sees one screen: learned, stuck, and the one prerequisite to work on next.
    *Evidence: Zearn Tower Alert, ASSISTments, the Botswana human-contact effect.*

### Tier 3: bigger bets, later

12. **Lesson links per sphere** to existing free Mongolian content (econtent.edu.mn / Medle videos, teacher YouTube) instead of producing lessons ourselves. This fills the "40% had nobody to help" gap quickly. Needs curation and licence checks.
13. **ЭШ 2026 mode.** A preset route for the learning-aptitude test's core maths and Математик I, aimed at moving students from about 15-20 raw points to above the threshold, not at chasing 800.
14. **Classroom mode for teachers.** A class-level view grouped by shared gap (the TaRL grouping idea). Needs a backend or a shared-code scheme.
15. **Kazakh-language version** for Bayan-Ölgii, and offline/low-data support for dormitory and herder students.

### Deliberately not recommended

- Grade labels on foundational topics ("4-р ангийн түвшин").
- Standalone motivational quotes or growth-mindset screens.
- Timed or public quizzes, leaderboards, streak-loss penalties, visible help counters.
- A long diagnostic (IXL-style 45 minutes).
- An answer-solver (the Photomath trap).

---

## 8. Open questions for you

1. **Who writes the diagnostic questions?** Ideas 1, 4 and 6 need about 3-5 good questions per topic in Mongolian. This is the single biggest content job. A Mongolian maths teacher would be ideal.
2. **Should we add the missing spheres** (equals sign, number line)? This changes the 39-topic structure.
3. **Which grade does the typical user start from?** This sets where the placement check begins stepping down.
4. **Is the 2026 ЭШ in scope now, or only after catching up** (as `PRODUCT.md` says)?
5. **Any teacher or tutor willing to try the tutor snapshot** with real students?

## 9. Suggested update to PRODUCT.md (not applied)

Add these to **Evidence on Hand**, with this brief as the source:
- The PISA 2022, entrance exam and COVID-loss figures.

Add these principles to **Product Principles**:
- "Find the gap before filling it."
- "Always one clear next step."
- "Learned means shown, not claimed."
