# Math platforms and learning science (research, 2026-10-13)

Owner request: research study-material design, learning contexts, and how successful math platforms
(Sirius in Russia etc.) built their systems; present as an artifact next session.
Sources: Perplexity web answers with citations (links kept). Claims from company pages are marked as claims.

## 1. Russia

### Sirius (Образовательный центр «Сириус»), Sirius.Courses
- Self-paced courses in **modules**: video lectures, short notes, **auto-checked exercises**, then **harder problems for independent work** (some with video solutions; some courses have tutors who review work).
- Some courses adapt the path to the starting level. One course ≈ 60–120 hours. Electronic certificate; "with distinction" needs all exercises correct.
- Courses double as **selection**: residential math programs require finishing a distance course + online test, then a regional in-person round; places by results + grade/regional quotas.
- Scale: 200,000+ students registered, 16M+ tasks solved in the first 3 years of Sirius.Courses. A residential math program: 341 took the final round, 130 selected from 17 regions (June 2024).
- No published learning-gain figures found.
- Sources: sochisirius.ru/news/5306, sochisirius.ru/news/3482, sochisirius.ru/news/6755, sochisirius.ru/obuchenie/nauka/smena2353

### Uchi.ru (Учи.ру)
- Interactive curriculum-aligned tasks on an individual path; teacher statistics dashboard; olympiads (Russian and international).
- Reported 10M students.
- Evidence: Kursk region 2021–22, 3,591 students grades 5–9, weekly use in math lessons: correct answers +9.7% pre→post vs +5.8% in control (blended-lesson model, not isolated platform effect).
- Source: lp.uchi.ru/news/tpost/jv4pyf6z21-effektivnost-ispolzovaniya-tsifrovih-pla

### Яндекс Учебник
- Interactive math exercises grades 1–6, instant auto-check; teacher assigns and sees progress; recommendation system analyses errors and sends pupils to **prerequisite practice**.
- Sources: yandex.ru/support/education, trends.rbc.ru/trends/education/638753a69a794798bc1ff868

## 2. Adaptive systems (US/UK)

### Math Academy
- **Knowledge graph**: topics as nodes, prerequisite links + "encompassing" links; student's profile overlaid; **knowledge frontier** = topics ready to learn next.
- **Adaptive diagnostic** 30–45 min: mastery + automaticity, finds gaps in earlier courses.
- **FIRe (Fractional Implicit Repetition)**: spaced repetition where practising an advanced topic gives fractional review credit to the simpler topics inside it.
- **XP** for lessons, reviews, quizzes; mixed-topic quiz about every 150 XP; **interleaving**.
- Results: company claims only. Sources: mathacademy.com/how-it-works, mathacademy.com/how-our-ai-works

### ALEKS (McGraw Hill)
- **Knowledge Space Theory**: possible "knowledge states" constrained by prerequisites; estimates what the student knows and is **ready to learn**.
- **Initial Knowledge Check** ≈ 25–30 adaptive questions; periodic Knowledge Checks to re-test retention.
- Sources: aleks.com/about_aleks/knowledge_space_theory, aleks.com support

### Khan Academy
- Skill levels Familiar (50) → Proficient (80) → Mastered (100) points; move up/down via exercises, quizzes, unit tests, **course challenge** (samples whole course).
- Guidance: ≥45 min/week on mastery goals; 30+ min/week associated with better MAP growth (correlational).
- Sources: support.khanacademy.org (What is Course and Unit Mastery), blog.khanacademy.org

### IXL
- **SmartScore** per skill (needs sustained accuracy; drops on errors); **Real-Time Diagnostic** estimates grade-level per strand.
- Diagnostic Snapshot cohort study: +3 pp proficiency, Hedges g = 0.14 (not randomized).
- Source: IXL research PDF "Boosting Student Achievement with IXL's Diagnostic Snapshot"

### Eedi (UK) — strongest causal evidence found
- **Diagnostic questions**: 4 choices, each wrong answer = one known misconception; builds a misconception map; follow-up targeted.
- RCT 2023–24: 2,901 Year 7 students, 20 schools: effect **0.17** (~2 months progress); regular users 10–15 min/week: **0.34** (~4 months; non-randomized subgroup).
- Sources: eedi.com/news/new-uk-study-finds-students-using-eedi-gain-2-4-months..., eedi.substack.com

### Brilliant
- Problem-first interactive lessons, visual models, immediate tailored feedback, hint tutor that does not give the answer. "6x more effective" is its own unverified claim. Source: brilliant.org/faq

## 3. Asia

- **Squirrel AI** (China): curriculum split into very fine **knowledge points** in a graph; diagnostic estimates mastery; adaptive path. Short quasi-experimental studies only (MIT Technology Review 2019; PMC12078640 review).
- **Zuoyebang, QANDA (Mathpresso)**: photo a problem → matched worked solution/explanation. Lesson: cut friction from "stuck" to help; nudge an attempt before showing the solution.
- **Kumon**: short sequenced worksheets, start **below** current level to fill gaps, small steps, independent work, advance on accuracy+speed.
- **Singapore Math**: Concrete → Pictorial → Abstract; **bar model** for word problems.

## 4. Learning science (effect sizes found so far)

| Practice | Evidence |
|---|---|
| Interleaving in math | Grade 7: 72% vs 38% on delayed test, d = 1.05 (Rohrer et al. 2014); RCT 787 students d = 0.83 (Rohrer 2020) |
| Mastery learning | Kulik et al. 1990, 108 studies: ES ≈ 0.52, bigger for low performers; Guskey & Gates: 0.78 |
| Spaced practice (math) | robust in randomized studies (Rohrer & Hartwig review) |
| EEF KS2–3 guidance | assess to find misconceptions and adapt; manipulatives/representations with a purpose, bridge to abstract; teach problem-solving strategies explicitly; worked examples; specific, sparing feedback |

## 5. Mongolia context

- National platform **MEDLE** (Medle app): 10,000+ curriculum materials, digital textbooks, interactive exercises, tele-lessons.
- **Suraad** (math e-learning) and **Soril** (assessment) platforms; Finland's **Eduten** math platform used by some Mongolian schools; **eSchool** for upper-secondary electives.
- Phones: MICS 15–49 age group 98.8% own a mobile phone; household internet uneven by region; pandemic: only 1 in 5 households had a computer.
- **Suraad.mn** (Mongolian math self-study, level test, catch-up): 2022: 12,000 students in 42 schools of 21 aimags. Its 2023 voluntary online test, 15,000+ students: **53% got F**, only 4.5% fully completed the tasks (platform sample, not national). Sources: ikon.mn/n/2gk0, eagle.mn/r/121980
- **Soril.eec.mn**: grade 1–12 self-assessment in Mongolian and math, result per task. Source: moe.gov.mn/post/151775
- **Eduten in Mongolia**: 12-week pilot with the ministry: ~22% greater improvement than a control group that also got extra weekly practice; then expanded/national rollout (company + Mongolian press). ~1 hour/week gamified adaptive practice + teacher analytics. Sources: eduten.com/blog/eduten-platform-drives-impressive-learning-outcomes-in-a-12-week-pilot-in-mongolia.html, mnb.mn/i/304454, oph.fi solutions-eduten
- ЭЕШ math exam = 50 points (ees.eec.mn/article284); no official topic-level weak-spot data found.
- Not found: class sizes, two-shift school counts (gap: look up official reports next).

## 6. More learning-science numbers

| Practice | Evidence |
|---|---|
| Retrieval practice | Adesope et al. 2017: g = 0.61 (vs other activities), 0.51 narrower comparison |
| Spacing | Cepeda 2006: 839 assessments, no single pooled d; benefits robust |
| Feedback | Wisniewski, Zierer & Hattie 2020: d = 0.48 (435 studies); depends on information content |
| Gamification | Sailer & Homner 2020: cognitive g = 0.49, motivational 0.36, behavioural 0.25 (unverified in this search) |
| Productive failure | Sinha & Kapur 2021: g = 0.36 vs direct instruction (unverified) |
| Manipulatives | Carbonneau 2013: g = 0.37 (unverified) |
| Video length | Guo, Kim & Rubin 2014: engagement drops after ~6 min |
| Growth mindset | Sisk 2018: d = 0.08 overall, 0.19 at-risk; Yeager 2019: d = 0.10 for lower achievers |
| Worked examples | strong for novices, fade as expertise grows (expertise reversal); no single pooled ES |

## 7. AI tutors

- World Bank, Nigeria, GPT-4 after-school tutoring, 6 weeks: **0.31 SD**.
- Harvard physics AI tutor (Kestin et al. 2025), 194 students: 0.73–1.3 SD vs active-learning class; tutor was purpose-built (scaffolds, no direct answers).
- **Bastani et al. (PNAS 2025), Turkish high-school math:** GPT Base: practice +48% but unaided exam **−17%**; GPT Tutor (safeguards, hints not answers): practice +127%, exam penalty largely avoided. Source: scale.stanford.edu/ai/repository/generative-ai-can-harm-learning
- **Tutor CoPilot (Wang et al. 2024, Stanford):** RCT ~900 human tutors / 1,800 K–12 students; AI suggests teaching moves (guiding questions, not answers) to the tutor: students +4 pp topic mastery, +9 pp with lower-rated tutors. Source: arxiv 2410.03017
- Duolingo streaks: no evidence found that streaks cause learning; an engagement/habit tool only.
- Lesson: design matters. Hint/question before answer; ask the student to explain; check with independent problems later. Unrestricted chatbots that hand out answers can hurt learning (Bastani et al. 2024, to verify).
- Photomath: shows full steps at once → copying risk; better pattern = try first, reveal one step at a time, then a similar problem without help.
- Sources: gpekix.org/sites/default/files/2025-09/Policy-Brief-Mongolia.pdf, unicef.org/mongolia MICS, asia.fes.de/news/mongolia-digital-divide.html, blogs.worldbank.org/en/education/scaling-ai-in-education-systems--lessons-from-mongolia

## 8. More on Russia
- **ВсОШ school stage on Sirius.Courses**: since ~2020–21 the school stage of the All-Russian Olympiad runs online on Sirius.Courses for math, physics, informatics, biology, astronomy (chemistry in some years); math e.g. for grades 4–6 in 2023/24 (regional school reports). Invitation stage: 1.3M+ participants since 2020; ВсОШ overall 6M+ students a year (not split by subject).
- **Uchi.ru mechanics**: 30,000+ game-form tasks; system "holds a dialogue" with the student, reacting to each action, choosing tasks, order and difficulty (individual trajectory); games for mental arithmetic, spatial thinking, logic with levels; teacher and parent progress views; olympiads incl. a physics-math olympiad with MIPT; content on the Ministry's list of approved digital resources.
- Sources: siriusolymp.ru (not opened), mel.fm/blog/uchi-ru/18695..., techinsider.ru/editorial/572694..., regional gosuslugi school reports

## 9. Common misconceptions (grades 5–9) and fixes
| Topic | Typical wrong answer | What works |
|---|---|---|
| Adding fractions | 1/2 + 1/3 = 2/5 (CSMS: very common) | fraction strips/area/number line; same-size unit before adding |
| Comparing fractions | 1/8 > 1/6 because 8 > 6 | same numerator vs same denominator, benchmark 1/2, number line |
| Decimals | 0.25 > 0.3 ("longer is larger") | 0.3 = 0.30, place-value chart, money, number line |
| Negatives | 5 − (−3) = 2 | number line, temperature/debt; contrast with multiplication rules |
| Equals sign | "answer comes next": rejects 8 + 4 = 7 + 5 | both-sides equations, missing numbers, true/false equations |
| Letters | 3a = "3 apples"; a + a = a² | substitution with numbers, tables, compare a+a, 2a, a² |
| Order of operations | 18 ÷ 3 × 2 = 3 | left-to-right for ×÷, parentheses contrasts, justify each step |
| Percent | 25% = 2.5 | per hundred, 10×10 grid, double number line |
| Area/perimeter | area in cm; same perimeter → same area | grids, change one side at a time |
| Angles | longer arms = bigger angle | dynamic angle, compare by overlay, then degrees |
Sources: NCTM (equals sign), CSMS 1981 fractions (m-a.org.uk), Vic DET misconceptions, Melbourne decimals, Eedi data.

## 10. Mongolia: how teens prepare
- Official EEC materials: past ЭЕШ papers and answer keys, task bank with 2018–2020 exams (eec.mn/cat/surakh-bichig, eyeshitems.eec.mn); 2017 blueprint: 100-minute paper, multiple choice + open response (ees.eec.mn bPrint2017).
- Tutoring centres and experienced school teachers (e.g. interview yolo.mn/z/7450); no reliable price data.
- No verified Mongolian-language Khan Academy coverage found. Unread = word games/news, not exam prep.

## 11. Short video and story formats
- Short focused clips hold attention, but passive watching gives a false sense of understanding; add a question before the answer and a follow-up problem.
- Format that works: **hook (puzzle or common mistake) → one visualised idea → worked example → learner attempt → feedback**; one idea per clip; visuals that do mathematical work (3Blue1Brown), warm teacher explanation (Eddie Woo), surprising question (Numberphile).
- Teen-specific causal evidence for TikTok-style math is thin; measure learning with a fresh problem later, not views.

## 12. What this means for Математикийн аялал (synthesis)
Already aligned: knowledge graph from the official curriculum (Math Academy/ALEKS/Squirrel AI idea), adaptive level test across grades (ALEKS Initial Knowledge Check, IXL diagnostic, Math Academy placement), "Мэдэхгүй байна" + hint then worked step (feedback research, Bastani: hints not answers), CPA pictures (cubes, fraction bars, number line), stories with animations (short-video best practice), lessons in pages (definition first = searchable answer).
Gaps worth building next (ranked by evidence):
1. **Diagnostic distractors (Eedi, RCT 0.17–0.34)**: every wrong choice in every question tagged with the misconception it reveals (table §9); a wrong pick sends to the matching fix, not a generic hint.
2. **Spaced, interleaved review (Rohrer d≈0.8–1.05; Math Academy FIRe)**: a daily 5-minute mixed review from known topics; reviewing an advanced topic counts for the simpler ones inside it (our graph already has the links).
3. **Retrieval before explanation (Adesope g=0.61)**: start each lesson page 2 with a one-question attempt; stories end with "now you try".
4. **Mastery levels per topic (Khan 50/80/100, IXL SmartScore)**: replace binary "Мэднэ" with 3 levels that can drop after a long gap (we already have the 30-day fade).
5. **Weekly dose target**: Eedi 10–15 min/week, Khan 30–45 min/week; show a gentle weekly goal, not a streak.
6. **Teacher/parent view (Uchi.ru, Eduten, IXL)**: a class code and a simple progress page; Eduten's Mongolian pilot shows the ministry is open to this.
7. **AI help with guardrails** (later): hints and guiding questions only, never the final answer first (Bastani; Tutor CoPilot).
8. **Sirius-style enrichment track**: optional harder "олимпиад" problems per grade for strong students, with video solutions.
Positioning in Mongolia: MEDLE (content library), Suraad (math practice; 53% F in its 2023 test), Soril (assessment), Eduten (gamified practice, national rollout). Our niche: phone-first map of the whole curriculum + finding the gap + fixing it with pictures, free, in Mongolian.
