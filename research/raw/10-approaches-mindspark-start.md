# Raw report 10: app structures, Mindspark, and where students start

Research agent output. [H] primary source read, [M] secondary/company source or solid inference, [L] the agent's estimate.

Notes for the brainstorm:
- This report's verdict (path as home, dictionary as side door) pulls against the owner's "dictionary is the main idea". Needs a decision.
- Its lesson 4 suggests streaks, rewards and (in Mindspark) leaderboards. Report 6 (feedback) warns against leaderboards and broken streaks for low performers. Keep habit mechanics kind: weekly, repairable, no rankings.

## Part 1: how structures perform

| Structure | Engagement | Outcomes | Who benefits | Sources |
|---|---|---|---|---|
| Linear path (Duolingo path, Zearn, Khan course mastery) | Duolingo tree → path Nov 2022: beginners completed more, power users objected [M]. Khan dropped Knowledge Map and Missions: "linear course progression works best" [M]. | Duolingo whitepaper: higher reading/listening on path [M, company]. Zearn/TNTP 600k students: accelerated students finished 27% more grade-level lessons, struggled 17% less than remediate-first [M, correlational]. | Beginners, low-agency learners | https://blog.duolingo.com/new-duolingo-home-screen-design ; https://duolingo-papers.s3.amazonaws.com/reports/Duolingo_whitepaper_language_read_listen_write_speak_2024.pdf ; https://tntp.org/publication/accelerate-dont-remediate/ ; https://support.khanacademy.org/hc/en-us/community/posts/360027982751 |
| Free map / graph (old Khan map, Math Academy, ALEKS) | Enthusiasts loved it; Khan dropped it [M]. Math Academy suits self-driven users, no independent evaluation [L/M]. | ALEKS meta-analysis (15 studies, 24 samples): as good as, not better than, classroom teaching; larger effects with shorter use [H-abstract]. | Self-directed, stronger students; graph best under the hood | https://eric.ed.gov/?id=EJ1232632 ; https://www.mathacademy.com/how-our-ai-works |
| Adaptive engine (Mindspark, DreamBox, Khan MAP Accelerator) | Dose-dependent: DreamBox 35-44 min/week vs 60-90 recommended [M]; Mindspark gains scaled with minutes [H]. | LMIC meta-analysis (16 RCTs, 53k): g = 0.18 overall, 0.35 for level-adaptive tools [H-abstract]. Mindspark 0.36 SD in 4.5 months [H]. Khan MAP 30+ min/week about 20% more learning [M, company]. Khan as a substitute for math class in Brazil: no proficiency effect, better attitudes [H-abstract]. | Furthest behind gain most relatively | https://bera-journals.onlinelibrary.wiley.com/doi/10.1111/bjet.13116 ; https://cepr.harvard.edu/dreambox-learning-achievement-growth ; https://blog.khanacademy.org/khan-academy-efficacy-results-november-2024/ ; https://www.povertyactionlab.org/evaluation/impact-online-math-learning-platform-test-scores-and-attitudes-towards-math-brazil |
| Reference / look-up (Math is Fun, MathWorld, Khan search, Photomath, Mathway, Socratic, Brainly) | Bursty, deadline-driven [M]. | No RCT shows look-up tools produce learning [M]. LAK'22 (82M submissions): sharp rise in unrealistically fast answers after photo-solvers spread [M]. Hint abuse common and linked to lower learning [H/M]. Worked examples help novices if followed by self-testing [M]. | Motivated students who know what they're missing; low performers tend to copy | https://dl.acm.org/doi/10.1145/3506860.3506868 ; https://learninganalytics.upenn.edu/ryanbaker/PSCS-gaming-v6.pdf |
| Hybrid reference + path (Khan search + courses + "Get ready for"; Brilliant; Mindspark Topics map + adaptive flow) | Every successful hybrid found leads with a path; search/map is secondary [M]. | No study isolates the hybrid [L]. | n/a | https://blog.khanacademy.org |

Verdict (agent's): (1) path as home, dictionary as side door; (2) every dictionary entry ends in a 3-5 question mini test, with "go back one step" on failure (Zearn just-in-time); (3) place by adaptive testing, not self-report; (4) north-star metric: minutes of active practice; (5) watch for gaming (very fast answers, hint spam trigger "try one yourself").

## Part 2: Mindspark

Product [H, Muralidharan, Singh & Ganimian 2019, Appendix C]:
- Built by Educational Initiatives over about 10 years; 45,000+ items; math organised topic → teacher topic → cluster → student difficulty level (SDL) → question (21 topics, 105 teacher topics, 550 clusters).
- Mastery gate per SDL; math treated as linear.
- Onboarding: optional 10-15 min tutorial, then diagnostic with 4-5 questions per grade: from grade 1 up to enrolled grade; ≥75% at own grade shows up to 2 grades higher; stops at ≤25% on a grade. Diagnostic sets only the first content; after that, performance drives adaptation.
- Pass a unit → next harder activity; fail → step-by-step explanation, fundamentals review, or more questions.
- Error analysis: wrong answers classified into misconceptions (whole-number thinking 3.27 > 3.3; reverse order 3.18 > 3.27; reciprocal thinking), each affecting 3-5% of students; hand-coded rules route to remediation.
- Few videos; interactive steps with an example before each question; animated/voiced feedback on wrong answers; "Sparkies" rewards (3 in a row, topic completion, weekly target); class/city/country leaderboards [M]; staff can inject topics.
- Delhi centres 2015: 90 min/day, 6 days/week (45 software + 45 instructor groups of about 15); fee INR 200 (about USD 3)/month subsidised, true cost about USD 15/month; at scale about USD 4/month for 50 schools, about USD 2/year marginal above 1,000 schools; 58% average attendance, 13% of voucher winners attended ≤1 day.
- Delhi RCT (n = 619): ITT +0.36 SD math, +0.22 SD Hindi in 4.5 months; 90 days attended ≈ +0.59 math, +0.36 Hindi. Similar absolute gains across baseline; control bottom third made zero progress, so relative gains far larger for the weak. Math gains only on below-grade items, none on grade-level items. https://www.nber.org/system/files/working_papers/w22923/w22923.pdf
- Rajasthan scale-up (Muralidharan & Singh, NBER w34205, Sept 2025) [H]: 40 vs 40 schools, about 6,500 students; 6 lab periods/week of 35-40 min replacing 25-50% of math and Hindi class time; teacher present; lab-in-charge about USD 150/month; laptops shared. After 18 months +0.22 SD math, +0.20 Hindi; 50-66% productivity gain; no heterogeneity by baseline, gender, SES; about 1.7 grade levels in math over 18 months (status quo about half pace); no gain on school exams (below-grade pitch); USD 78 per pupil over 2 years; year 3 with shared lab-in-charge: less time on task, lower gains, same learning per minute. https://www.nber.org/system/files/working_papers/w34205/revisions/w34205.rev0.pdf
- Personalisation isolated (Rajasthan model schools, 1,528 students, grades 6-8): no average effect; +0.22 SD for bottom 25%; median use only 329 min over 9 months. https://www.povertyactionlab.org/evaluation/isolating-effects-personalization-targeted-instruction-program-india

Five lessons (agent's): teach at the real level (catch-up starts below grade); short per-grade diagnostic with 75%/25% stopping rules and 4-5 items per level, then practice overrides; diagnose misconceptions, not just levels; time on task drives everything, and a phone app has no human, so habit mechanics and teacher/parent nudges matter; below-grade gains don't show on grade-level tests, so pair backfill with grade-level and exam items and say so openly.

## Part 3: where the typical student starts

Data:
- India [H]: Delhi grade 6 about 2.5 grades behind (grade 3.5), grade 9 about 4.5 behind; one grade spans 5-6 levels. Rajasthan grade 8 average at grade 4, spread grade 2-8; skills grow at about half the curriculum's pace.
- Mongolia PISA 2022 [H]: mean 425 vs 472; 51% below Level 2 (Level 2 e.g. comparing route distances, converting currency); 2% at Level 5-6; SES gap 94. With about 40 points ≈ 1 school year, about 1 year behind the OECD average [L].
- Mongolia grade 5 EQA 2018 [H]: 41.2% proficient; national assessments at grades 5, 9, 12 since 2015.
- COVID [M]: closures among the world's longest; TV instruction; about 36% of households had internet; developing Asia lost about 0.57 learning-adjusted years (ADB); no Mongolia-specific math-loss study. https://unsdg.un.org/latest/stories/school-steppes-rural-mongolia-keeping-kids-learning-while-home ; https://www.adb.org/sites/default/files/publication/951456/ewp-717-learning-loss-recovery-covid19.pdf

Estimate [L]: gaps about half of India's. Catch-up teen enrolled in grades 7-10: real level grade 4-6, median about grade 5. About 25% at grade 3-4 (place value, times/division facts, basic fractions); about 45% at grade 5-6 (fractions, decimals, percent, ratio); about 30% at grade 7+ (signed numbers, linear equations). COVID cohort (grades 2-5 in 2020-21, 7-10 in 2026) missed in-person fractions/decimals/multiplication. Within-grade spread probably 5-6 levels. Diagnostic floor grade 2-3; most catch-up entry points grade 4-6; ЭЕШ goal starts with a grade 7-9 check and backfills.

Self-rating [M]: low performers overestimate (Kruger & Dunning bottom quartile at 62nd percentile vs real 12th; similar in grades 3-4, 7, 10 math); some recent data show muted, stable confidence instead. Use self-rating only to choose the goal and where the adaptive check starts; ask about concrete tasks, not a global level. Duolingo uses can-do statements plus optional placement; Math Academy 20-35 adaptive typed-answer questions. https://link.springer.com/article/10.1007/s10212-024-00804-x

Onboarding microcopy (English):
1. "What do you want from math right now?" — "Fill the gaps so class makes sense" / "Get ready for the ЭЕШ" / "Get really good, go past school"
2. "Which of these could you do right now, without a calculator? Tap all that feel easy." — "7 × 8 and 56 ÷ 7" / "1/3 + 1/4" / "15% of 80" / "Solve 3x + 5 = 20" / "Draw y = 2x − 1" / "Factor x² − 5x + 6"
3. Optional: "Where did math start to feel shaky?" — "Fractions & decimals" / "When x showed up" / "Geometry" / "Honestly, not sure"
4. "Quick check: about 10 questions, about 5 minutes. No grade, no one else sees it. It's just so we don't waste your time on stuff you already know."
5. Every item: "Haven't learned this yet" and "Not sure" buttons.
6. Result: not "You're at grade 4 level" but "You're solid on multiplication and fractions. Your path starts at percents; most people clear this in about 2 weeks."
7. "Almost everyone has a few gaps, especially after the COVID years. Finding them is the fast way forward."

Avoid: "beginner", "basic", "easy", grade numbers on screen, "Are you bad at math?" scales.

Caveats: Mindspark transfer to Mongolia is inference; Duolingo, Khan, DreamBox, Zearn figures are company-reported or correlational; no public Mongolian grade 9 math figure; grade 5 figure is pre-COVID.
