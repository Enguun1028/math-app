// Tiny hash router: #/, #/s/<sphere>, #/e/<entry>, #/test/<sphere>, #/start
function parse() {
  const [path, query = ''] = location.hash.replace(/^#\/?/, '').split('?');
  return { parts: path.split('/').filter(Boolean).map(decodeURIComponent), query: new URLSearchParams(query) };
}

export const route = $state(parse());

// Where the page was scrolled when the route changed: the leaving layer is pinned there (App.svelte).
export const leaving = { y: 0 };
addEventListener('hashchange', () => {
  leaving.y = scrollY;
  Object.assign(route, parse());
  // The map has its own scroller. Going back to it, the page that fades out keeps its scroll spot,
  // instead of jumping to the top while it is still visible.
  if (route.parts.length) scrollTo(0, 0);
});

export const go = (path) => (location.hash = path);
// Open a page in place of the current one, so Back skips it (e.g. a finished test).
export const replace = (path) => location.replace('#' + path);
export const back = () => (history.length > 1 ? history.back() : go('/'));
