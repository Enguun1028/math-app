// Shared UI state: previews, the tool bag, and where the map was (kept when you come back to the map).
export const ui = $state({
  preview: null, // entry id for the quick term preview
  topic: null, // topic id for the topic sheet
  land: null, // formula id tapped in a formula tree: its answer page scrolls to its details
  focus: null, // idea or lesson id the topic sheet scrolls to and glows once it opens (came from search)
  slide: 0, // 1 / -1: the next topic card slides in from the right / left (set by the topic strip)
  tools: false,
  level: false, // the "Дутагдлаа олъё" sheet
  tool: 'graph',
  graphSeed: null, // lines for the graph calculator to open with (from search or a topic card)
  scrollY: null, // how far the map was scrolled
  fly: null, // { sphere } or { topic } the map should scroll to when it opens
  morph: null, // { sphere, rects } screen spots of a sphere's topics, for the opening animation
  lastQuery: null, // what was in the search box, kept when coming back to search
  typed: null, // a typed formula, shown on the answer page as "Таны бичсэн"
  alts: [], // other ideas the same formula could mean
  welcome: false, // back after 3+ days: a warm welcome and a 3-question warm-up on the map
  reveal: false, // after the level check: known spheres light up one by one on the map
  tour: null, // { step, sphere, topic } the guided tour after the tutorial level (Tour.svelte)
  introSphere: null, // end of the tutorial level (IntroPage): the student's grade sphere glows until opened
  spotlight: false, // after the level check: the next step glows and everything else dims until it is tapped
  back: null, // { sphere, rects } the sphere that is open, so going back can fly its topics home
});
