"""Build the owner's review page (claude.ai artifact "Ноорог шалгах", https://claude.ai/artifact/QVSgKamPs9e112XraQUfkt)
from the search-fill and lesson drafts. Run from the repo root:
    python research/search-fill/review/build_review.py <out.html>
then publish <out.html> to the same artifact URL. Verdicts live in the artifact's db: reviews/<kind>__<id>
with {status: ok|fix|cut, note, kind, item, at}; kind = named | why | lesson."""
import glob, json, os, sys

here = os.path.dirname(os.path.abspath(__file__))
m = {c['id']: c for c in json.load(open('app/content/map.json', encoding='utf-8'))['concepts']}
order = {c: i for i, c in enumerate(m)}
named = []
for f in sorted(glob.glob('research/search-fill/named-*.json')):
    for k, v in json.load(open(f, encoding='utf-8')).items():
        if not k.startswith('_'):
            named.append({'id': k, 'title': v['name'], **{x: v.get(x) for x in ('en', 'from', 'formula', 'shown', 'def', 'example', 'proof', 'proofTitle', 'uses', 'history', 'aliases')}})
why = {}
for f in sorted(glob.glob('research/search-fill/why-*.json')):
    for k, v in json.load(open(f, encoding='utf-8')).items():
        if not k.startswith('_'):
            why[k] = {**why.get(k, {}), **v}
whyl = sorted(({'id': k, 'title': m[k]['name'], **v} for k, v in why.items()), key=lambda x: order[x['id']])


def grade(k):
    g = [int(c.split('.')[0]) for c in m[k]['codes'] if int(c.split('.')[0]) >= 5]
    return ' · 1–4' if k.startswith('b-') else f' · {min(g)}-р анги'


lessons = []
for f in sorted(glob.glob('research/lessons/storyboards-*.json')):
    for k, v in json.load(open(f, encoding='utf-8')).items():
        if not k.startswith('_'):
            lessons.append({'id': k, 'title': m[k]['name'] + grade(k), **v})
lessons.sort(key=lambda x: order[x['id']])
data = json.dumps({'named': named, 'why': whyl, 'lessons': lessons}, ensure_ascii=False).replace('</', r'<\/')
src = open(os.path.join(here, 'review-src.html'), encoding='utf-8').read()
open(sys.argv[1], 'w', encoding='utf-8').write(src.replace('__DATA__', data))
print(len(named), len(whyl), len(lessons))
