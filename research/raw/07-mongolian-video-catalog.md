# 07 — Mongolian-language math video catalog (YouTube + econtent.edu.mn)

Researched 2026-09-28. Method: YouTube search results pages fetched with curl (`ytInitialData` parsed for videoId / title / channel / length / age / views), channel pages for subscriber counts, then **every video ID below checked with YouTube oEmbed** (`https://www.youtube.com/oembed?url=...watch?v=ID`).

**Verification legend**
- **V** = verified 2026-09-28: the URL resolves, oEmbed returned HTTP 200, and the title and channel match the listing. oEmbed returns 401 when the owner has turned embedding off, so a 200 also means embedding was on at check time. All 160 IDs checked came back 200. None was blocked.
- Lengths, ages and view counts come from the YouTube search page on the check date. Ages are approximate ("5 жилийн өмнө" means about 2021).
- **Fit** was judged from the title, length, channel style and view count only. **No video was watched.** Before any video goes live in the app, a person should spend a minute on it to check audio, handwriting and correctness.

**Caution: auto-translated titles.** YouTube shows many English videos (Math Antics, Khan Academy EN, Cognito, 1st Class Maths, GoTutor, Math with Mr. J, Professor Dave and others) with **machine-translated Mongolian titles**, but the audio is still English. They were all left out. The catalog below lists only channels that were confirmed Mongolian. Three channels that look Mongolian by name turned out to be foreign and were also left out: `@tele_math` ("telemath", Pakistani, English), `@EcontentforSchool` (Assamese), and `@litmaths` ("LIT Maths", Indian reasoning content). The search found **no YouTube channel for the Mongolian "LIT" tutoring brand**.

---

## 1. Channels

| Channel | URL | Subs (Sep 2026) | Style / typical length | Quality notes | ЭЕШ-focused? |
|---|---|---|---|---|---|
| **Авирмэдийн Бямбаа (Byambaa)** | https://www.youtube.com/@byambaa | 15K | One concept per video, "X гэж юу вэ?" format, **1–8 min**. Screen and tablet, calm voice. | **Best fit for catching up.** Short and conceptual, covering arithmetic through functions and sequences. Mostly 3–5 years old. Also has a newer Cambridge Statistics series. | No, concept-first |
| **KhanAcademyMongolian** | https://www.youtube.com/@khanacademymongolian | 28.5K | Khan Academy videos dubbed into Mongolian on a blackboard, **1–12 min** | Huge back-catalogue from 2015–16, covering grades 1–10 arithmetic, fractions, negatives, geometry and probability. Dubbing quality varies. Khan content is CC BY-NC-SA, so linking and embedding are fine. Low views on many videos. | No |
| **iMath математик сургалтын систем (8x100)** | https://www.youtube.com/@iMathx | 9.2K | "Суртлаа давт №…" micro-reviews of **1–7 min**, plus some long 12–60 min lessons | Tutoring centre (iMath / 8x100). Clean, short and recent (2023–26). Coverage runs from 3rd-grade column arithmetic to Bayes. Good for revision clips. | Partly (promotes 800-point ЭЕШ results) |
| **Математикийн 6000 тест** | https://www.youtube.com/@6000 | 44.2K (largest pure-math MN channel) | Worked solutions to the "6000 тест" book and textbook exercises, **10–80 min** | Rigorous, but long and handwritten, aimed at test-takers. Use as the "deeper practice" link, not the first explanation. | **Yes** |
| **chadna. mn** | https://www.youtube.com/@chadnamn | 15.6K | Numbered "Математик цуврал №…" series, **3–20 min** | Clear algebra series covering inequalities, linear systems, quadratic equations, progressions and Pythagoras. About 6–7 years old, but still highly viewed (up to 40K). | Partly |
| **Мянгат** | https://www.youtube.com/@Мянгат | 17.9K | Topic lessons of **6–20 min** plus long ЭЕШ livestreams (35–100 min) | Strong for grades 10–12: probability, trig, derivatives, integrals. | **Yes** (ЭЕШ series) |
| **Нийслэлийн ЕБ-ийн лаборатори 14-р сургууль** | https://www.youtube.com/@-14-76 | 5.8K | Classroom-style teacher lessons, **6–24 min** (2020–21 distance-learning era) | Solid teacher-led lessons for grades 4–11. | No |
| **МУБИС-ЕБС** (the university's lab school) | https://www.youtube.com/@user-ug1wt4lk9c | 3.1K | 2020 distance lessons, **10–25 min**, labelled by grade and date | Follows the national curriculum closely, with a grade label in every title. | No |
| **Oxyzco** | https://www.youtube.com/@Oxyzco | 1K | Animated or slide geometry, **1–8 min** | Neat short geometry clips: lines and angles, triangle angle sum, polygons, the coordinate plane. | No |
| **Udval Altankhuu** (two channels: @udvalaltankhuu3111 and @udvalaltankhuu1743) | https://www.youtube.com/@udvalaltankhuu3111 | ~0.3K | Teacher board lessons, **2–15 min** | Useful mid-length lessons: divisibility, combinatorics, linear functions, quadratic equations. | No |
| **ETV** (national TV, теле хичээл uploads) | https://www.youtube.com/@ETVTELEVISION | 65K | 2020 national "теле хичээл" broadcasts, **17–23 min** | Official curriculum TV lessons. Math is scattered among other subjects and hard to search. | No |
| **Edutainment TV / Боловсрол ТВ** | https://www.youtube.com/@EdutainmentTVofficial | 392K | Mostly shows. A few 2020 теле хичээл uploads. | Not a math source now. | No |
| **ШИНЭ МОНГОЛ ХАРҮМАФҮЖИ сургууль** | (search "[Цахим хичээл] Математик") | — | "[Цахим хичээл]" school e-lessons, **8–14 min** | Good 11th-grade limit and derivative intros. Grade-6 algebra video has 42K views. | No |
| Бага боловсролын математик (@Nomiobagsh) | https://www.youtube.com/@Nomiobagsh | 1.2K | Primary-grade, **5 min** | Primary-grade only. | No |
| Оюунлаг сургууль (@oyunlag-edu-mn) | https://www.youtube.com/@oyunlag-edu-mn | 2K | **5–11 min** | Volumes and integral applications. | No |
| Өлзий багш (@Ulziibagsh) | https://www.youtube.com/@Ulziibagsh | 0.5K | **1–12 min**, recent (2024–25) | Circle topics. | No |
| batdorj yundendorj | https://www.youtube.com/@batdorjyundendorj1497 | 0.9K | **7–15 min** | Derivative rules, increasing and decreasing functions, inscribed angles. | Partly |
| Математик ЕБС | https://www.youtube.com/@МатематикЕБС | 0.7K | 12th-grade calculus, **13–36 min** | Chain-rule and implicit derivatives. Long. | Partly |
| MMind (@mmindstemprogrammmindstem8469) | — | tiny | 1-min student clips | **Not usable**: student presentations, not lessons. | — |

### Government platform: econtent.edu.mn (and medle.mn)
- **econtent.edu.mn** is run by the Ministry of Education (БМТТ). It hosts every "Теле хичээл" from 2020–21, by grade and subject, **free**. Math pages: `https://econtent.edu.mn/lessons/EBS/{N}rangi/mat`, where N = 1…12 (for example https://econtent.edu.mn/lessons/EBS/8rangi/mat). The videos are **self-hosted MP4s** (`cdn.esis.edu.mn/...mp4`) that open in a colorbox player, **not YouTube**. There are no per-lesson URLs, only the grade page with a dated list of lessons. **Link to the grade page and name the lesson.** Do not hot-link or embed the MP4s, because no licence is stated. Lessons are about 17–25 min, teacher on screen, and follow the curriculum. Grade counts on the home page: 181 (1st grade) up to 274 (6th grade) теле лессонs across all subjects.
- The site links to the ESIS YouTube channel (https://www.youtube.com/channel/UCtFHcwK83Iha9qmHr6Xm1HQ, 14.7K subscribers). Its math coverage was not checked.
- **medle.mn** is the newer ministry learning platform, linked from econtent as "Medle.mn шинэ". It is a Next.js single-page app and its content cannot be read without a browser, so it was **not catalogued**. Worth a manual look.

Selected econtent math lessons that map to our topics (grade → lesson title):
- 3rd grade: Тэнцэтгэл, тэнцэтгэл биш; Мэдэгдэхгүй байгаа гишүүнийг олох; Тоог 10, 100-аар үржүүлэх, хуваах
- 4th grade: Эерэг сөрөг тоог жиших; Холимог бутархай (3 lessons); Өнцгийг хэмжих; Баганан диаграмм
- 5th grade: **Тоон шулуун**; Тооны 2,4,5,10…-д хуваагдах шинж; Олон оронтой тооны үржүүлэх ба хуваах; Аравтын бутархай (6 lessons); Энгийн бутархайг нэмэх, хасах; Процент; Гурвалжныг ангилах; Эзэлхүүнийг олох; Арифметик дундаж, далайц; Тэгшитгэл, тэнцэтгэл биш; Боломжийн тоог тооцоолох
- 6th grade: **Тооны орны утга, тоог жиших, тоймлох**; Харьцаа, пропорц; Аравтын ба энгийн бутархай, процент; Тэгш өнцөгтийн талбай, периметр; Тэгш өнцөгт координатын хавтгай; Үзэгдлийн магадлал; Олон өнцөгтүүд
- 7th grade: Алгебрын илэрхийлэл; Шугаман функц, түүний график; Шулууны тэгшитгэл бичих; Эсрэг үзэгдлийн магадлал; Дараалал
- 8th grade: Пифагорын теорем; Төсөөтэй гурвалжнууд; Тойргийн урт ба дугуйн талбай; Төв өнцөг, тойрогт багтсан өнцөг; Шугаман тэгшитгэлийн системийг графикийн аргаар; Нэг ба олон гишүүнт; Эгэл үзэгдлийн магадлал; Олон өнцөгтийн дотоод өнцгүүдийн нийлбэр
- 9th grade: Квадрат функцийн график; Тригонометр харьцаа; Хоёр хувьсагчтай тэгшитгэлийн систем; Шугаман функцийн урвуу функц; Статистик диаграмм, гистограмм
- 10th grade: Олон гишүүнтийг үржигдэхүүн болгон задлах; y=ka^x функцийн график; Комбинаторик; Синус косинусын теорем
- 11th grade: Нэгж радиустай тойрог ба тригонометр функц; Арифметик ба геометр прогресс; Уламжлал; Уламжлалын хэрэглээ; Тодорхой интеграл; Эргэлтийн биетийн эзлэхүүн; Стандарт хазайлт; Функцийн хувиргалт
- 12th grade: Уламжлал; Интеграл; Интегралын хэрэглээ; Уламжлалын хэрэглээ; Функц ба график

---

## 2. Per-topic candidates

Format: **title** — channel — URL — length — grade — fit note — status. The first entry in each topic is the recommended pick.

### n1 Байрын утга ба тоо (place value)
1. **"Аравт ба нэгжийн орон"** (2nd-grade math) — Huuruh Tavtsan — https://www.youtube.com/watch?v=Y9_vJSEN8QI — 9:18 — 2nd grade — Clear, but pitched at young children. — V
2. **Тоог аравт зуут мянгатаар тоймлох** — Бага боловсролын математик — https://www.youtube.com/watch?v=PX4hbmR2n7w — 5:31 — 3rd–4th grade — Rounding by place, 87K views. — V
3. **"Аравт нэгж" нэрлэх, нийлбэрт задлах** — BU SecondSchool — https://www.youtube.com/watch?v=uZzTh0mnD8I — 8:34 — 1st grade — Very basic. — V
- econtent: 6th grade "Тооны орны утга, тоог жиших, тоймлох" is the only teen-level option.
- **GAP:** no teen-appropriate short video on place value (large numbers, decimal places).

### n2 Нэмэх ба хасах
1. **Олон оронтой тооны нэмэх үйлдлийг орны нэмэгдэхүүнээр задалж гүйцэтгэх** — iMath — https://www.youtube.com/watch?v=Dxt-Jf2ZY8Y — 3:13 — 3rd–5th grade — Short, method-focused. — V
2. **Суртлаа давт №110 | Гурван оронтой тоог баганан бичиглэлээр хасах** — iMath — https://www.youtube.com/watch?v=lzEATSVQP8o — 1:59 — 3rd grade — Column subtraction with borrowing. — V
3. **100 дотор нэмэх, хасах** — misheel Yundenbat — https://www.youtube.com/watch?v=sC3FwrpeMD4 — 14:03 — 2nd grade — Long, for young children. — V

### n3 Үржих ба хуваах
1. **5р ангийн олон оронтой тоо үржих хуваах** — Hamtdaa bodiyo — https://www.youtube.com/watch?v=pWoHmQo_Af0 — 13:40 — 5th grade — Covers both operations. — V
2. **Баганан бичлэгээр хуваах үйлдэл хийх** — Навчаа Цэрэндорж — https://www.youtube.com/watch?v=73_Sx7KSAq8 — 1:31 — 4th–5th grade — Very short long-division demo, 48K views. — V
3. **Хоёр оронтой тоог хоёр оронтой тоогоор үржүүлэх** — KhanAcademyMongolian — https://www.youtube.com/watch?v=8blF1-hX5_E — 4:25 — 4th grade — V
- Alternative: **Хуваах үйлдэл 4 р анги** — Болортуяа Бадамдоо — https://www.youtube.com/watch?v=ZrLySfgj2UI — 4:20 — V

### n9 Сөрөг тоо
1. **Эерэг сөрөг тооны нэмэх, хасах үйлдэл** — Amartuvshin Deleg — https://www.youtube.com/watch?v=wlnYtVD-pv8 — 4:37 — 6th grade — Short, 23K views. — V
2. **Сөрөг тоог нэмэх ба хасах** — KhanAcademyMongolian — https://www.youtube.com/watch?v=MWMhs-RCISc — 3:13 — 6th grade — V
3. **Эерэг, сөрөг тоон дээрх үйлдлүүд** — Математикийн 6000 тест — https://www.youtube.com/watch?v=W3DBKhqDklI — 11:22 — 6th–7th grade — All four operations. — V
- Also: **Бүхэл тооны үржүүлэх, хуваах үйлдэл 6 анги** — Хандсүрэн Нэргүй — https://www.youtube.com/watch?v=YLY5ji6mCp4 — 9:33 — V

### n4 Хуваагдах чанар, ХИЕХ, ХБЕХ
1. **ХИЕХ ба ХБЕХ олох** — Н.Төмөрчөдөр — https://www.youtube.com/watch?v=5A_6LWGThLY — 4:58 — 6th grade — Most viewed short one (37K). — V
2. **ХИЕХ буюу Хамгийн Их Ерөнхий Хуваагч** — Byambaa — https://www.youtube.com/watch?v=R9mu0_ZjTV0 — 4:07; and **ХБЕХ буюу хамгийн бага ерөнхий хуваагдагч** — https://www.youtube.com/watch?v=K3wxiH5rgGc — 4:06 — 6th grade — Concept-first pair. — V
3. **Тооны хуваагдах шинж** — Udval Altankhuu — https://www.youtube.com/watch?v=cY0uinMstzo — 8:07 — 5th–6th grade — V
- Deeper: **6-р анги. Тооны хуваагдах шинж.** — 6000 тест — https://www.youtube.com/watch?v=5gpiGnFy3jo — 17:31 — V. **Теле хичээл 5-р анги (тооны хуваагдах шинж)** — ETV — https://www.youtube.com/watch?v=6lp709F9VwE — 22:27 — V

### n5 Энгийн бутархай
1. **Энгийн бутархайг нэмэх хасах** — KhanAcademyMongolian — https://www.youtube.com/watch?v=Jp-bsDfX5HU — 8:49 — 5th grade — 57K views. — V
2. **Энгийн бутархайг үржих хуваах үйлдэл** — Byambaa — https://www.youtube.com/watch?v=F7-uMOMlbZQ — 2:57 — 5th–6th grade — V
3. **Энгийн бутархайн үйлдлүүд** — ALTANTSETSEG Dawaa — https://www.youtube.com/watch?v=2Ye7KGox5bQ — 17:41 — 6th grade — Most viewed (67K), but long. — V
- Also: **Энгийн бутархай — Бүхлээс бутархайг хасах** — Result-Сургалтын Төв — https://www.youtube.com/watch?v=iwvCH___yVI — 4:41 — V

### n8 Харьцаа ба пропорц
1. **Харьцаа гэж юу вэ?** — Byambaa — https://www.youtube.com/watch?v=pjIjYbDrmaY — 1:58 — 6th grade — Concept intro. — V
2. **тэнцүү харьцаа ба пропорц** — tuugii z — https://www.youtube.com/watch?v=mHoBv6HK4-I — 5:59 — 6th grade — V
3. **Харьцаа ба пропорц 6-р анги** — itteacher nyamsuren — https://www.youtube.com/watch?v=jLNx9DzLMLA — 12:26 — V
- Also: **Харьцаа ба пропорц 5-р анги** — Gantogtokh Bayandorj — https://www.youtube.com/watch?v=_YOAL8xePBk — 12:39 — 20K views — V

### n6 Аравтын бутархай
1. **Аравтын бутархай гэж юу вэ?** — Byambaa — https://www.youtube.com/watch?v=cicT5Dctues — 1:07 — 5th grade — V
2. **Аравтын бутархайг нэмэх хасах** — Nyamaa Shoovdor — https://www.youtube.com/watch?v=4TC3dF0FMxM — 7:33 — 5th grade — V
3. **Аравтын бутархайг үржих, хуваах** — Byambaa — https://www.youtube.com/watch?v=fQOoePr-1fA — 4:53 — 5th–6th grade — V
- econtent 5th grade has six decimal lessons.

### n7 Процент
1. **Процент гэж юу вэ? Нэг зуун тэнцүү хуваавал…** — Byambaa — https://www.youtube.com/watch?v=T1QkOJ-JMBY — 1:29 — 6th grade — V
2. **Хувь (процент)-ийн утга** — KhanAcademyMongolian — https://www.youtube.com/watch?v=LAtRfNRs4qk — 3:01 — V
3. **Процентийн бодлого бодох** — KhanAcademyMongolian — https://www.youtube.com/watch?v=27_zFfczk-w — 6:15 — 27K views — V
- Also: **Процентын үндсэн бодлого** — 20-r surguuli Bolormaa — https://www.youtube.com/watch?v=SkE1zeC6Grs — 8:29 — V

### g1 Цэг, шулуун, өнцөг
1. **Цэг, шулуун, хэрчим, цацраг** — Oxyzco — https://www.youtube.com/watch?v=rMwYQ9xAOGU — 6:04 — 5th–6th grade — V
2. **Хурц, тэгш, мохоо өнцөг** — KhanAcademyMongolian — https://www.youtube.com/watch?v=q483dCj5qEM — 5:47 — V
3. **4-р анги. Өнцөг хэмжигч ашиглах** — 14-р сургууль — https://www.youtube.com/watch?v=m9CLe3XVh00 — 6:32 — Protractor use. — V
- Also: **Шулуун, хэрчим, цацраг** — Khan MN — https://www.youtube.com/watch?v=UHmXCstIAVI — 2:56 — V

### g2 Гурвалжин ба олон өнцөгт
1. **Гурвалжны дотоод өнцгүүдийн нийлбэр** — Oxyzco — https://www.youtube.com/watch?v=XmWOkaeyPjI — 3:22 — 6th–7th grade — V
2. **Гүдгэр олон өнцөгтийн дотоод өнцгүүдийн нийлбэр** — Oxyzco — https://www.youtube.com/watch?v=ldaKpM3qzzg — 6:10 — V
3. **Перпендикуляр шулуунууд болон тэгш/мохоо/хурц өнцөгт гурвалжны жишээ** — Khan MN — https://www.youtube.com/watch?v=_B1MS3fXnSU — 2:08 — Triangle types. — V
- Also: **Олон өнцөгтийн дотоод өнцгүүдийн нийлбэр** — Khan MN — https://www.youtube.com/watch?v=lYwEeAZ-dV8 — 9:04 — V

### g3 Периметр ба талбай
1. **Периметр ба талбайн үндсэн ойлголт** — KhanAcademyMongolian — https://www.youtube.com/watch?v=-G-VJK8EC6I — 5:56 — 49K views — V
2. **Талбай, периметрийг олох** — Nyamka Baatraa — https://www.youtube.com/watch?v=dnjp6vqGPhE — 2:36 — V
3. **3-р анги дүрсийн талбай, периметр олох** — Lhamaa LQ — https://www.youtube.com/watch?v=5Y9OCyY8FxA — 3:34 — Recent. — V

### d1 Өгөгдөл ба дундаж
1. **Арифметик дундаж гэж юу вэ? Хэрхэн олох вэ?** — Byambaa — https://www.youtube.com/watch?v=xgEC9McWEuY — 2:34 — V
2. **Өгөгдлийн медиан гэж юу вэ?** — Byambaa — https://www.youtube.com/watch?v=zqaCV02V1co — 3:09; **Өгөгдлийн МООД гэж юу вэ?** — https://www.youtube.com/watch?v=Blqp2aEQo68 — 2:38 — V
3. **48-р сургуулийн теле хичээл | Арифметик дундаж, моод, медиан, далайц** — Bat-Amgalan Byambadorj — https://www.youtube.com/watch?v=AV7i5vXJnmo — 7:11 — 42K views — V

### a1 Хувьсагч ба илэрхийлэл
1. **Хувьсагч гэж юу вэ?** — Byambaa — https://www.youtube.com/watch?v=j7nvavLIVVM — 1:49 — V
2. **Алгебр гэж юу вэ?** — Byambaa — https://www.youtube.com/watch?v=N9jSB0lbScg — 1:51 — V
3. **[Цахим хичээл] Математик 6-р анги "Алгебр илэрхийлэл"** — Шинэ Монгол Харүмафүжи — https://www.youtube.com/watch?v=8MThxiuLjwo — 14:05 — 42K views — V
- Deeper: **Тоон ба үсэгт илэрхийлэл 1** — 6000 тест — https://www.youtube.com/watch?v=WxjFTVJ7bYk — 12:54 — V

### f1 Координатын хавтгай
1. **6 р АНГИ Координатын хавтгай** — N. Khorloo — https://www.youtube.com/watch?v=geDGIaZ0GPU — 1:34 — V
2. **Координатын хавтгай** — Oxyzco — https://www.youtube.com/watch?v=zFvEtIoM_wM — 7:51 — V
3. **тэгш өнцөгт координатын хавтгай 5 р анги** — Б. Мөнхтуяа — https://www.youtube.com/watch?v=MAZv2qZkIPQ — 11:51 — V
- Also: МУБИС-ЕБС 6th grade — https://www.youtube.com/watch?v=2FZ1m67S3R8 — 20:57 — V

### a2 Шугаман тэгшитгэл
1. **Тэгшитгэл гэж юу вэ?** — Byambaa — https://www.youtube.com/watch?v=whrBjlBkecY — 2:20 — V
2. **Тэгшитгэл бодох** — ch duka — https://www.youtube.com/watch?v=50G8H5JHqlo — 2:44 — 10K views — V
3. **Суртлаа давт №58 | Шугаман тэгшитгэл-7 (6-7-р анги)** — iMath — https://www.youtube.com/watch?v=ml9uw7iFZLA — 1:25 — V
- Word problems: **Тэгшитгэл зохиож өгүүлбэртэй бодлого бодох 6-7-р анги** — Te Namjilmaa — https://www.youtube.com/watch?v=UJqwE16Ov0Q — 11:20 — V

### a3 Тэнцэтгэл биш
1. **Тэнцэтгэл биш гэж юу вэ?** — Byambaa — https://www.youtube.com/watch?v=s-j5q1lttl8 — 2:57 — V
2. **Шугаман тэнцэтгэл биш** — battulga oyunerdene — https://www.youtube.com/watch?v=wYYUTBohZhA — 4:04 — V
3. **Хялбар тэнцэтгэл биш (Математик цуврал №2)** — chadna.mn — https://www.youtube.com/watch?v=caFvPZq0Qas — 8:18 — V
- Deeper: **Шугаман тэнцэтгэл биш бодох** — 6000 тест — https://www.youtube.com/watch?v=t6BGdZecmuo — 17:51 — V

### a4 Зэрэг ба язгуур
1. **Квадрат язгуурын тухай ойлголт** — Khan MN — https://www.youtube.com/watch?v=YitGe9XWiW4 — 1:22 — 41K views — V
2. **Math "Зэргийн чанар"** — Math mongolia — https://www.youtube.com/watch?v=_aC0R2Rwiv8 — 3:15 — V
3. **Язгуур-1** — iMath — https://www.youtube.com/watch?v=eLJ4Ocj_Sxk — 3:49 — 17K views — V
- Also: **6 анги: Квадрат зэрэг, квадрат язгуур 1-р хэсэг** — Mathify — https://www.youtube.com/watch?v=FEOBJTOjLzo — 7:00 — recent — V. **хичээл 1: Зэрэг, түүний чанарууд** — Boloroo's math club — https://www.youtube.com/watch?v=Tb1josid49E — 5:20 — V

### g5 Пифагорын теорем
1. **Пифагорын теорем** — chadna.mn — https://www.youtube.com/watch?v=E-qtGfc2HNM — 9:06 — 8th grade — 19K views — V
2. **Суртлаа давт №392 | Пифагорын теорем** — iMath — https://www.youtube.com/watch?v=Lt0iezmkR-g — 7:11 — 2025 — V
3. **Пифагорын теорем** — A+ МАТЕМАТИК — https://www.youtube.com/watch?v=Gta6VdyIiLM — 1:03 — Very short. — V

### g4 Эзэлхүүн
1. **Математик IV анги, Эзлэхүүнийг олох** — Arvist Hangai — https://www.youtube.com/watch?v=0SRlTkZGFBo — 11:23 — 39K views, basic cube-counting. — V
2. **Цилиндрийн эзлэхүүн ба гадаргуугийн талбай** — Khan MN — https://www.youtube.com/watch?v=4trL2D3J6Y0 — 7:02 — 26K views — V
3. **Шулуун призмийн хажуу, бүтэн гадаргуу ба эзэлхүүн** — 6000 тест — https://www.youtube.com/watch?v=lquAV32Y6ck — 10:54 — V

### d2 Магадлалын үндэс
1. **Магадлалыг ойлгох** — Khan MN — https://www.youtube.com/watch?v=MHm8AY9RZ-A — 9:16 — 24K views — V
2. **Үзэгдлийн магадлал (part-1)** — Мянгат — https://www.youtube.com/watch?v=BUxucjzwO44 — 19:14 — 25K views — V
3. **Магадлалын жишээ бодлого** — 6000 тест — https://www.youtube.com/watch?v=WYlcmlgnoD8 — 9:14 — V
- **Weak spot:** no short, one-idea "what is probability" video in Mongolian.

### d3 Комбинаторик
1. **Комбинаторик 1р хэсэг Хэсэглэл, Сэлгэмэл** — Udval Altankhuu — https://www.youtube.com/watch?v=vsLsWPilL3I — 8:34 — V
2. **Факториал, Сэлгэмэл ба хэсэглэл** — Orgilmaa Oogii — https://www.youtube.com/watch?v=ndXDOJ8u2mk — 16:53 — V
3. **Combinatoric, Комбинаторик (сэлгэмэл, хэсэглэл, гүйлгэмэл)** — E. Tuguldur — https://www.youtube.com/watch?v=RpAXOqgv4Qs — 24:23 — 20K views — V

### f2 Шугаман функц
1. **7 р анги Шугаман функцийн график** — Udval Altankhuu — https://www.youtube.com/watch?v=ZZ7byewKk6M — 6:04 — V
2. **Шугаман функц, шулууны график** — iMath — https://www.youtube.com/watch?v=HySxLyW2U5E — 12:19 — 2026 — V
3. **Шугаман функцийн график байгуулах** — Tuvdennyam ErdeneOchir — https://www.youtube.com/watch?v=RmBIYbKzLng — 16:39 — 20K views — V
- Also: МУБИС-ЕБС 7th grade — https://www.youtube.com/watch?v=JGqiO97tSFA — 18:16 — V

### a6 Тэгшитгэлийн систем
1. **Математик №17. Шугаман тэгшитгэлийн системийг орлуулах аргаар бодох** — chadna.mn — https://www.youtube.com/watch?v=_fLozgAuRho — 4:28 — 41K views — V
2. **Математик цуврал №18. … нэмэх аргаар бодох** — chadna.mn — https://www.youtube.com/watch?v=vkbA5sAcVYM — 3:26 — 41K views — V
3. **Систем тэгшитгэл гэж юу вэ? хэрхэн бодох вэ?** — Byambaa — https://www.youtube.com/watch?v=Ql3gcKKjf1o — 7:38 — V
- Graphical method: chadna №19 — https://www.youtube.com/watch?v=lC14oO8mIgc — 5:33 — V

### a5 Олон гишүүнт, үржигдэхүүнд задлах
1. **Үржигдэхүүн болгон задлах** — iMath — https://www.youtube.com/watch?v=7L7rMerwiIs — 6:38 — 18K views — V
2. **Олон гишүүнт** — iMath — https://www.youtube.com/watch?v=V7A49jZD8TA — 11:17 — V
3. **9-р анги, Олон гишүүнтийг үржигдэхүүн болгон задлах** — 14-р сургууль — https://www.youtube.com/watch?v=Eyk6j61iLig — 16:15 — V
- **Gap:** no clean video found on "товчоор үржих томьёо" (special products); searches returned Excel tutorials.

### g7 Тойрог
1. **Тойргийн урт ба талбай олох** — Ganbat Battumur — https://www.youtube.com/watch?v=tZYbrWTvu4o — 5:14 — V
2. **Дугуйн талбай олох** — Byambaa — https://www.youtube.com/watch?v=Aj26AbHdE1I — 6:19 — V
3. **Тойрогт багтсан өнцөг** — batdorj yundendorj — https://www.youtube.com/watch?v=BePEKi8t71w — 7:33 — V
- Also: **Тойргийн хөвч, шүргэгч, огтлогч** — Өлзий багш — https://www.youtube.com/watch?v=kn24607FgjM — 11:32 — V. **Багтсан өнцөг ба төв өнцөг** — Khan MN — https://www.youtube.com/watch?v=Fj7prbZq7Pg — 11:59 — V

### a7 Квадрат тэгшитгэл
1. **Квадрат тэгшитгэл бодох №39** — chadna.mn — https://www.youtube.com/watch?v=rSsJfgn36Pg — 11:25 — 40K views — V
2. **Квадрат тэгшитгэлийг үржигдэхүүнд задлах аргаар бодох №41** — chadna.mn — https://www.youtube.com/watch?v=AbIg5HXJhXg — 7:27 — V
3. **Квадрат тэгшитгэлийг томъёогоор бодох №42** — chadna.mn — https://www.youtube.com/watch?v=C_ZTkZvXkgA — 14:10 — V
- Also: **Квадрат тэгшитгэл 9-р анги** — Udval — https://www.youtube.com/watch?v=CVXuvzwZTII — 14:09 — V

### f3 Квадрат функц (парабол)
1. **Суртлаа давт №26 Квадрат функцийн график байгуулах арга 1** — iMath — https://www.youtube.com/watch?v=2IC4fF8P2gM — 3:04 — V
2. **Квадрат функцийн график** — batzorig battseren — https://www.youtube.com/watch?v=uJlO6pj43wY — 6:46 — V
3. **Квадрат функцийн график байгуулах** — 6000 тест — https://www.youtube.com/watch?v=Fpbg3QSVn-4 — 17:16 — 19K views — V

### g6 Төсөөтэй гурвалжин
1. **Төсөөтэй гурвалжин** — Khan MN — https://www.youtube.com/watch?v=iWvFubO6W8M — 7:22 — V
2. **8-Төсөөтэй гурвалжингууд** — Оюуны хөрөнгө — https://www.youtube.com/watch?v=g5FFyOqwoeU — 6:43 — V
3. **Төсөөтэй гурвалжин / Similarities in Triangles** — Maths Coach Moonoi — https://www.youtube.com/watch?v=sqnP37xAeHc — 11:05 — V

### f5 Тэгш өнцөгт гурвалжны тригонометр
1. **Тэгш өнцөгт гурвалжны тригонометрийн харьцаа** — Byambaa — https://www.youtube.com/watch?v=4UUsLG1wBbk — 5:47 — 15K views — V
2. **2-2: Синус, косинус, тангенс болон Тригонометрийн үндсэн адилтгал** — Ganbat Baasantseren — https://www.youtube.com/watch?v=pmrEGi08Sks — 8:18 — V
3. **10 Тэгш өнцөгт гурвалжны sin cos** — Оюуны хөрөнгө — https://www.youtube.com/watch?v=7QR-f93-8iE — 11:27 — V

### d4 Статистик ба тархалт
1. **Суртлаа давт №32 | Дисперс ба стандарт хазайлт** — iMath — https://www.youtube.com/watch?v=xkZHJxKHYBE — 2:54 — V
2. **Суртлаа давт №144 / №145 | Дисперс, стандарт хазайлт-1/-2** — iMath — https://www.youtube.com/watch?v=IK1bqeYAb6E (3:00), https://www.youtube.com/watch?v=cw3BNsfGrek (4:09) — V (both)
3. **Моод, Медиан, Далайц, Дисперс, Стандарт хазайлт, Квартилууд** — 6000 тест — https://www.youtube.com/watch?v=HN4K_BIIqQE — 27:08 — 28K views — V
- Histograms: **10 р анги Өгөгдлийг бүлэглэж, гистограмм байгуулах** — Altangerel Oyunbaatar — https://www.youtube.com/watch?v=U5jAPo5TLfs — 15:24 — V

### f4 Илтгэгч ба логарифм
1. **Логарифм** — iMath — https://www.youtube.com/watch?v=u_dH6ehcKmg — 4:36 — V
2. **Илтгэгч ба логарифм функцийн урвуу** — B.Buyandelger — https://www.youtube.com/watch?v=9MlsI2je-ok — 9:11 — V
3. **Илтгэгч тэгшитгэл** — Барилгын политехник коллеж — https://www.youtube.com/watch?v=jRc4yB43RWY — 6:37 — V
- **Gap:** no short Mongolian video on the exponential function and its growth graph. Use econtent 10th grade "y=ka^x хэлбэрийн функцийн график".

### f6 Нэгж тойрог ба тригонометр функц
1. **Тригонометр / Нэгж радиустай тойрог дээрх өнцөг** — Oyunchimeg M — https://www.youtube.com/watch?v=LAyxwWUlec0 — 14:05 — V
2. **Математик хичээл 12: Тригонометр нэгж тойрог** — Мянгат — https://www.youtube.com/watch?v=-voP7_yBlro — 18:41 — V
3. **11-р анги Математик. Тригонометр функцын график** — 14-р сургууль — https://www.youtube.com/watch?v=1CIhhqUVTMA — 9:40 — V
- Also: **Нэгж радиустай тойрог ашиглан тригонометр функцийг дүрслэх 11** — https://www.youtube.com/watch?v=HMRTIWIG9BE — 14:58 — V. **Синус, Косинус функцийн графикийн хувиргалт** — 6000 тест — https://www.youtube.com/watch?v=eLDiyXJV3P8 — 23:01 — V

### f7 Функцийн найрлага ба урвуу функц
1. **Урвуу функц гэж юу вэ?** — Byambaa — https://www.youtube.com/watch?v=GM1GFFuJRoY — 8:15 — V
2. **Давхар функц гэж юу вэ? Түүний тэмдэглэгээ** — Byambaa — https://www.youtube.com/watch?v=sRPZtXW8v_w — 6:14 — Function composition ("давхар функц" is the Mongolian curriculum term). — V
3. **Суртлаа давт №43 | Урвуу функц** — iMath — https://www.youtube.com/watch?v=gDHTsvC-TDg — 4:27 — V
- Deeper: **Урвуу функц** — 6000 тест — https://www.youtube.com/watch?v=f7tocGZafH8 — 18:17 — 37K views — V

### c1 Дараалал ба хязгаар
1. **Арифметик дараалал гэж юу вэ?** — Byambaa — https://www.youtube.com/watch?v=jENey_Sb_5c — 2:27 — V. Also **Геометр дараалал буюу геометр прогресс гэж юу вэ?** — https://www.youtube.com/watch?v=-JIeJSMNv38 — 5:26 — V
2. **Арифметик прогресс. Математик цуврал №44** — chadna.mn — https://www.youtube.com/watch?v=tVI89HO6Mbs — 19:21 — 42K views — V
3. **Тоон дарааллын хязгаар, жишээ бодлогууд №1** — Lkhagvakhatan Enkhbat — https://www.youtube.com/watch?v=1plh4uR_Qpk — 6:16 — V; **[Цахим хичээл] Математик 11-р анги "Хязгаар"** — https://www.youtube.com/watch?v=jb-qlJzZ97Q — 11:32 — V

### c2 Уламжлал
1. **[Цахим хичээл] Математик 11-р анги "Уламжлал"** — Шинэ Монгол Харүмафүжи — https://www.youtube.com/watch?v=T0OzQzpbQMc — 8:53 — 22K views — V
2. **Уламжлал** — iMath — https://www.youtube.com/watch?v=yrjX_wuZ9iw — 5:04 — V
3. **Уламжлал парт-1 Элементар функцийн уламжлал** — Мянгат — https://www.youtube.com/watch?v=oYYPZF1a_Xk — 10:08 — V
- Also: **Уламжлал бодох дүрэм 1** — Altangerel Dorj — https://www.youtube.com/watch?v=KBLGhbNV2Xs — 3:18 — V. **Уламжлал ба интеграл** (overview) — https://www.youtube.com/watch?v=gluPO8RrzpY — 6:05 — V

### c3 Уламжлалын хэрэглээ
1. **iMath.mn | Функцийн өсч, буурах завсар** — iMath — https://www.youtube.com/watch?v=SMHTcBwsxRM — 2:54 — V
2. **Функцийн хамгийн их болон хамгийн бага утга** — iMath — https://www.youtube.com/watch?v=oq9VumNUazo — 2:00 — V
3. **Шүргэгч шулууны тэгшитгэл ба Нормал шулууны тэгшитгэл** — Мянгат — https://www.youtube.com/watch?v=mlSDbM85dlQ — 6:37 — V
- Also: **Уламжлал ашиглан функцийн өсөх ба буурах эсэхийг шинжлэх** — Мянгат — https://www.youtube.com/watch?v=QpBXwwFORSU — 12:53 — V

### c4 Интеграл
1. **Математик 11-р анги "Интеграл" I хэсэг** — Enkhmunkh Z — https://www.youtube.com/watch?v=JHpZxHLylwM — 4:07 — 28K views — V
2. **Интеграл эх функц 12 анги** — Мөнхбат Галиндэв — https://www.youtube.com/watch?v=67cI6_ZBGcw — 6:28 — V
3. **Тодорхой интеграл ба түүний үндсэн чанарууд** — Мянгат — https://www.youtube.com/watch?v=Dom3Km9BLBE — 12:34 — V
- Also: **Тодорхой интеграл** — Altangerel Dorj — https://www.youtube.com/watch?v=vc2FtPf6irs — 5:50 — V

### c5 Интегралын хэрэглээ
1. **Ц.ТАЙВАНСАЙХАН: МАТЕМАТИК ЭЕШ | Интеграл ашиглан дүрсийн талбай олох** — NMIT — https://www.youtube.com/watch?v=0hmjxR7qObA — 6:18 — V
2. **Интегралаар дүрсийн талбай олох** — Altangerel Dorj — https://www.youtube.com/watch?v=tnH2BPW6F94 — 15:00 — V
3. **Интеграл ашиглан эргэлтийн биеийн эзлэхүүн олох** — Оюунлаг сургууль — https://www.youtube.com/watch?v=uON4l6oKolk — 10:10 — V
- Also: **Тодорхой интегралаар хязгаарлагдсан дүрсийн талбай олох бодлогууд** — Мянгат — https://www.youtube.com/watch?v=gGqDAbljHaI — 19:11 — V

### NEW: Тэнцүүгийн тэмдэг (=)
1. **Тэнцүүгийн тэмдэг** — KhanAcademyMongolian — https://www.youtube.com/watch?v=xCyQWG-UIxw — 4:56 — 1st–2nd grade — The only direct hit, about 300 views. — V
2. **Их болон багын тэмдэг** — Khan MN — https://www.youtube.com/watch?v=f8lO8mK-9Vo — 5:04 — Related (<, >). — V
3. **тэгшитгэл бодох арга 4 р анги** — yanjinsuren nyamsuren — https://www.youtube.com/watch?v=74IICxk0-W8 — 3:24 — Balance idea. Loose fit. — V
- econtent 3rd grade: "Тэнцэтгэл, тэнцэтгэл биш", "Мэдэгдэхгүй байгаа гишүүнийг олох".
- **Essentially a GAP.** Nothing covers "= means both sides are the same", the common misconception teens have. Good candidate for the owner's first recording.

### NEW: Тооны шулуун (number line)
1. **Тоо гэж юу вэ? Тоо ба тоон шулуун** — Byambaa — https://www.youtube.com/watch?v=r9jVzGDj0tQ — 3:18 — V
2. **Сөрөг тоо ба тоон шулууны жишээ** — Khan MN — https://www.youtube.com/watch?v=m_Se7Yp6ZN8 — 3:24 — V
3. **Тоон шулуун дээрх цэгүүд** — Khan MN — https://www.youtube.com/watch?v=SRdyxhzfo3c — 1:34 — V
- Also: **Математикийн хичээл №1: Тоон шулуун дээр шийдийг дүрслэх нь** — chadna.mn — https://www.youtube.com/watch?v=rIMUW0Das-Q — 5:19 — Inequality solutions on a number line. — V. econtent 5th grade "Тоон шулуун".

---

## 3. Licensing and embedding notes
- **Standard YouTube embed** (`https://www.youtube-nocookie.com/embed/ID`) is allowed under YouTube's ToS whenever the uploader has embedding on. All 160 IDs checked returned oEmbed 200, so embedding was on at 2026-09-28. The app should still handle error 101/150 ("embedding disabled") at runtime and fall back to a plain "watch on YouTube" link, because owners can change this setting at any time.
- No channel description reviewed contained an explicit "no reuse" or "do not embed" notice. Only a few channel pages were read in full, though. **This is not a full legal review.**
- **Khan Academy Mongolian:** Khan content is CC BY-NC-SA. Non-commercial linking and embedding are fine. Attribute the channel.
- **Commercial tutoring channels** (iMath/8x100, 6000 тест, Мянгат, chadna.mn): embedding is fine. As a courtesy, consider telling them. They may welcome the traffic, and a partnership could supply newer or shorter clips.
- **econtent.edu.mn:** government, free to view. Videos are self-hosted MP4s on cdn.esis.edu.mn with no stated licence. **Link to the grade page only.** Do not embed or hot-link the files.
- Downloading or re-hosting any of these is not allowed (and not planned).

## 4. Observations
- Most Mongolian math video content dates from **2020–2021** (the COVID теле хичээл period). Newer (2024–26) short material comes mainly from iMath and a few individual teachers.
- **Byambaa** and **iMath "Суртлаа давт"** fit a catch-up app best (1–5 min, one idea each). **Khan MN** fills the lower grades. **chadna.mn** is best for grades 7–9 algebra. **Мянгат** and **6000 тест** are best for grades 10–12 depth and ЭЕШ.
- Watch-outs: many videos are handwritten or recorded on a phone with uneven audio. Many primary-level videos are pitched at 7–9-year-olds, which may feel childish to teens.
