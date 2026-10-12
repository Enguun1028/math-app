// Shared UI state: previews, the tool bag, and where the map was (kept when you come back to the map).
export const ui = $state({
  preview: null, // entry id for the quick term preview
  topic: null, // topic id for the topic sheet
  tools: false,
  level: false, // the "Дутагдлаа олъё" sheet
  tool: 'numberline',
  scrollY: null, // how far the map was scrolled
  fly: null, // { sphere } or { topic } the map should scroll to when it opens
  morph: null, // { sphere, rects } screen spots of a sphere's topics, for the opening animation
  back: null, // { sphere, rects } the sphere that is open, so going back can fly its topics home
});
