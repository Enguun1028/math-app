// Cloudflare Pages Function: PostHog through the app's own address (/rx/...), so ad blockers that block
// posthog.com do not drop a student's visit (owner, 2026-10-20). /rx/static/* is PostHog's scripts, the rest is events.
// For PostHog US cloud, change both hosts to us.i.posthog.com and us-assets.i.posthog.com.
const API = 'eu.i.posthog.com';
const ASSETS = 'eu-assets.i.posthog.com';

export async function onRequest({ request }) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/rx/, '');
  const target = 'https://' + (path.startsWith('/static/') ? ASSETS : API) + path + url.search;
  const headers = new Headers(request.headers);
  headers.delete('cookie');
  // PostHog finds the visitor's country and city from this, as it would without the proxy.
  const ip = request.headers.get('CF-Connecting-IP');
  if (ip) headers.set('X-Forwarded-For', ip);
  return fetch(target, {
    method: request.method,
    headers,
    body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
  });
}
