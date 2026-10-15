# Topic card redesign (P7)

Date: 2026-10-16. Status: approved and built 2026-10-16.
File: `app/src/components/TopicSheet.svelte` (plus small new components listed below).
Owner decisions: vault `01 Decisions.md` → "Topic card redesign".

## Problem

The owner named four problems with the current card:

1. Earlier and later topics are hidden behind two small pills and show only names.
2. The card is long, the order is unclear, and the method appears twice.
3. The topic itself is hard to read: big orb, grey definition on grey, no borders.
4. Related links, lesson cards and the map link feel separate from the earlier/later topics.

## Goal

A student opens a topic and sees at once: what it is, where it sits between earlier and later topics, and a short row of buttons to every part of the card. Compactness is key. The card stays in the dark neon look.

## Layout, top to bottom

1. **Top bar (sticky):** × close button, as now. The «Мэдвэл зохих» / «Дараагийн түвшин» pills and the «i» bubble are removed.
2. **Topic strip (carousel).** See below.
3. **Title box:** bordered rectangle in strand colour. Left: topic icon tile. Middle: topic name, strand name, «Сонгон судлах» badge when elective, ЭЕШ weight line. Right: «Мэднэ» toggle. The big orb is removed.
4. **Quick-jump row:** bordered buttons, one per section the topic actually has: Томьёо ба аргачлал · Жишээ · Дасгал · Хэрэглээ · Алдаа · Материал · Хичээл. Tapping scrolls smoothly to that section. The row sticks under the top bar while scrolling.
5. **Definition box:** own bordered box, bright ink text, readable size. Source note stays small under it.
6. **Video:** same place. Looks clickable by visuals only: a frame in strand colour, a large play disc with a slow soft pulse ring, a dim gradient like a thumbnail. No added text or arrow. Pulse stops with "reduce motion". Topics without a video keep the small "coming soon" line.
7. **Томьёо ба аргачлал** (see below).
8. **Жишээ:** worked examples, own section, outside the formula box. Step-by-step reveal as now. The interactive tool (fraction, number, coordinate) sits at the end of this section.
9. **Дасгал** (draft): unchanged.
10. **Хэрэглээ, Алдаа, Материал** (draft): each its own compact section, collapsed rows as «Түгээмэл алдаа» is now.
11. **Хичээл:** lesson cards («Хичээл унших →»), without the duplicated method.
12. **Холбоотой** chips: unchanged. The blue «Математикийн газрын зураг дээрээс харах →» link is removed.

## Look: matches the app (owner, 2026-10-16)

Every section uses the app's normal dark panel and thin border and differs only by its colour, its mark and one small shape detail:
Томьёо ƒ (strand colour), Жишээ ✎ (sky, steps on a line with glowing dots), Дасгал ◎ (sun, one filled «Эхлэх» button),
Хэрэглээ ⌂ (grass, swipe cards), Алдаа ✗ (warn, crossed-out wrong + green ✓ fix), Материал ↗ (sky-deep), Хичээл ▤ (dusk).
The definition is the one special box: gold-to-strand glowing frame and a «★ Тодорхойлолт» tag. No paper textures or gradient cards.
The quick-jump buttons carry the same mark and colour as their section.

## Topic strip (carousel)

Like a game skin picker.

- One horizontal row: prerequisites on the left, the open topic in the centre, unlocked topics on the right. Prerequisites and unlocks are each sorted by first grade, so the nearest grade sits next to the centre.
- Each item: small icon tile with the topic name under it (two lines at most, then cut with …).
- Centre item: full colour, scale 1. Side items: grey (desaturated, lower opacity), scale about 0.82. Items further out fade a little more. No big zoom in or out.
- Swiping uses native horizontal scroll with snap, so it is smooth on iPhone. Tapping a side item scrolls it to the centre.
- **The card follows:** when an item settles in the centre, that topic becomes the open topic. The card body crossfades, and the strip refills with the new topic's own neighbours, centred again.
- A known topic shows a small green tick on its tile, also when grey.
- Under the strip, one small line gives the link reason after a move, e.g. «ХИЕХ ба ХБЕХ → Бутархай нэмэх: Хуваарийг ХБЕХ-ээр тэнцүүлнэ». Source: `why` in `map.json` (all 205 prerequisite links have one). Hidden when the card was just opened.
- Edge cases: no prerequisites (most basics) → left side empty, centre stays centred. No unlocks → right side empty. Phone Back still closes the card.
- Memory rule "no zoom": the 0.82 side scale is a size difference in a picker, not a zoom transition. If the owner disagrees, use size from layout only.

## Topic icons

- One tile style for all 142 topics: rounded square, strand colour border and glyph, soft glow; grade 1–4 basics dashed with no glow.
- One short math symbol per topic. Fractions always stacked. Draft set approved in principle: https://claude.ai/artifact/Jk6HG7rQXGhv2UjFaaBxDp. Owner may name icons to change.
- Data: new `app/content/topic-icons.json`, `{ "frac": "\\frac{3}{4}", ... }`, written with the same math notation `RichText` already renders.
- Component: new `TopicIcon.svelte` (`id`, `size`), used by the title box and the strip. Later the map can use it too (not in this change).

## Томьёо ба аргачлал

An elaborate section built to hold many formulas, kept compact.

- Section header with a count, e.g. «Томьёо ба аргачлал · 9».
- Content is **groups**. Each group is a closed row with a title and count; tapping opens it. Only one level of nesting.
- Inside a group, each **formula is its own bordered row** showing the formula in math type. Tapping the row opens its details under it: a short definition of the formula, when to use it, and its method steps. Rows without details are not tappable.
- Methods sit inside the group they belong to, never loose.
- Data: topic content gets an optional `groups` field:
  `groups: [{ title, items: [{ f, name?, def?, steps?: [] }] }]`.
  Until a topic has `groups`, the card builds them from what exists today, without inventing content:
  - «Томьёо»: each entry of `formulas`.
  - «Дүрэм»: each entry of `rules`.
  - «Бодох арга»: one item holding `method` steps, plus one item per lesson worked method (column calculation included). This removes the duplicated «Арга».
- Writing real groups, per-formula definitions and the full trig formula list is content work for later, flagged as draft when added.

## Files

- `app/src/components/TopicSheet.svelte`: new layout, quick-jump row, sections.
- `app/src/components/TopicStrip.svelte` (new): carousel.
- `app/src/components/TopicIcon.svelte` (new): icon tile.
- `app/src/components/FormulaSection.svelte` (new): groups and formula rows.
- `app/src/components/VideoSlot.svelte`: visual treatment.
- `app/content/topic-icons.json` (new).
- Keep `TopicSheet.svelte` from growing: strip, icon and formula section live in their own files.

## Testing

- `npm run build` passes.
- Screenshots at iPhone width (390 px) of: a basic topic (no prerequisites), `frac-add`, `trig-fn` (long formulas), a topic with a video, a topic with draft extras.
- Swipe check in the browser: swipe left and right, the card follows, the reason line shows, Back closes.
- Check other screens that share class names (memory rule: global CSS clashes).
- Update the Page Names artifact and vault `06 Page and Button Names.md` (P7 buttons change).
- Commit, push, deploy to Netlify (deploy may still be blocked by Netlify credits).
