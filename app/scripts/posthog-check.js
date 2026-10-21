// "Check my data" in one step (owner, 2026-10-21). Not part of the app build.
// Paste the whole file into the console of a signed-in eu.posthog.com tab (Claude runs it through Chrome).
// Returns one plain line per real visitor (Ulaanbaatar time), plus question, search, speed and report totals.
// Skips test traffic and the Facebook link-preview bot. The output has no "=", "&" or "?", since Chrome's
// tool output filter blocks text that looks like a URL query.
(async (days = 7) => {
  const csrf = document.cookie.match(/posthog_csrftoken=([^;]+)/)?.[1];
  const q = async (sql) => {
    const r = await fetch('/api/projects/313482/query/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrf },
      body: JSON.stringify({ query: { kind: 'HogQLQuery', query: sql } }),
    });
    const j = await r.json();
    if (!j.results) throw new Error(j.detail);
    return j.results;
  };
  const real = `timestamp > now() - interval ${days} day
    and properties.$host = 'matematikiin-ayalal.pages.dev'
    and coalesce(properties.utm_source, '') != 'claude_test'
    and coalesce(properties.$geoip_city_name, '') != 'Prineville'`;
  const clean = (s) => String(s ?? '').replace(/[=&?]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60);
  const ub = (t) => new Date(t * 1000).toLocaleString('en-GB', { timeZone: 'Asia/Ulaanbaatar', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  // One row per visitor: when, how long, device, place, source, and the steps that matter.
  const rows = await q(`select distinct_id, toUnixTimestamp(min(timestamp)), dateDiff('second', min(timestamp), max(timestamp)),
      any(properties.$device_type), any(properties.$os), any(properties.$geoip_city_name), any(properties.$referring_domain),
      countIf(event = 'question_answered'), countIf(event = 'question_answered' and toString(properties.correct) = 'true'),
      countIf(event = 'level_check_finished'), countIf(event = 'level_round'), countIf(event = 'topic_opened'),
      countIf(event = 'searched'), countIf(event = 'tool_opened'), countIf(event = 'problem_reported'),
      round(max(toFloat(properties.$web_vitals_INP_value))), uniq(properties.$session_id)
    from events where ${real} group by distinct_id order by min(timestamp)`);
  const visitors = rows.map(([id, t, secs, dev, os, city, ref, qa, ok, lcf, rounds, topics, searches, tools, reports, inp, sessions]) =>
    `${ub(t)} | ${clean(id).slice(-4)} | ${secs}s, ${sessions} visit(s) | ${dev} ${os} ${city ?? '?'} | from ${clean(ref)} | ` +
    `answers ${ok}/${qa} right, level rounds ${rounds}, finished check ${lcf}, topics ${topics}, searches ${searches}, tools ${tools}, reports ${reports}` +
    (inp ? ` | slowest tap ${inp} ms` : ''));

  // PostHog stores choice as a number, so a 'dont_know' tap reads as null here.
  const worst = await q(`select properties.question, count() n, countIf(toString(properties.correct) = 'true') ok, countIf(toInt(properties.choice) is null) idk
    from events where ${real} and event = 'question_answered' and toInt(properties.attempt) = 1
    group by properties.question order by ok / n, n desc limit 8`);
  const empty = await q(`select properties.query, count() from events where ${real} and event = 'searched' and toInt(properties.results) = 0
    group by properties.query order by count() desc limit 10`);
  const reports = await q(`select toUnixTimestamp(timestamp), properties.kind, properties.message, properties.question
    from events where ${real} and event = 'problem_reported' order by timestamp desc limit 10`);
  const errors = await q(`select properties.$exception_types, count() from events where ${real} and event = '$exception' group by properties.$exception_types`);

  return JSON.stringify({
    days,
    visitors,
    worst_questions: worst.map(([qq, n, ok, idk]) => `${ok}/${n} right, ${idk} dont_know: ${clean(qq)}`),
    empty_searches: empty.map(([s, n]) => `${n}x ${clean(s)}`),
    reports: reports.map(([t, k, m, qq]) => `${ub(t)} ${k}: ${clean(m)} [${clean(qq)}]`),
    errors: errors.map(([e, n]) => `${n}x ${clean(e)}`),
  });
})();
