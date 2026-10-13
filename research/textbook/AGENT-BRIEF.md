# Brief: write topic content from the official Mongolian math textbooks

You write the study content for one grade of the math app "Математикийн аялал" (Mongolian, grades 5–12).

## Source (official, public)
Ministry of Education e-content site, 2020 editions of the school textbooks. Each page is a JPG:

`https://econtent.edu.mn/content/{G}rangi/mat/pages/mat-{BOOK}-{N}.jpg`  (N = 0 … last page)

| Grade | BOOK | pages |
|---|---|---|
| 5 | 253 | 155 |
| 6 | 284 | 171 |
| 7 | 294 | 202 |
| 8 | 310 | 203 |
| 9 | 324 | 198 |
| 10 | 279 | 214 |
| 11 | 273 | 222 |
| 12 | 343 | 242 |

Page N in the file ≈ printed page N (check the printed number at the bottom). Pages 3–4 are the table of contents (ГАРЧИГ): read them first to find each topic's pages.

How to read: download pages with `curl -s -o <file> <url>` into your own folder
`C:/Users/User/AppData/Local/Temp/claude/C--Users-User-OneDrive-Desktop-omniroute-test-math-map/3119985d-aa95-4e05-83d0-073b872b47d4/scratchpad/ec/g{G}/`
then combine 2–4 pages side by side at ~760 px width each with Python PIL (`pip` PIL is installed) and open the image with the Read tool. Text is readable at that size.

If a topic is not in its grade's book, look in the grade before or after.

## Output
Write ONE file: `C:/Users/User/OneDrive/Desktop/omniroute-test/math-map/research/textbook/content-g{G}.json` (for grade 5 use `content-g5b.json`; do NOT touch `content-g5.json`). Write it with a Python script (json.dump, ensure_ascii=False, indent=1), never by pasting JSON through the shell (backslashes get mangled).

```json
{
 "_note": "Grade G, written from Математик {roman} (2020, econtent.edu.mn book {BOOK}), own wording and numbers. Draft until the owner checks it.",
 "<topic id>": {
  "def": "1–3 sentences. The textbook's definition, in clear Mongolian, same terms as the book.",
  "src": "Математик VI, х. 32–35",
  "formulas": ["key formulas, 0–4"],
  "rules": ["short rules / properties, 0–6"],
  "method": ["standard procedure as numbered steps, 0–6"],
  "examples": [ { "q": "question", "steps": ["step 1", "step 2"], "a": "answer" } ]
 }
}
```
Give every topic 2 examples (3 for big topics), each with 2–4 short steps.

## Rules (the owner's, strict)
- Mongolian, polite and plain (address the student as "та" when needed). Use the textbook's own terms.
- Own wording and OWN example numbers; do not copy the book's exercises or long passages (copyright). Facts, terms and definitions must match the book.
- Fractions: write `3/4` for numbers, or `\\frac{a}{b}` (in the Python string: "\\frac{a}{b}") for letters/expressions. The app stacks both. Never use a fraction like "1÷2" in place of a fraction.
- Decimals with a point (0.25), as the textbook does. Multiplication `·` or `×`, minus `−`, powers with superscripts (x², a³) or `^` only if needed.
- Every number in every example must be correct. Recompute each answer.
- No invented teaching tricks; only what the textbook teaches.

## Report back
Reply with: the file path, topic ids written, page ranges used, and any topic you could not find in the books.
