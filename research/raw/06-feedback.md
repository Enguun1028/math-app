# Raw report 6: feedback guide for Математикийн аялал

Research agent output, kept for the brainstorm and the spec. Key numbers checked by the agent via web search (Wisniewski 2020, Van der Kleij 2015, Sinha & Kapur 2021, Silverman & Barasch 2023, Roschelle 2016); the rest cited from established literature. [H] replicated or meta-analytic, [M] solid single line or moderator-dependent, [L] thin, contested or practitioner lore.

Note for the brainstorm: the owner wants long-unvisited spheres to dim (with clear contrast from "not yet" spheres). This report warns that visibly dimming earned spheres reads as loss, and recommends a subtle "could use a refresh" marker instead. Reconcile in the design: fading keeps the sphere's colour and ownership, adds a small refresh mark, never looks like lost progress.

## (a) Principles

1. Say what to do next, not only right/wrong. Elaborated feedback g = 0.49; showing the correct answer 0.32; right/wrong only 0.05. Larger in math. (Van der Kleij, Feskens & Eggen 2015, 40 studies, 70 ES) [H]
2. Feedback is not automatically good. Mean d ≈ 0.41 over 607 ES, but about 38% of interventions lowered performance, when feedback shifts attention to the self. (Kluger & DeNisi 1996) [H]
3. Aim at task, process and self-regulation, never the person. d = 0.48 over 435 studies; high-information feedback strongest; praise, rewards, punishment weakest. (Wisniewski, Zierer & Hattie 2020; Hattie & Timperley 2007: where am I going / how am I going / where to next) [H]
4. Praise strategy, not ability. Intelligence praise led to worse performance after failure and more score misreporting. (Mueller & Dweck 1998; Gunderson et al. 2013/2018) [H direction, M size]
5. Never compare a struggling student with others. Normative feedback and leaderboards hurt low performers; comments alone beat grades plus comments. (Butler 1987/88; Hanus & Fox 2015; Shute 2008) [H]
6. Timing depends on the learner: immediate for low prior knowledge and hard/procedural steps; delayed helps retention for stronger learners and conceptual review. (Shute 2008; Kulik & Kulik 1988; Van der Kleij 2015; Butler, Karpicke & Roediger 2007) [M]
7. Give feedback on low-confidence correct answers too; corrected high-confidence errors stick well (hypercorrection). (Butler, Karpicke & Roediger 2008; Metcalfe) [M-H]
8. Graduated hint ladder ending in a worked example. ASSISTments RCT (2,850 7th graders) raised end-of-year scores, more for low prior achievers. (Roschelle et al. 2016) Fading worked examples helps novices (Renkl & Atkinson). [H]
9. Struggle-first works for new concepts with good design: productive failure g = 0.36 on conceptual understanding and transfer, no procedural cost, stronger for grade 6+. (Sinha & Kapur 2021, 53 studies) [H] Not for remediating a student already stuck.
10. Show progress-to-date early, remaining work near the end (goal-gradient, Kivetz et al. 2006; middle dip, Bonezzi et al. 2011; Koo & Fishbach 2008). [M-H]
11. Real head-start credit: 10-stamp card with 2 pre-filled 34% completion vs 8-stamp card 19% (Nunes & Drèze 2006). Credit must come from real placement results. [M]
12. Make small wins visible (Amabile & Kramer 2011, progress principle). [M]
13. A broken streak shown as broken reduces later engagement; worse with self-blame, softened when repairable. (Silverman & Barasch 2023) [H]
14. Wise feedback: high standards plus assurance ("I'm giving you this because I believe you can reach it") raised revision rates among low-trust students (Yeager et al. 2014). [M] Standalone mindset messages d ≈ 0.08 (Sisk et al. 2018). [H]
15. Expected, tangible, engagement-contingent rewards undermine intrinsic motivation; informational verbal feedback does not (Deci, Koestner & Ryan 1999). [H] Content-related, non-disparaging humor helps; humor aimed at the learner backfires (Banas et al. 2011). [M]

Also: EEF Teacher Feedback to Improve Pupil Learning (2021), about +6 months: good initial instruction first; specific feedback that moves learning forward; plan how students will use it; pick the method by purpose. [H] Shute 2008: elaborate on the error, small chunks, no comparisons, no person praise, scaffold low achievers.

## (b) Playbook

Timing norms (UX convention [L-M]): tap response under 100 ms; correct/incorrect state 150-250 ms; celebration 400-800 ms, skippable; big unlocks 1.2-2 s at most, once per unlock; light haptic tick on correct, no buzz on wrong; sound off by default in class, separate toggle.

| Moment | Show | Say | Timing | Avoid |
|---|---|---|---|---|
| First open | Goal picker (Catch up / ЭЕШ / Get good), then a 5-minute check offer; no locked map yet | "No grades here. We'll find where you are and start from there. ~5 min." | 300 ms fade | Whole locked map, "0/39", asking grade first (agent's view) |
| Placement result | Already-known spheres lit up (earned), then one next topic | "You already have 11 topics solid. Next up: fractions → ratios. That's what unlocks equations." | Known spheres light one by one over about 1 s | Red failure lists, percentiles, "below grade level", missing-pie |
| Dictionary entry | Prerequisite chips with state (solid / shaky), picture first, "Try 1 question" | "Built on: fractions ✓, negative numbers ~. Shaky on one? Tap it for a 1-min refresh." | Instant, no gate | Locks, "you need X first", walls of text |
| Mini-test correct | Neutral/green check plus one-line why; short if fast and confident, more if slow or guessed | "Yes, you flipped the second fraction before multiplying. That's the move." Rarely: "Clean. No notes." | 150-250 ms, small pop, light tick | "Genius", useless points, streak counter per item |
| Mini-test wrong (1st) | Amber/grey, a hint not the answer, work stays visible | "Not quite. Check the sign when you moved −3 across. Try again?" | 200 ms shake at most, no buzz or sound | Red X with sound, instant answer reveal, "Wrong!" |
| Wrong 3 times | Faded worked example; then name the specific prerequisite; optional 2-min detour with the item saved | "This one's leaning on negative numbers, and that part looks shaky. 2-min refresher, then back here? Totally normal: that's what the map is for." | Detour card slides in 300 ms | "Too many attempts", score loss, forced detour, humor |
| Sphere unlocked | Sphere brightens, shows the 1-3 skills that opened it; next sphere "ready when you are" | "Unlocked: Linear equations. You built this from ratios + negatives." | 1.2-2 s, skippable, once | Loot, rare drops, forced next lesson |
| Path milestone | To-date early; after about 60% switch to remaining ("3 topics to the ЭЕШ algebra block"); "things you can now solve" recap | Early: "8 topics in. Remember when −(−3) was confusing?" Late: "3 left in this block." | 600-800 ms; opt-in share card | "8/120" debt totals, ranks |
| Back after days | Warm welcome, 3-question warm-up, spheres unchanged | "Hey, welcome back. Your map's right where you left it. Quick 3-q warm-up?" | 300 ms | Broken-streak messages, guilt notifications, "you've lost progress"; if streaks, weekly and repairable |
| Topic fading | Subtle "could use a refresh" dot, optional quick review | "Fractions could use a 90-sec refresh. Future you on ЭЕШ day will thank you." | Static, not pulsing | Visibly dimming or "rotting" earned spheres, red badges |
| Exam-goal progress | Readiness bands per ЭЕШ section (ready / getting there / next focus) plus one action; no early predicted score | "Algebra: getting there. Biggest gain this week: quadratics (worth ~3 exam items)." | Weekly | Early predicted score, alarm countdowns, percentiles |
| Teacher view | Groups by shared stuck prerequisite with a suggested mini-lesson; individual stuck points and hint use; real-time "stuck now" flags (Holstein et al. 2018 [M]) | "Group of 5 → reteach negative numbers (suggested 10-min set)." | Live in class | Student-visible rankings, time-on-app as quality, whole-student red/green labels; dashboards must lead to action (Molenaar & Knoop-van Campen 2018 [M]) |

Peer feedback: structured prompts ("What step do you think they missed?"), task-focused, anonymous from the student side, no ratings of people. Peer assessment g ≈ 0.3 (Double, McGrane & Hopfenbeck 2020) [M-H]; EEF peer tutoring about +5 months [H].

## (c) Looks motivating, backfires

1. "0/39", completion percentages, missing-pie charts (debt framing, middle dip) [M]
2. Leaderboards, "top 10%" [H]
3. Daily streaks shown as broken [H]
4. "You're a genius!" [H]
5. Growth-mindset slogan screens (d ≈ 0.08) [H]
6. Showing the answer on the first wrong try [M-H]
7. Right/wrong only (0.05) [H]
8. Loot boxes, spin wheels, random drops [M-H]
9. Points for time spent or items attempted (gaming, hint abuse) [H]
10. Red X, error sound, buzz (red-specific evidence contested [L]; punitive signals clash with an anxious audience)
11. Humor at error moments or memes mocking the student [M]; fine on success, loading, empty states
12. Confetti on every item [L-M]
13. Faked endowed progress [L]
14. Guilt notifications with a sad mascot [L-M]
15. Early predicted exam scores [L-M]

## (d) Uncertainties

Animation durations and haptics are UX convention [L]; streak evidence is consumer research [M]; immediate vs delayed timing flips between lab and classroom [M]; meme tone has no direct RCTs [L].

## Sources

- Wisniewski, Zierer & Hattie 2020: https://www.researchgate.net/publication/338745455_The_Power_of_Feedback_Revisited_A_Meta-Analysis_of_Educational_Feedback_Research
- Van der Kleij et al. 2015: https://eric.ed.gov/?id=EJ1081708
- Sinha & Kapur 2021: https://journals.sagepub.com/doi/10.3102/00346543211019105
- Silverman & Barasch 2023: https://academic.oup.com/jcr/article-abstract/49/6/1095/6623414
- Roschelle et al. 2016: https://journals.sagepub.com/doi/full/10.1177/2332858416673968
- Not re-fetched: Kluger & DeNisi 1996; Hattie & Timperley 2007; Shute 2008; EEF 2021; Mueller & Dweck 1998; Gunderson et al. 2013; Butler 1987; Kivetz et al. 2006; Nunes & Drèze 2006; Koo & Fishbach 2008; Bonezzi et al. 2011; Amabile & Kramer 2011; Deci, Koestner & Ryan 1999; Yeager et al. 2014; Sisk et al. 2018; Banas et al. 2011; Hanus & Fox 2015; Holstein et al. 2018; Double et al. 2020.
