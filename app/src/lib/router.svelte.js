// Tiny hash router: #/, #/s/<sphere>, #/e/<entry>, #/test/<sphere>, #/start
function parse() {
  const [path, query = ''] = location.hash.replace(/^#\/?/, '').split('?');
  return { parts: path.split('/').filter(Boolean).map(decodeURIComponent), query: new URLSearchParams(query) };
}

export const route = $state(parse());

addEventListener('hashchange', () => {
  Object.assign(route, parse());
  scrollTo(0, 0);
});

export const go = (path) => (location.hash = path);
// Open a page in place of the current one, so Back skips it (e.g. a finished test).
export const replace = (path) => location.replace('#' + path);
export const back = () => (history.length > 1 ? history.back() : go('/'));
