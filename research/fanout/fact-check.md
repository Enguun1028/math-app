# Fact-check: real-world, stories, content-basics, content-gaps (2026-10-15)

Wave 3. I checked the four files but did not edit them. I opened every Wikipedia and news `src` URL in real-world.json and stories.json; the UNDP page returned 403. I recomputed **291 math answers** with Python (`scratchpad/fanout/factcheck/check.py`): every mini in real-world.json, every example in content-basics.json and content-gaps.json, and every number and quiz in stories.json. **None of the math is wrong.** The problems are in facts and wording.

## Wrong or needs a fix (top)

| file | id / slide | claim | verdict | correct value + URL |
|---|---|---|---|---|
| stories.json | mongol-math-today[5] | The team's best result came in 2021, 11th place | **wrong** | The best rank is **8th (1964)**. Mongolia was also 9th in 1965, 1966 and 1969, and 10th in 1984. 11th in 2021 is the best since 1984. The highest team score is **174 in 2025** (18th place). https://www.imo-official.org/results/team/country/MNG/ |
| real-world.json | trig-tri[0] | The text says the river is measured with the **sine** theorem | **wrong (wording)** | The mini uses the **cosine** theorem (c² = a² + b² − 2ab·cos C). The answer c = 7 is right. Change the text to «косинусын теорем». |
| real-world.json | slope[0] | A 1 : 12 ramp to 0.5 m is «6 м урт» | **wrong (wording)** | 0.5 × 12 = 6 m is the horizontal run. The ramp itself is √(6² + 0.5²) ≈ 6.02 m. Say «хэвтээ зай 6 м». The 1 : 12 rule is ok: https://en.wikipedia.org/wiki/Wheelchair_ramp |
| real-world.json | exp-fn[0] | C-14 half-life ≈ 5,730 years | **wrong vs src** | The src gives **5,700 ± 30 years**. 5,730 is the older value. https://en.wikipedia.org/wiki/Carbon-14 (the math 12.5 g is ok) |
| real-world.json | pct[3] | Bus fare was 500₮ from 2014 | **ok, but wrong src** | The gogo.mn page has only the headline and no history. The 500₮ fare set in 2014 is confirmed at https://ikon.mn/n/3b7q. Change the src to that page. |
| real-world.json | b-place, round[0], sci[0], data[2] | Population 3,544,835 (end of 2024) | **unverified** | The src (en.wikipedia Mongolia) now shows **3,591,120 (2025 estimate)**. The NSO average for 2024 is 3,534,503 (https://en.wikipedia.org/wiki/Demographics_of_Mongolia). I found no source for 3,544,835. Use an NSO figure with a 1212.mn link, or change to 3,591,120 (2025). |
| real-world.json | pct[2] | Mongolia supplies 40% of world raw cashmere (UNDP, 2021) | **unverified** | The UNDP page returns 403, so I could not check it. Other sources give 40% (Gobi, 2018), 48% (Montsame 2019, https://akipress.com/news:621176:Mongolia_produces_48__of_total_raw_cashmere_in_world) and about 50%. Write «40–50% орчим» or get a working source. |
| stories.json | maragheh[5] | The Tusi couple «appears in Copernicus's work» | **soften** | The src says similar models appear in *De revolutionibus*, but how they reached Copernicus is unproven. Write «Коперникийн бүтээлд маш төстэй загвар бий». https://en.wikipedia.org/wiki/Tusi_couple |
| stories.json | myangat[3] | More than 10 formulas | **ok, but sources differ** | The Minggatu article says «more than 10». The series article says 3 + 6 = 9. The 30 years is confirmed by the series article (it is not in the Minggatu article). https://en.wikipedia.org/wiki/Ming_Antu%27s_infinite_series_expansion_of_trigonometric_functions |
| stories.json | proof-story[2] | Loomis 1940, Garfield 1876 | **partly unverified at src** | The src confirms 370 proofs and that Garfield published before he became president. The years 1940 and 1876 are not on that page. |
| stories.json | mongol-numbers[2] | түм, бум, сая | **unverified** (already flagged) | en.wikipedia lists the forms түмт, бумт, саят and тэрбум. Check them against a dictionary or the textbook. |
| real-world.json | int[0], units[1] | Khövsgöl is 262 m deep | **ok, with a note** | The src article text says 262 m, but its infobox says **267 m**. The 1,645 m elevation is ok. https://en.wikipedia.org/wiki/Lake_Kh%C3%B6vsg%C3%B6l |

## Verified ok

| file | id / slide | claim | verdict | source |
|---|---|---|---|---|
| real-world | circle[0], circle-meas[0], units[0] | Large 5-khana ger: diameter 5.8 m, тооно 150 cm, унь 2.4 m | ok | https://mn.wikipedia.org/wiki/Гэр («Голч: 5,8м», «Тооно 150см, унь 2,4м») |
| real-world | b-add, frac[1], charts[0], sector[0], data[0] | 57.6 M livestock in 2024, down 10.9%; sheep 24.5 M, goats 22.9 M, cattle 5.1 M, horses 4.7 M | ok | NSO PDF (16 Jan 2025): total 57,647.9 thousand, −10.9% |
| real-world | b-neg, dec[1], int[1], int-ops[0], func[0], spread[0], trig-fn[1], average[1], time[0] | UB normals: Jan −21.3, Feb −16.2, Jul 19.0, annual mean 0.2 °C; record low −43.9 °C; UTC+8 | ok | https://en.wikipedia.org/wiki/Ulaanbaatar |
| real-world | b-time, lin-eq[1] | 1000₮ from 1 Jan 2025, 4 rides a day | ok | https://ikon.mn/n/3beg |
| real-world | speed[2], geo-prob[1] | Archery: men 75 m, women 60 m | ok | https://ikon.mn/n/36vs. mn.wikipedia gives 65 m for women, and the author already noted this. |
| real-world | int[0], int-ops[1], data[2] | Khüiten 4,374 m; area 1,564,116 km²; most sparsely populated | ok | https://en.wikipedia.org/wiki/Mongolia |
| real-world | similar[0] | Chinggis statue 40 m | ok | https://giantkhanstatue.com/en/ («about 40 m tall») |
| real-world | pct[1], pct-app[2] | VAT 10% | ok | PwC tax summaries |
| real-world | pct-app[0] | Policy rate 12% in 2025 | ok | Mongolbank MPS, 16 Sep 2025: «unchanged at 12 percent» |
| real-world | sci[1], real[0], log[0], log[2], trig-fn[0], power-fn[0], poly-div[0], prime[0] | 1 au ≈ 1.496×10⁸ km (499 s); A4 297/210 ≈ √2; Richter ×10 per unit; pH ×10; Mongolia 50 Hz; braking ∝ v²; CRC uses a remainder; RSA uses factoring | ok | the Wikipedia src in each item |
| stories | myangat[0,1,2,4,5,6] | c.1692–1763; Plain White Banner; 1713 student; observatory 1724–1759; administrator 1760–1763; Jartoux 1701, 3 series (Newton, Gregory); son finished the book; Catalan 1730s, Euler 1751; asteroid 28242 named 2002 | ok | https://en.wikipedia.org/wiki/Minggatu, https://en.wikipedia.org/wiki/Catalan_number |
| stories | mongol-math-today[3,4] | IMO since 1964: 9 gold, 37 silver, 87 bronze, 57 HM; first gold 1997; golds in 2019, 2020, 2021 (×2), 2023, 2024, 2025 | ok | imo-official.org. The page includes IMO 2026, where Mongolia won no gold. The slide leaves out the 2012 gold; this is fine because it says «сүүлийн жилүүдэд». |
| stories | mongol-math-today[0,1,2] | NUM 1942; L. Shagdar PhD 1954 at Lomonosov MSU; Institute 1974; Society 1995 | ok | IMU application PDF (2022) |
| stories | maragheh[0–4,6] | Tusi 1201–1274; Alamut 1256; saved libraries; Maragheh begun 1259; quadrant, armillary sphere, Chinese astronomer; Zij-i Ilkhani 1272; trigonometry as its own discipline; Guo Shoujing 365.2425 in 1280 | ok | the Wikipedia pages for Tusi, the Maragheh observatory and Guo Shoujing |
| stories | pow-story[0–4] | Ibn Khallikan 1256; 2⁶³ and 2⁶⁴ − 1 exact; 2³² − 1 grains ≈ 279 t; 65 mg grain → ≈ 1.199×10¹² t; 842 Mt wheat (2025/26); over 1,400× (1,424) | ok | https://en.wikipedia.org/wiki/Wheat_and_chessboard_problem |
| stories | pi-story[1–6] | Archimedes 96-gon, 223/71 < π < 22/7; Zu Chongzhi 429–500 with bounds and 355/113, record held about 900 years; Madhava 11 decimals; 314×10¹² digits on 23 Nov 2025; Pi Day 14 March | ok | the Wikipedia src in each slide |
| stories | log-story[1,3–6] | Napier 1550–1617, 1614 book with 90 pages of tables; Briggs visits 1616 and 1617, 1617 table 1–1000 to 14 digits, 1624 table of 30,000 numbers; Kepler; Oughtred c.1622 | ok | the Wikipedia src in each slide |
| stories | geo-formulas[1,2,4,5,6], proof-story[1,3,5,6] | Rhind c.1550 BC, Ahmes, d = 9 gives 64, 256/81; Moscow papyrus problem 14; sphere is 2/3 of the cylinder, and Archimedes wanted it on his tomb; Zu Chongzhi and Zu Geng in the 5th c.; Elements c.300 BC in 13 books, printed 1482, second only to the Bible; YBC 7289 c.1800–1600 BC = 1.41421296 | ok | the Wikipedia src in each slide |
| stories | mongol-numbers[0,4,5] | Numerals from Tibetan, still on banknotes; suanpan has 2 beads above and 5 below (values 5 and 1), first record 2nd c. BC; Guo Shoujing used zhusuan | ok | the Mongolian numerals and Suanpan pages on Wikipedia |
| all four | every mini, example and quiz | 291 recomputed answers | ok | Python check |
