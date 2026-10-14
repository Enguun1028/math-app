# Misconception sources

## geo+meas+stat+calc

Output: `misconceptions-geo-stat-calc.json`. 70 topic ids, 171 items, 66 flagged `"draft": true`. Written 2026-10-14.

How to read it: each item's general pattern comes from the source in `src`. The Mongolian wording, the worked numbers and the teacher fixes are our own summaries, and every number was recomputed. `draft: true` marks one of two cases: (a) a standard classroom error that the source supports only loosely or through a practitioner page; or (b) a topic where no specific research was found (locus, constructions, cross-sections, 3-D coordinates and vectors, dot product, geometric probability, tree diagrams, addition rule, normal distribution details, +C in integrals). Check drafts before they go into the app.

Main research sources (abstracts and summaries were read, but most full texts were not):
- Geometry and van Hiele: prototype shapes, square vs rectangle inclusion. Sources: van Hiele overview https://en.wikipedia.org/wiki/Van_Hiele_model ; Hourigan & Leavy (APMC 2015); NCTM 2016 shape-misunderstandings handout.
- Angles: judging angle size by arm length or arc radius (Mitchelmore & White 1996, MERGA; Frontiers in Psychology 2020; IJRES). Also errors from 8th-grade angle studies.
- Measurement: ruler errors such as starting at 1, counting tick marks and reading only the end point (PMC11278360; IPL; Patras). Perimeter and area confusion (NCETM Checkpoints; METU 6th-grade study). cm² to m² conversion (STEM/EEF "How I teach maths in Science"). Surface area vs volume (Battista & Clements types, cited in Sibanda & Machaba).
- Ratio and similarity: Hart's CSMS additive strategy (Cambridge Maths espresso 36). Using the length scale factor for area and volume comes only from practitioner pages (mr-mathematics).
- Pythagoras and trigonometry: applying the theorem to non-right triangles and misidentifying the hypotenuse (Radenintan al-Jabar; Pendas/UNPAS). Wrong sides and using a ratio instead of its inverse (EPISTEM CPD slides; Orhun; Illustrative Mathematics). Radians: Moore (2013); derivative rules applied in degrees (arXiv 2503.01525, 769 students, only 26.3% correct).
- Statistics: mean, median and mode errors (METU thesis; Stockholm thesis; arXiv 2004.10302). Histograms (Kaplan et al. 2014 JSE, whose four misconceptions were not verified in full text; Utrecht review; Cooper & Shore 2008). Standard deviation (delMas & Liu 2005 SERJ; Carleton activity). Association treated as causal or deterministic (Estepa & Batanero 1995).
- Probability: equiprobability, representativeness and the outcome approach (Batanero, Serrano & Garfield 1996; Cañizares & Batanero ICOTS-5). Conditional probability as confusion of the inverse and as causal or time-axis reasoning (Falk 1986 ICOTS-2; Díaz & Batanero ICME-11). Combinatorics (Batanero, Navarro-Pelayo & Godino 1997; Lamanna, Gea & Batanero 2022). Binomial: good sense of expected value, weak sense of variability (Begué et al., Tangram 2020). Normal distribution (Tauber 2001 thesis; Batanero, Tauber & Sánchez 2004).
- Calculus: concept image vs concept definition (Tall & Vinner 1981). Orton 1983 found weak ratio foundations and that students see the integral as an approximation. Tangent as a line that "touches once" and secant vs tangent (2025 paper, scindeks). Chain-rule errors (MEJ grade 12). Negative definite integrals (Bajracharya via arXiv 1903.03806; Nguyen et al. 2011). Differential equations: students expect the solution to be a number rather than a function (Rasmussen; Keene & Rasmussen). Series: shifting from terms to sums (Pythagoras journal); there is little research on this.
- Practitioner pages, not research: Mr Barton diagnostic questions (circle area, gradient), Maths Genie (bearings), Cazoom (reflection, time conversion), phys-l / IOP Spark (average speed), Oak National (reflection).

Not verified or not found: Eedi item-level data (there is no public access to their misconception pages); the Küchemann CSMS reflection findings themselves; the full texts of Ryan & Williams (2007) and the TIMSS item analyses; the specific Finnish matriculation study on vectors (its URL returned 404, so dot-product items are drafts).


## num+alg

Output: `misconceptions-num-alg.json`. 72 topic ids (every `num` and `alg` id in concepts.txt), 191 items, 52 flagged `"draft": true`. Written 2026-10-14/15.

How to read it: `src` is the source that documents the error pattern or error category. Mongolian wording, numbers and fixes are our own, and every number was recomputed. `draft: true` means the specific error is a well-known classroom error but the cited source supports only the general category or is a practitioner page.

Sources, one line each ("verified" = the page or PDF text was opened; "abstract" = only the abstract or a search summary was seen):
- Mathematics Assessment Project (Shell Centre/Berkeley) formative lessons, map.mathshell.org/lessons.php?unit=NNNN: the "Common issues" tables in the teacher guides were extracted with pdftotext (verified). Units: 6105 algorithms/carrying, 6110 GCF vs LCM, 6120 fraction/decimal/percent (33% = 1/3), 6125 directed numbers, 6220 laws of arithmetic (distributive law, squaring = ×2), 6225 subtraction treated as commutative / inequality vs equality, 7100 percent change, 7105 negatives in context, 7210 and 7215 additive proportion strategies and misuse of cross-multiplication, 8100 scientific notation, 8105 repeating decimals and ×10, 8110 laws of exponents (2³ = 6, a⁰ = 0, 7⁻¹), 8215 slope and proportionality vs linearity, 8220 systems (2 × 0 + 3 = 5), 8225 graph as picture, 8230 axis scale, 8240 and 8245 linear equations and the equal sign, 9105 rational/irrational, 9115 radicals, 9200 and 9230 patterns, 9210 −x² vs (−x)² and non-factorable means no solution, 9215 different operations applied to each side, 9225 (n + 3)² = n² + 3², 2(n + 3) = 2n + 3, (5n)² = 5n², 9235 letter as object, 9240 simple vs compound interest, 9245 parabola forms, 9250 sign errors when expanding, 9260 graph repertoire, 9270 root/factor signs.
- NCETM "Misconceptions with the Key Objectives" (.doc, 2003), converted with antiword (verified): place value, zeros, subtraction, ordering negatives, remainders, word-problem operation choice, decimals (point placement, reading 3.09), Ryan & Williams' "common additive misconception" in ratio.
- Eedi blog "What do 4 million students' responses tell us…" (verified): squaring vs ×2, x/y coordinate swap, subtracting smaller from larger, factor/multiple → prime → "1 is prime" chain.
- Steinle & Stacey, Melbourne Learning Decimals project incidence page (verified): longer-is-larger 26% overall (46% Year 5, 5% Year 10) and shorter-is-larger.
- NFER Assessment Hub, adding fractions (abstract): adding numerators and denominators even with equal denominators.
- STACK documentation "Buggy rules" (verified): (a+b)^n → a^n + b^n; mediant fraction addition.
- Knuth, Stephens, McNeil & Alibali 2006, JRME, "Does understanding the equal sign matter?" (abstract): operational vs relational equal sign.
- Christou & Prokopou 2020, refutational text and "multiplication makes bigger" (abstract).
- Order of operations: Univ. of Johannesburg conference paper on 80 preservice teachers and PEMDAS (abstract).
- Horne 2008, fraction number-line tasks (abstract): counting marks instead of intervals.
- Mr Barton probing questions on rounding to s.f. and d.p. (search summary): 3.45 chain rounding. NZCER ARBS "Rounding numbers sensibly" (abstract).
- NTNU thesis on negative numbers in Grade 4 (abstract): "a larger number cannot be taken from a smaller one".
- Undikma, fourth-grade LCM study (abstract): LCM = product.
- HCMUE journal, divisibility-rule misperceptions (abstract only; used only for draft items).
- Springer ESM BF00302628, Venn diagrams and set expressions (abstract); CPALMS standard 15816, set-operation errors (search summary).
- Zazkis & Sirotic 2004, PME28 (abstract): irrational numbers, reliance on calculators and decimals.
- Altarawneh & Alkhateeb 2024, J. Curriculum Studies Research (verified abstract): removing |·| bars, bars treated as parentheses.
- Jordan (JJES) study of inequality errors (abstract): not reversing the sign when multiplying or dividing by a negative. NIE Singapore (Hng) quadratic-inequality errors (abstract).
- Leinhardt, Zaslavsky & Stein 1990, RER (citation only); Hattikudur et al. 2012 (abstract): slope/height confusion, graph as picture.
- Journal on Mathematics Education 2024 (DOAJ), conjoining and cancellation errors (abstract); UWC thesis on Grade 9 algebraic fractions, where cancellation was the most frequent error (abstract).
- Chua & Wood 2005, The Mathematics Educator 8(2) (abstract): log errors come from over-generalising algebra rules.
- Univ. of Bahrain journal (2016), complex-number errors, √(−1) rule misuse (abstract).
- Common Core HSN-VM.C.9 (verified): matrix multiplication is not commutative. arXiv 2411.03332, citing Aygor & Ozdag 2012 (search summary): det(kA) = k det A. UNP Kediri, inverse-matrix errors (abstract).
- Lestyanto et al. 2022, Atlantis Press, mathematical induction (verified intro): procedural focus, difficulty with P(k+1). Aksioma 2022 (DOAJ): the meaning of n, always starting at n = 1 (abstract).
- MEI AS scheme of work, binomial expansion (search summary): raising only part of a term to the power. RevisionDojo IB binomial blog (practitioner).
- Coolmath rational-function tutorial (practitioner): graphs can cross horizontal asymptotes. Maulyda & Khairunnisa 2019, MaPan (abstract): vertical asymptote and hole errors.
- Paper-folding study, arXiv 1009.5524 (abstract): linear thinking about exponential growth. UNH honors thesis 902 (abstract): exponential vs quadratic confusion.
- UNPAS Pendas textbook analysis of exponent misconceptions (abstract): zero, negative and fractional exponents.
- Nepal (NepJOL) percentage word problems (abstract): recovering original values. Greek undergraduate percent study (pergamos) was reviewed but not cited.
- arXiv 2509.19357 "inverse function fallacy" (abstract): defaulting to the positive root. EJMSTE, preservice teacher and inverse/composite functions (abstract; draft use only).
- Mr Mathematics GCSE sequences page (search summary only; the page returned 403): n + 3 instead of 3n − 2, and arⁿ instead of arⁿ⁻¹. PGMI UIN Sumatera Utara arithmetic-series study (abstract).
- ICSAT (UNM) quadratic-equation errors including the zero-product property (search summary only).
- justinmath.com Q&A on "false linearity" error clusters (practitioner).

Not found or not verified: Hart CSMS ratio results and Küchemann's letter categories in primary form; Booth (1988); Eedi item-level misconception data (no public pages); Brown & Burton 1978 full text; Mongolian teacher sources on misconceptions (none found); any study specifically on losing the root x = 0 by dividing by x, sign errors in the remainder theorem, f⁻¹ = 1/f, det(A + B), or geometric-progression formula errors. Those items are marked draft.
