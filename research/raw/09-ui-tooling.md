# Raw report 9: UI/UX tooling (researched 2026-09-28)

Research agent output. Star counts from the GitHub API that day.

## Before installing UI UX Pro Max

Python 3.12.10 is installed (`C:\Users\User\AppData\Local\Programs\Python\Python312\`, in user PATH), but the running Claude Code session doesn't see it: `python` and `python3` resolve to the Microsoft Store stub and `py` isn't found in bash. UUPM tries `python`, `python3`, `py -3`, so all would fail until Claude Code and the terminal restart. If it still fails: Settings > Apps > Advanced app settings > App execution aliases, turn off python.exe and python3.exe. Test: `python --version` prints 3.12.10.

## Comparison

| Tool | What it does | Stars / last push | Runtime | Fit (1-5) |
|---|---|---|---|---|
| UI UX Pro Max (nextlevelbuilder) | Local search database plus design-system generator: style, palette, font pairing, effects, anti-patterns, pre-delivery checklist. 79 styles (50 active), 192 palettes, 74 font pairings, 119 UX rules (incl. 44×44 touch targets), 22 stacks; HTML+Tailwind default; `--persist` writes `design-system/<slug>/MASTER.md`. Paid Premium tier exists. | 131.0k / 2026-09-27 | Python 3 stdlib; optional npm CLI | 4: good for picking a direction, weaker on taste; catalog picks can be generic |
| Impeccable (pbakaus), installed v4.4.0 | One skill, 24 commands (init, shape, craft, critique, audit, polish, harden, adapt, animate, typeset, layout, delight, live…); 61 deterministic anti-slop detector rules; design hook on edits; PRODUCT.md and DESIGN.md. Began as a fork of Anthropic's frontend-design. | 71.8k / 2026-09-26 | Bundled binary | 5: most complete build-and-check loop |
| frontend-design (Anthropic) | Prompt-only: 4-6 named hex colours, type, layout, check against AI-default looks, build, self-critique, quality floor. | 178.6k repo / 2026-09-24 | None | 3: already inside Impeccable |
| Taste Skill (Leonxlnx) | Anti-slop skills with variance/motion/density dials; image-gen reference boards. | 90.6k / 2026-09-26 | npx skills add | 2: overlaps Impeccable; README full of sponsor ads |
| emilkowalski/skills | emil-design-eng, animate, review-animations, improve-animations, apple-design, mobile-native (sticky hover, tap-highlight flash, 100vh bug, input zoom, laggy taps, safe areas). | 41.4k / 2026-09-23 | `npx skills@latest add emilkowalski/skills` | 5 for motion and phone feel |
| design-motion-principles (kylezantos) | Motion build/audit | 1.1k / 2026-05-30 | none | 3 |
| vercel-labs web-interface-guidelines / agent-skills | UI checklist and audit skill | 0.9k and 31.6k / Aug 2026 | none | 3 |
| stitch-skills (google-labs-code) | Pairs with the Stitch MCP server | 8.4k / 2026-08-17 | Stitch MCP | 3 |

## Non-agent tools

- Google Stitch (free): prompt or image to screens, HTML/Tailwind export; MCP server (Mar 2026) with `get_screen` and a `design.md` token export. Good for exploring directions cheaply; treat HTML as reference.
- Figma + MCP / Dev Mode: free Starter capped at 6 MCP tool calls/month; Pro Dev/Full seats 200/day. Weak fit for a solo builder not already in Figma.
- v0, Lovable, Framer: React/Next or hosted sites, not one HTML file. Poor fit except for ideas (current export options not checked).
- Rive (Brilliant uses it): state-machine animations; MIT runtime from jsDelivr (`@rive-app/canvas-lite` 2.43.1 about 434 KB JS + 882 KB WASM uncompressed); free editor plan, paid tiers reported $9/$32/$120 (free export limits not checked). Good for 1-3 hero moments only.
- Lottie: `lottie_light.min.js` about 168 KB (dotLottie WASM about 1.2 MB); big free library. Cheap for decorative one-offs; not interactive like Rive.
- Mobbin (free tier; Pro about $10-15/month, unverified): real app screenshots and flows; good reference.

## Recommendation (agent's)

Core: Impeccable as design system and quality gate; UI UX Pro Max only to pick a starting direction; Emil Kowalski's skills (mobile-native, animate, review-animations) for motion and phone feel.

- Direction: `/impeccable init` (done) → look at 5-10 Mobbin references → run UUPM once (e.g. `search.py "math learning app mobile" --design-system -p "Math Map"`) for 2-3 candidate systems, optionally 2-3 Stitch screens → `/impeccable shape` or `/impeccable live` to pick one → `/impeccable document` to DESIGN.md.
- Build: `/impeccable craft` or plain prompts against DESIGN.md; plain CSS custom properties; tell UUPM the stack is plain HTML/CSS (it defaults to Tailwind).
- Motion: Emil's animate and mobile-native for CSS/WAAPI; Rive only for signature moments, lazy-loaded; Lottie for decorative loops.
- Quality: `/impeccable audit`, `critique`, `harden`, `polish`; Emil's review-animations; test on a real phone and DevTools at 360-390 px.

Conflicts:
- One source of truth: DESIGN.md. Skip UUPM `--persist` or copy its output into DESIGN.md and delete MASTER.md; add "DESIGN.md wins over any skill default" to CLAUDE.md.
- Contradicting rules: Impeccable bans Inter/system defaults, bounce easing, pure black/gray, nested cards; UUPM may suggest glassmorphism, neumorphism, stock font pairs, Tailwind. Impeccable is the final judge on taste; UUPM's checklist is useful for touch targets and accessibility.
- Auto-trigger collisions: both claim "any UI work"; invoke explicitly; consider removing UUPM once the direction is locked.
- Don't add frontend-design or Taste Skill on top; Emil's skills can coexist (different area).

Unverified: Composio install count, Stitch export date, Rive free export limits, Mobbin prices.

## Sources

https://github.com/nextlevelbuilder/ui-ux-pro-max-skill ; https://github.com/pbakaus/impeccable ; https://impeccable.style ; https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md ; https://github.com/Leonxlnx/taste-skill ; https://github.com/emilkowalski/skills ; https://github.com/kylezantos/design-motion-principles ; https://github.com/vercel-labs/web-interface-guidelines ; https://github.com/wilwaldon/Claude-Code-Frontend-Design-Toolkit ; https://composio.dev/content/top-design-skills ; https://github.com/google-labs-code/stitch-skills ; https://felixschmidt.software/en/blog/google-stitch-mcp-claude-code ; https://sotaaz.com/post/stitch-mcp-guide-en ; https://developers.figma.com/docs/figma-mcp-server/rate-limits-access/ ; https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server ; https://help.rive.app/runtimes/overview/web-js ; https://aistackpicks.com/reviews/rive-pricing-2026/ ; https://github.com/airbnb/lottie-web ; https://mobbin.com/pricing ; https://uxmagic.ai/blog/mobbin-review-2026
