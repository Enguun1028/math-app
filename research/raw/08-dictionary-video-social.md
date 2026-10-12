# Raw report 8: dictionary feel, short video, photo search, social and teacher features, safety

Research agent output, kept for the brainstorm and spec. [H] published evidence or primary docs, [M] industry practice or secondary, [L] inference or unverified.

## 1. Dictionary that feels instant

Patterns:
1. Results on every keystroke, under 100 ms, offline: ship the whole term index to the phone (tens of KB) and search locally (MiniSearch or Fuse.js). [M]
2. Typo tolerance plus Latin↔Cyrillic search. Store Cyrillic form, normalized Latin (ө/ү→o/u, х→h/kh, ш→sh, ц→ts/c, ж→j/zh), informal spellings ("tegshitgel", "tegshtgel"), synonyms and English/Russian terms ("funkts", "function", "функц"). Fold query and terms the same way; edit distance ≤1 for 4-7 letters, ≤2 longer; match symbols ("x^2", "√", "sin"). [L, standard IR]
3. Empty search box shows recent lookups, "popular in your class this week", "your weak topics". [M]
4. Peek previews for linked terms: bottom sheet with one-line definition, mini picture, "Open full entry". Wikipedia Page Previews A/B: +20-22% distinct pages engaged per session, full pageviews -3-5%, almost nobody disabled it. [H] https://www.mediawiki.org/wiki/Page_Previews/2017-18_A/B_Tests
5. Backlinks and mini prerequisite graph: "Needed first" chips above, "Unlocks next" below, each with mastery colour. [M]
6. Deep link per entry (app/term/tegshitgel) for sharing, teachers, photo search landing. [M]
7. Fixed entry layout, progressive detail: title plus 1-sentence plain definition; one hero picture or interactive visual (Desmos-style slider); one worked example; "Like in real life…" analogy; 60-120 s video; 3-question mini test. Formal definition, extra examples, common mistakes collapsed. [M]
8. Instant answers for computable queries: "2/3+1/4" shows the result and links "Fraction addition". [M]

Anti-patterns: search button required; bare "no results"; walls of text; login before lookup; ads or blocking modals.

Sketch: search bar always at top of home, camera icon inside. Typing "tegsh" lists "Тэгшитгэл (equation)" and "Тэгш өнцөгт" by the third letter. Entry: scale-balance animation, "An equation is a balanced scale", worked example, 90 s video card. Chips above ("Хувьсагч", "Үйлдлийн дараалал") show one red prerequisite; tapping opens a peek sheet. Bottom: "Test yourself (3)", then "Where this sits on your sphere map".

## 2. Short video with high retention

Evidence:
- Guo, Kim & Rubin 2014 (6.9M edX sessions): median engagement peaks about 6 min, few finish past 9 min; informal talking-head and Khan-style handwriting beat studio lectures; faster, enthusiastic speakers kept more viewers. [H] https://dl.acm.org/doi/10.1145/2556325.2566239
- Kim et al. 2014: more dropout in longer videos and tutorials; 61% of rewatch peaks align with visual transitions. [H] https://pg.ucsd.edu/publications/edX-MOOC-in-video-dropouts-peaks_LAS-2014.pdf
- Koedinger's doer effect: doing predicts learning far more than watching. [H] https://files.eric.ed.gov/fulltext/ED593206.pdf ; ICAP (Chi & Wylie 2014) [H, later critiques M]

Patterns:
1. One concept per clip, 45-120 s, 3 min max; hook in the first 3 s. [M]
2. Vertical 9:16, hand-drawn or animated visuals with voice-over; 16:9 version for classroom projection. [M]
3. Mongolian captions on by default. [M]
4. Watch then try one: a question slides up at the end; optionally pause at about 70% to ask "What comes next?". [H principle, M UI]
5. Step chapters, tap-to-replay-10s, 1×/1.5×/2×. [H]
6. Silent 3-5 s loop preview on the entry card (about 200 KB). [M]
7. Self-host short MP4/HLS (Cloudflare Stream or Bunny, about $1-5 per 1,000 min delivered; 360p default) or YouTube behind a facade (lite-youtube-embed, youtube-nocookie.com, player loads on tap, LCP about 800 ms better). IFrame API with controls=0, own controls, own "Next: try it" end card; rel=0 only limits related videos to the channel, so replace the player at the end. [M] https://github.com/paulirish/lite-youtube-embed

Anti-patterns: 10-20 min lectures; long intros; YouTube's "more videos" end wall; autoplay feeds; videos without a follow-up action.

Sketch: entry card loops a tipping balance; tap for full-screen vertical 80 s clip, Mongolian captions, step bar 1·2·3; at 0:55 it pauses with a two-choice question; ends on "Try one", never a video list.

## 3. Photo-to-search

- Photomath (Google since 2023) and Lens "Homework" (Socratic folded in) default to showing the answer. [M]
- Vision LLMs read handwritten math fairly well: a 2026 study of 685 student submissions found Gemini-3-flash 89-99% rubric accuracy; 87% of errors were mis-transcriptions; it tended to hallucinate correct answers. [H] https://arxiv.org/html/2605.19043v1
- Cost: Flash-Lite-class about $0.10-0.25 per million input tokens; about 1,000 tokens per image, so about $0.0003-0.002 per photo; 10k photos/month about $5-20. 2.5 Flash-Lite retires 16 Oct 2026; 3.1 Flash-Lite $0.25/$1.50. Mathpix is a specialist alternative. [M]
- Photomath steps showed learning gains in one small study (d = 1.37) [L-M]; teachers widely report answer copying. [M]

Patterns: photo → concept, not answer (recognize, classify topic/skill, open entry plus a similar problem); confirm step with editable math keyboard; hints one at a time, full solution only after an attempt; crop to one problem; failing the similar problem offers the red prerequisite; delete images after processing, strip EXIF. [L-M]

Anti-patterns: instant answers; storing notebook photos; unlimited free LLM endpoint (rate-limit per device).

Sketch: camera, crop one line, "3(x−2)=12 ✓ correct?", then "This is Opening brackets and Linear equations" chips, "Try this similar one: 2(x+1)=10", then "Now try yours"; stuck → Hint 1/3 → "Ask your teacher".

## 4. Social, classes, battles, safety

Evidence:
- Peer tutoring effects 0.09-0.70; secondary maths review (Alegre et al. 2019, 42 studies) positive, larger in primary; shorter structured programs better. [H] https://pmc.ncbi.nlm.nih.gov/articles/PMC6819807/
- Time pressure consumes working memory (Beilock; Ramirez et al. 2013); Boaler links timed tests to math anxiety onset [H/M]. Kahoot studies mostly report lower anxiety (10 of 14 in one review) [M, many vendor-linked]; Kahoot recommends team mode and switching off timers or leaderboards for fairness. [M]
- Gimkit rewards sustained accuracy; Blooket self-paced; Classcraft co-op boss battles (correct answers damage the boss, wrong ones hurt the team, teammates heal). [M]

Battle design (turn-based):
1. Damage = correctness × difficulty; speed bonus capped at about +20%; generous window (e.g. 60 s), no slowness penalty. [L]
2. Streak/combo bonus for consecutive correct answers. [M]
3. Wrong answer shows the method; retry deals half damage. [L]
4. Main mode co-op: class or team vs a boss built from the class's weak topics; 1v1 only between opted-in friends, skill-matched. [M]
5. No public ranking of lowest scores; top-only or personal bests. [M]
6. Questions from each student's own path (spaced practice). [L]

Safety:
- UNDP 2025 Ulaanbaatar survey (1,093 students): cyberbullying 22.1% of bullying cases (35.5% in Khan-Uul); 2.9% of victims turned to a friend, 44.5% searched online for help. Ministry: 82.8% of 12-18-year-olds experienced peer violence. 2020 survey: 87% of children faced online abuse while 91% of parents believed their child never had. [H/M] https://www.undp.org/sites/g/files/zskgke326/files/2025-08/undp_cyberbullying_report_eng_0.pdf
- Mongolia Personal Data Protection Law (passed Dec 2021, in force 1 May 2022) requires consent, overseen by the National Human Rights Commission. Minor/parental-consent specifics unverified: get a Mongolian lawyer; assume parental consent under 18. [L] https://www.dlapiperdataprotection.com/index.html?t=law&c=MN , https://www.pwc.com/mn/en/tax_alerts/tax_alert_02_2022.html
- Draft law (to Cabinet March 2026, not passed) would bar under-16s from "age-restricted social networks"; open friends and DMs could fall under it. [M] https://mongolia.gogo.mn/r/vmxxk
- UK Age Appropriate Design Code (under-18s): high-privacy defaults, location off, no nudges, data minimisation; COPPA and GDPR-K similar. [H] https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/ ; UNICEF Mongolia COP guidelines https://www.unicef.org/mongolia/reports/child-online-protection-guidelines

Safety patterns: class-only groups by teacher code, friends only among classmates, mutual requests; no private messaging in v1 (preset reactions, problem-tied help requests, teacher-visible threads); nicknames and avatars only, no photos or location, profiles class-only; teacher moderates, one-tap report/mute, Mongolian profanity filter in Cyrillic and Latin, remove first then review; reports to teacher and us plus child helpline 108; parental consent and minimal sign-up (phone or parent contact, grade, school). [M/L]

Anti-patterns: open DMs, public profiles, public "worst in class" rankings, speed-only scoring, loot boxes, night-time streak-guilt notifications.

Sketch: teacher creates class "9Б", code K7Q2M; weekly co-op boss "Fraction Dragon" with HP bar, "The class needs 40 more correct answers"; Help board ("Батаа needs help on step 2") with teacher-visible replies; 1v1 only between mutual friends, 60 s turns, damage by accuracy and difficulty.

## 5. Routing questions to teachers

References: Snapask (photo question, about 1 min tutor pickup, paid); Brainly (80% answered under 10 min, variable quality); Khanmigo teacher tools (7-day summaries, misconception and class-struggle flags). [M] Volunteer teachers can't match minutes; set "within 1-2 school days".

Patterns: automatic help first (photo → entry → hints), only "still stuck" goes to a teacher; questions tagged with topic, prerequisite, stuck point, attempts, grouped by topic ("7 students stuck on distributing negatives"); answer once, share with many (30 s voice or photo explanation, optionally pinned to the entry); weekly gap report (class heatmap of prerequisites); student status Sent → Seen → Answered with expected time; teacher replies in class-visible threads, never private chat. [M/L]

Anti-patterns: teachers as on-demand homework solvers; paid tutor marketplace (strangers with minors); no time expectation.

## Risks

- Safety: grooming or bullying with DMs or open friending; 2026 under-16 draft law; unverified parental-consent rules; photos with faces or names; hard moderation of Latin-script Mongolian.
- Cost: vision API abuse (rate-limit, budget alarm; model pricing changing); self-hosted video bandwidth vs YouTube branding and related-video leak; Mongolian short-video production is the bottleneck (300 clips at hours each).
- Scope: social, battles, teacher routing, photo search are each products; mis-recognized photos hurt trust; unanswered teacher questions kill the feature.

## Recommended phasing (agent's)

1. Dictionary core: offline instant search with Cyrillic/Latin folding and typos; fixed entry layout, prerequisite chips, peek sheets; mini test; deep links; videos for the top 30-50 entries (60-120 s vertical, facade or self-hosted); sphere path uses the same entries.
2. Photo-to-concept (no direct answers); class codes; read-only teacher dashboard with weekly gap report.
3. Co-op class boss battle (accuracy-scored); topic-grouped teacher question queue; preset help requests; parental consent and reporting before launch.
4. Only if safety holds: 1v1 friend battles, peer explanation threads, teacher-moderated free text. Never open DMs, public profiles or stranger matching.

## Other sources

Wikipedia Mongolian Latin alphabet: https://en.wikipedia.org/wiki/Mongolian_Latin_alphabet ; YouTube facade CWV: https://www.corewebvitals.io/pagespeed/perfect-youtube-core-web-vitals ; Gemini pricing: https://devtk.ai/en/models/gemini-2-5-flash-lite/ ; Photomath: https://en.wikipedia.org/wiki/Photomath ; Lens Homework: https://www.engadget.com/google-lens-socratic-math-problems-102931355.html ; ICAP critique: https://www.nature.com/articles/s41539-023-00197-4 ; Boaler: https://www.youcubed.org/evidence/fluency-without-fear/ ; Kahoot: https://kahoot.com/blog/2026/01/14/kahoot-impact-competition-education-research/ , https://journals.gre.ac.uk/index.php/msor/article/view/1245 , https://trust.kahoot.com/teachers/ ; Classcraft: https://class-craft.fandom.com/wiki/Boss_Battles ; Gimkit/Blooket: https://learnclash.com/blog/blooket-vs-gimkit ; Snapask: https://snapask.com/en-my/feature/instant-qa ; Brainly: https://faq-hi.brainly.com/hc/en-gb/articles/5061920819090-How-Long-Will-It-Take-To-Receive-An-Answer-To-My-Question ; Khanmigo reports: https://support.khanacademy.org/hc/en-us/articles/29473549307277-What-reports-does-Khan-Academy-offer-teachers-to-monitor-their-students-Khanmigo-use
