# Mongolian school math curriculum, grades 1–12 (2019 edition)

This folder holds the official math learning objectives, read from the government curriculum books. It is the ground truth for the new concept map: every "taught in grade N" claim in the app should point to a code here.

## Sources

All three books: Ministry of Education, Culture, Science and Sports, Institute of Education, Ulaanbaatar 2019, "improved second edition" (сайжруулсан хоёр дахь хэвлэл). The math part of each book was written by a team led by М.Итгэл (2014/2015 core curriculum) and revised in 2019.

| Band | Book | Pages | Math section (book pages) | Copy used |
|---|---|---|---|---|
| Grades 1–5 | Бага боловсролын сургалтын хөтөлбөр | 104 | 27–36 (objectives 30–35) | https://cdn.greensoft.mn/uploads/users/2649/files/Curriculum/EBS/Baga.pdf |
| Grades 6–9 | Суурь боловсролын сургалтын хөтөлбөр | 168 | 31–46 (objectives 33–44) | https://cdn.greensoft.mn/uploads/users/2649/files/Curriculum/EBS/Suuri.pdf |
| Grades 10–12 | Бүрэн дунд боловсролын сургалтын хөтөлбөр (A/492, 2019-08-01, appendix 3) | 298 | 27–38 (objectives 28–38) | https://cdn.greensoft.mn/uploads/users/2649/files/Curriculum/EBS/Akhlakh.pdf |

The official pages that list these books: https://moe.gov.mn/curriculum-suuri and https://moe.gov.mn/curriculum-buren-dund. The PDFs have no usable Cyrillic text layer, so the pages were rendered to images and read by eye.

## Files

- `mn-2019-objectives.tsv`: one row per objective. Columns:
  - `grade`: 1–12
  - `code`: the book's own code, e.g. `8.6г`
  - `strand`: the book's strand heading for that grade. For grades 6–9 the strand was assigned from the section topic, not copied from a heading, so treat it as approximate.
  - `elective`: `*` when the book marks it as for students who chose the extended (сонгон) program; grades 10–12 only
  - `summary`: a short English summary written by Claude, not the official wording
  - `book_page`: printed page number in the book. For grades 6–8 only the range 33–42 was recorded.

## Status

- `alignmentStatus: reviewed`. Claude (AI) read every objective from the rendered pages on 2026-10-13 and wrote the summaries. No person has checked them yet. Before any grade claim is shown as "verified" in the app, a person should compare the row with the book page.
- The curriculum is under revision (a newer edition may exist after 2023). This file is the 2019 version only.

## Things worth knowing for the concept map

- Fractions start in grade 2 (halves and quarters of a strip, 2.1в) and grade 3 (unit fractions, same-denominator addition, 3.1г, 3.1и). Negative numbers start in grade 3 with the thermometer (3.1в).
- Pythagoras is grade 8 (8.6г) and again grade 9 with right-triangle trig ratios (9.6в).
- y = ax² graphs from a table: grade 8 (8.5е). Quadratic function properties: grade 9 (9.5г) and grade 10 (10.3б).
- Quadratic equations by factoring: grade 9 (9.4д). Completing the square and the formula: grade 10 (10.5б).
- Vectors start in grade 9 (9.7д). Matrices start in grade 10 (10.4). Derivatives: grade 11 (11.9). Integrals: grade 11 (11.10). Complex numbers: grade 12 (12.4).
