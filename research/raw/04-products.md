# Raw report 4: products and patterns for finding and filling math gaps

Research agent output, kept verbatim for reference. Synthesized in `../left-behind-brief.md`.

## Per product

**Khan Academy.** Course, unit and skill structure; each skill is worth 100 mastery points and moves Attempted, Familiar, Proficient, Mastered. Mastered requires the last proof to come from a unit test, course challenge or mastery challenge. Course Challenge lets a student test out. "Get ready for Grade X" courses are short prerequisite-only courses. Works: about 20% above expected gains with 30+ minutes/week, but only about 9% of 350K students reached that dose. A 2025 PNAS study found higher prior achievers benefit more. The Knowledge Map (pannable skill constellation) was removed around 2013: it was built on the deprecated Google Maps API, and staff said "most students and teachers found the linear course progression works best." Users still ask for it back.
Sources: https://support.khanacademy.org/hc/en-us/articles/115002552631 , https://support.khanacademy.org/hc/en-us/community/posts/360027982751 , https://support.khanacademy.org/hc/en-us/community/posts/18591178507277 , https://www.pnas.org/doi/abs/10.1073/pnas.2507708123 , https://blog.khanacademy.org/khan-academy-efficacy-results-november-2024/

**ALEKS (Knowledge Space Theory).** Adaptive initial Knowledge Check estimates the student's knowledge state, then shows only the outer fringe: topics whose prerequisites are all known ("ready to learn"). Progress shown as a pie by domain. Fails: students call the pie guilt-tripping; slow visible progress causes anxiety, especially when the check under-places.
Sources: https://jmatayoshi.github.io/publications/JMP2021_KST_ALEKS_preprint.pdf , https://www.aleks.com/about_aleks/Science_Behind_ALEKS.pdf , https://finishmymathclass.com/i-hate-aleks-reddit-complaints/ , https://opened.co/tools/aleks-math

**Math Academy.** Prerequisite graph of thousands of topics. Diagnostic picks the most informative questions (also uses response time) to find the knowledge frontier. "Encompassings": advanced topics implicitly practise component topics, which get fractional review credit (FIRe). On lesson failure, it assigns remedial review of the specific prerequisites most likely responsible. Demanding; suits self-driven learners (medium confidence).
Sources: https://www.mathacademy.com/how-our-ai-works , https://www.justinmath.com/files/the-math-academy-way.pdf , https://frankhecker.com/2025/02/12/math-academy-part-5/

**IXL Real-Time Diagnostic.** About 40-50 adaptive questions in 35-45 minutes, with an explicit "I haven't learned this yet" button. Scores map to grade levels. Stays current with 10-15 questions a week. Too long for phone-first students who are behind.
Sources: https://blog.ixl.com/2021/01/28/common-questions-about-the-ixl-real-time-diagnostic/ , https://www.ixl.com/diagnostic

**Eedi (most relevant).** Four-option multiple choice where each wrong option reveals a specific misconception. First EEF trial (2017-21) inconclusive due to Covid; students guessed when questions felt hard. Later 2-year RCT (2023-25): +0.30 SD, about 4 months extra progress.
Sources: https://medium.com/eedi/what-makes-a-good-diagnostic-question-b760a65e0320 , https://educationendowmentfoundation.org.uk/projects-and-evaluation/projects/diagnostic-questions , https://www.eedi.com/news/two-year-rct-earns-eedi-a-gold-efficacy-certificate-from-eduevidence

**Zearn.** Daily "Tower of Power" check; a mistake launches a "Boost" that breaks the problem into smaller steps, drawing on earlier grades. Three Boosts on one tower send a "Tower Alert" to the teacher.
Sources: https://help.zearn.org/hc/en-us/articles/1500003390061-Boosts , https://help.zearn.org/hc/en-us/articles/236239748-Tower-Alerts-Report

**DreamBox.** K-8 adaptive lessons; fills prerequisites while keeping grade-level priority; analyses strategy, not only answers. Vendor efficacy claims only.
Source: https://dreamboxlearning.zendesk.com/hc/en-us/articles/27281843188243-How-Does-DreamBox-Math-Work

**Duolingo Math and Brilliant.** Short interactive lessons on a linear path, streaks, little diagnosis. Neither finds or fills school-curriculum gaps.
Source: https://www.the74million.org/article/duolingo-the-language-learning-app-giant-wants-to-teach-kids-math/

**Photomath.** Camera to answer with steps. Copying risk; evidence on its prevalence is mixed.
Sources: https://dl.acm.org/doi/fullHtml/10.1145/3506860.3506868 , https://www.emathinstruction.com/blog/the-role-of-homework-in-the-age-of-photomath-and-chegg/

**Duolingo 2022 tree-to-path redesign.** The tree confused learners about whether to push forward or go back; the linear path "removes the guesswork." Power users complained about losing control.
Sources: https://duoplanet.com/duolingo-new-learning-path-review/ , https://blog.duolingo.com/new-duolingo-home-screen-design , https://www.nbcnews.com/tech/tech-news/duolingos-update-redesign-luis-von-ahn-interview-rcna44655

**Game skill trees.** Motivate when few options are open at once, each says what it gives, and branches reveal gradually. Overwhelm when everything is visible and equal, or links are unclear.
Sources: https://gdkeys.com/keys-to-meaningful-skill-trees/ , https://www.gamedeveloper.com/design/upgrades-equipment-and-skill-trees

## Mongolian landscape

- PISA 2022: 49% of Mongolian 15-year-olds reached Level 2 in maths (OECD average 69%). Primary numeracy proficiency fell from 53.5% (2019) to 38.2% (2021). (high) https://www.oecd.org/content/dam/oecd/en/publications/reports/2023/11/pisa-2022-results-volume-i-and-ii-country-notes_2fca04b9/mongolia_a2a3f956/a93e1396-en.pdf , https://documents1.worldbank.org/curated/en/099145012062235079/pdf/P14811003c30f90f60a4c6049368b9fdec6.pdf
- Eduten: Finnish gamified adaptive practice platform, adopted by the Ministry for grades 1-9 (about 696K students in 2025). Teacher-assigned; not reported for grades 10-12; no student-facing prerequisite map found (medium). https://eduten.com/blog/mongolia-adopts-eduten , https://eduten.com/blog/eduten-platform-drives-impressive-learning-outcomes-in-a-12-week-pilot-in-mongolia.html
- Medle / econtent.edu.mn: government online school (interactive textbooks, TV lessons, videos by grade). No diagnostic found (medium). https://medle.mn/ , https://econtent.edu.mn/videoEBS/5rangi/mat
- iMath.mn (8x100 centre): grades 2-11 plus ЭЕШ; about 400 problem sets, videos, placement and remedial tests, ЭЕШ score estimates. Paid, 300K-3M MNT/year. No prerequisite map mentioned. (high) https://imath.mn/
- ЭЕШ prep: Mmind / internethicheel.mn, LIT Academy, yesh.mn, TomYo, "Багшийн туслах", teacher YouTube (e.g. Ш.Сарангэрэл "Математикийн 6000 тест"). Organised by exam or grade, test-bank heavy (medium, from snippets). https://internethicheel.mn/home/mmindTsahim , https://lit.mn/ , https://www.yolo.mn/z/7450
- Not found as maths products: "Unimind", "Бүтээлч сургалт", "Econ". eschool.mn is school management (medium).

## Patterns to steal (ranked)

1. "Ready to learn" frontier: learned / ready now (glowing) / later (dim); at most 3-5 glowing; one "start here" marker.
2. Short misconception-based placement: 8-12 questions, one per stop, working backwards from grade level; wrong options map to earlier topics; always an "I haven't learned this yet" option.
3. One recommended next step at all times; the map stays for orientation.
4. Check before accepting "learned": 2-3 quick questions or a self-check prompt.
5. Link failure to a specific prerequisite sphere and say "start here first."
6. Paired topics as one unit: mastering the harder one gives partial credit to the easier one.
7. "Get ready for" presets per grade or ЭЕШ target showing only the needed subgraph.
8. Light spaced review: a "fading" state with a one-question refresh.
9. Teacher export: shareable snapshot (link or QR) without accounts.
10. Progress framed as unlocks, not a percentage owed.

## Patterns to avoid

- All 39 topics at equal weight on first load.
- Percentage pie or bar as the main metric.
- Long diagnostics (keep under 10 minutes, resumable).
- Hard locks.
- Multiple-choice-only with no stakes (guessing).
- Answer reveal without reasoning.
- Leaderboards or visible comparison.

## Mongolian market gap (medium confidence)

Mongolian resources are organised by grade or exam. None found gives a teenager a free, Mongolian-language, phone-first view of which earlier topics cause today's difficulty, with a prerequisite map, a ready-to-learn frontier and misconception-targeted placement. Opening: self-serve gap diagnosis for grades 7-12 working backwards from ЭЕШ or class topics; one recommended next step; linking to existing free lessons instead of competing on content; a tutor-shareable snapshot.

Caveat: montsame.mn, tomyo.mn and yesh.mn could not be fetched.
