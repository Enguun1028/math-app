# Raw report 5: learning-app UI/UX designs and ideas

Research agent output, kept for the brainstorm session. Links checked with curl; the Medium post, Khan Academy help centre, Fast Company and gameuidatabase return 403 to bots but appeared in live search.

Note for the brainstorm: idea 9 (one-sentence growth-mindset message) sits against report 3, which found standalone growth-mindset effects near zero (d = 0.08). Treat it as a tone choice for error moments, not as an intervention.

## Top 10 ideas to steal

1. **"You are here" plus a return button (Duolingo path).** Floating button flies back to the current spot. Units named by task, not number. Old tree caused "choice paralysis".
   Our map: bottom-right "Ready now" button flies to the frontier sphere; islands named for what you can do there.
   https://blog.duolingo.com/new-duolingo-home-screen-design , https://developer.apple.com/news/?id=jhkvppla
2. **Guidance without losing freedom (Brilliant with ustwo).** Clear direction while keeping freedom of choice. Fits "a useful place to browse".
   Our map: everything tappable; only suggested spheres get a soft pulse and "suggested" tag.
   https://ustwo.com/work/brilliant/
3. **Colour-coded paths, motion only at meaningful moments (Brilliant, Rive).**
   Our map: one muted hue per island; a road segment inks in when the sphere before it is learned.
   https://rive.app/blog/how-brilliant-org-motivates-learners-with-rive-animations
4. **Knowledge that fills in (Math Academy).** About 300-topic graph fills as you go; implicit review of related topics.
   Our map: learned spheres go outline to solid; prerequisites of a just-checked sphere get a faint "refreshed" shimmer.
   https://www.mathacademy.com/how-our-ai-works , https://www.justinmath.com/how-math-academy-creates-its-knowledge-graph/
5. **Graded mastery (Khan Academy).** Attempted, Familiar, Proficient, Mastered; 6-question Mastery Challenge across 3 skills.
   Our map: 3-step ring per sphere (seen, checked, solid); spaced re-check completes it.
   https://support.khanacademy.org/hc/en-us/articles/5548760867853
6. **Opt-in placement (Duolingo).** "Start from the beginning" or "Show me what I already know (3 min)"; skipping still shows the map.
   https://goodux.appcues.com/blog/duolingo-user-onboarding
7. **Slack in streaks (Duolingo Streak Freeze).** Reported 21% less churn among at-risk users.
   Our map: "3 of 7 days this week" dots; missing a day resets nothing.
   https://blog.duolingo.com/how-streaks-keep-duolingo-learners-committed-to-their-language-goals/ , https://blog.duolingo.com/how-duolingo-streak-builds-habit
8. **One idea, one diagram per card (Imprint, Google Play Best App 2023).**
   Our map: bottom sheet as 3-4 swipeable cards: What it is, Picture, Key terms, Try one.
   https://www.imprintapp.com/ , https://www.androidcentral.com/apps-software/google-play-awards-2023-winners
9. **One-sentence message at the moment of error (Khan with PERTS/Stanford).** Modest gains reported.
   Our map: after a wrong answer, one calm sentence plus the worked step; no red screen.
   https://www.kqed.org/mindshift/36603/new-research-students-benefit-from-learning-that-intelligence-is-not-fixed
10. **One consistent illustration style (Vocabulary, Apple Design Award 2025 finalist; CapWords winner).**
    Our map: one hand-drawn stroke style across map, diagrams and icons.
    https://developer.apple.com/design/awards/2025/

## Map UI patterns

1. Semantic zoom, three levels: far = island names, road, dots; mid = sphere labels; near = edges for the focused sphere only (Obsidian local graph). https://obsidian.md/help/plugins/graph
2. Focus mode on tap: related spheres full opacity, rest about 25%; sheet covers lower 50-60%; sphere panned into the top third.
3. Transit-map geometry: 45°/90° road, colour per island line, companion pairs as interchange stations (Mini Metro). https://en.wikipedia.org/wiki/Mini_Metro_(video_game) , https://www.researchgate.net/publication/4175427_Automatic_layout_of_project_plans_using_a_metro_map_metaphor
4. Locked means "not yet": no padlocks; dashed outlines, tappable; "Needs: Fractions, Ratios" chips.
5. Landmarks per island with palette shifts (Mario world maps, Monument Valley 3 colour script). https://www.itsnicethat.com/features/ustwo-games-monument-valley-3-illustration-digital-spotlight-111224 , https://www.designweek.co.uk/how-monument-valley-3-came-to-life/
6. "You are here" traveller marker (horse or ger pin) plus recenter button in the thumb zone.
7. Island strip: 8 chips pinned at the top, each with fill level; tap to fly there.
8. Gesture hygiene: pan and pinch with inertia; double-tap to zoom; clamp bounds; 44px tap targets; primary actions in the bottom third; low data (inline SVG, one subset font, local progress).

## Tone and feedback

1. Wrong answer: amber or grey, not red; show the step. "Not quite. Here's the step that trips most people up." / "Close! You flipped the sign in step 2."
2. Normalise being behind. "Everyone's map has blank spots. Let's fill one." / "This is a 5-minute topic. Most people pick it up on the second try."
3. Placement as a "quick look", with "I don't know this yet", about 8 items. "No grades, no timer. Skipping is a valid answer." Result: "You already know 14 of 39. Here's where your map starts."
4. Celebration sized to the win: about 300ms ink-fill and a soft chime per sphere (Duolingo spec 320ms unlock, 180ms press); one landmark animation per island; no confetti storms or dancing mascots. https://github.com/nexu-io/open-design/blob/main/design-systems/duolingo/DESIGN.md (community reconstruction)
5. Progress as what opened: "Learning Ratios opened 3 new places: Percent, Scale drawings, Rates."
6. Kind streaks: "3 days this week"; after a break, "Welcome back. Your map is exactly where you left it."
7. Voice of a slightly older cousin: short, second person, no baby talk, no corporate. "Nice. That one's yours now."
8. Honest learned gate: "Want to check it? 3 questions. If one misses, we'll show why. No penalty."

## Visual direction candidates (all light-first, optional dusk mode)

**A. Мөнх хөх тэнгэр / Steppe Daylight (Mongolian-grounded; agent's recommendation).** Sky #EAF2FA to #CFE3F5, tenger blue #2F6FB0 primary, steppe #C9D8A6 / #8FA86A, dust sand #EFE6D2, deel red #C8412E sparingly, gold #D9A441 for learned, ink #1E2A38. Humanist grotesk with good Cyrillic (Manrope, Onest, Golos). Islands as soft steppe plateaus, road as a dirt track, spheres as flat discs with a thin ring like a тооно (ger roof wheel); learned = gold ring and small ulzii stamp. Ulzii only as the learned seal and dividers. References: Gobi Cashmere rebrand by Mucho (https://wearemucho.com/work/gobi-cashmere , https://www.creativeboom.com/news/mucho-has-unveiled-a-rebranding-for-gobi/); colour meanings (https://www.amicusmongolia.com/color-symbol-in-mongolia.html); ulzii (https://indigenousgrid.substack.com/p/khalkha-mongolia-the-ulzii-a-pattern).

**B. Transit Paper.** Off-white #F7F5F0, ink #222, 8 line colours (#E4572E #2E86AB #3BB273 #F2A541 #7B5EA7 #D1495B #00A6A6 #8C6D46). Condensed grotesk for station names. White stations with coloured borders; companion pairs as interchange capsules. Scannable, teen-cool; risk: schematic, so add a landmark per terminus.

**C. Brilliant-style Clean Geometry.** White, cool grey #F1F3F6, near-black #111418, one accent (green #1FAF6E or cobalt #3056D3); island tints about 10%. Flat nodes, crisp 2px strokes, matching diagram strokes. References: Brilliant and its 2023 brand refresh (https://pcho.medium.com/a-brilliant-brand-refresh-4af021c11486 , https://brilliant.org).

**D. Monument Pastel Isles.** Gradient sky #F6D6C8 to #BFD7EA, per-island pastels (peach #F4B393, sage #A7C4A0, lilac #C3B1E1), slate text #2B2D42, rounded humanist sans; isometric low-poly islands, matte clay-bead spheres. Risk: heavy to draw, can drift cute.

**E. Field Notebook / Graph Paper.** Cream #FBF8F1 with grid #E6E0D2, graphite #3A3A3A, highlighter accents (yellow #FFE066, mint #9BE3C3, coral #FF8C7A); clean sans plus hand-lettered island titles; hand-drawn circles, highlighter swipe when learned. Reads as "my own notes". (Note: cream plus hand-lettering is close to a common AI default; would need care.)

## Anti-patterns

- Dark neon glow on near-black: reads as an AI crypto dashboard; poor contrast and battery; bad on cheap Android screens in sunlight.
- Padlocks and "you can't" grey-outs.
- Punitive streaks and guilt notifications.
- A forced single linear path (Duolingo backlash: https://www.nbcnews.com/tech/tech-news/duolingos-update-redesign-luis-von-ahn-interview-rcna44655 , https://duoplanet.com/duolingo-new-learning-path-review/).
- Mascot- or confetti-heavy celebration.
- Full-graph hairballs (show edges only on focus).
- Test-like placement (timers, scores, "Grade level: 5").
- Ornament as wallpaper.
- Red X plus buzzer on wrong answers.
- Corporate LMS chrome ("Module 4.2", percentage bars everywhere).

## Local context

Eduten reached more than 696k students in grades 1-9 in 2025 (https://montsame.mn/en/read/309888), so many teens already know a school exercise-platform look; a calm, map-based, self-directed app is visibly different. No Mongolian consumer app with notable published UI design found; the Gobi rebrand is the best example of Mongolian visual culture used tastefully.
