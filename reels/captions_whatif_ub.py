"""Joins the rendered frames into the Reel and adds the Mongolian captions (draft wording for the owner).

Run: python captions_whatif_ub.py <frames_dir | master.mp4> <out.mp4>
Captions follow the reference style: one serif italic line at the bottom, the title in the first seconds,
the speed counter under the title. Speed doubles every 2 s: v = 2^(t/2) m/s. A white flash at light speed.
Silent on purpose: the owner adds the song in Instagram.
"""
import os
import subprocess
import sys
import tempfile

FRAMES, OUT = sys.argv[1], sys.argv[2]
FONT_TITLE = 'C:/Windows/Fonts/segoeuib.ttf'
FONT_CAP = 'C:/Windows/Fonts/cambriai.ttf'  # Georgia Italic lacks the Mongolian letters
FONT_NUM = 'C:/Windows/Fonts/consolab.ttf'
T_LIGHT = 56.3

# (start, end, text): bottom captions. Times in seconds of the Reel.
CAPTIONS = [
    (3.6, 7.2, '2 секунд тутам хурд тань хоёр дахин нэмэгдэнэ.'),
    (7.3, 9.7, 'Усэйн Болтоос хурдан.'),
    (9.8, 12.2, 'Гепардаас хурдан.'),
    (12.3, 16.7, 'Хүлээгээрэй…'),
    (16.8, 19.2, 'Дууны хурд! Та хотоос гарлаа.'),
    (19.3, 22.0, 'Конкорд онгоцноос хурдан.'),
    (22.1, 25.8, 'Бууны сумнаас хурдан.'),
    (25.9, 29.0, 'Тойрог замын хурд. Та газраас хөөрлөө.'),
    (29.1, 31.3, 'Монгол доор чинь жижгэрч байна.'),
    (31.4, 42.9, 'Одоо та Дэлхийг тойрон гүйж байна.'),
    (43.0, 50.4, 'Гэрлийн хурдны 1%.'),
    (50.5, 54.2, 'Секундэд Дэлхийг нэг удаа тойрно.'),
    (54.3, 56.2, 'Гэрлийн хурдны тал. Цаг тань удааширч эхэлнэ.'),
]
# sizes are for 720 x 1280 frames
TITLE = [(0.0, 3.5, 'Хэрэв таны хурд', 'white', 46, 190), (0.0, 3.5, '2 секунд тутам 2 дахин', '#ffe14d', 46, 250),
         (0.0, 3.5, 'өсвөл?', 'white', 46, 310)]
END = [(56.7, 60.0, 'Дараагийн 2 секундэд', 'white', 44, 470), (56.7, 60.0, 'физик эвдэрнэ.', 'white', 44, 528),
       (57.4, 60.0, '2-р хэсэг?', '#ffe14d', 40, 650), (57.4, 60.0, 'Коммент дээр «2» гэж бичээрэй', '#ffe14d', 28, 706),
       (58.0, 60.0, 'Графикийг нь матемап дээр зураад үзээрэй', '#3df2ff', 24, 790)]


def esc_path(p):
    return p.replace('\\', '/').replace(':', '\\:')


tmp = tempfile.mkdtemp(prefix='caps')
n = 0


def textfile(s):
    global n
    n += 1
    p = os.path.join(tmp, f't{n}.txt')
    with open(p, 'w', encoding='utf-8') as f:
        f.write(s)
    return esc_path(p)


f = []
on = lambda a, b: f"enable='between(t,{a},{b})'"
for a, b, s, col, size, y in TITLE:
    f.append(f"drawtext=fontfile='{esc_path(FONT_TITLE)}':textfile='{textfile(s)}':expansion=none:fontsize={size}:fontcolor={col}:"
             f"borderw=3:bordercolor=black@0.55:x=(w-tw)/2:y={y}:{on(a, b)}")
for a, b, s in CAPTIONS:
    f.append(f"drawtext=fontfile='{esc_path(FONT_CAP)}':textfile='{textfile(s)}':expansion=none:fontsize=34:fontcolor=white:"
             f"borderw=3:bordercolor=black@0.6:x=(w-tw)/2:y=h-200:{on(a, b)}")
# speed counter: m/s first, then km/s
num = f"fontfile='{esc_path(FONT_NUM)}':fontsize=40:fontcolor=white:borderw=3:bordercolor=black@0.6:x=(w-tw)/2:y=120"
f.append(f"drawtext={num}:text='%{{eif\\:pow(2\\,t/2)\\:d}} м/с':{on(3.6, 26.5)}")
f.append(f"drawtext={num}:text='%{{eif\\:pow(2\\,t/2)/1000\\:d}} км/с':{on(26.5, T_LIGHT)}")
# white flash at the speed of light, then fade back to black space for the end card
f.append(f"drawbox=x=0:y=0:w=iw:h=ih:color=white@1:t=fill:enable='between(t,{T_LIGHT},{T_LIGHT + 0.35})'")
f.append(f"drawbox=x=0:y=0:w=iw:h=ih:color=0x05070d@0.75:t=fill:enable='gte(t,{T_LIGHT + 0.35})'")
for a, b, s, col, size, y in END:
    f.append(f"drawtext=fontfile='{esc_path(FONT_TITLE)}':textfile='{textfile(s)}':expansion=none:fontsize={size}:fontcolor={col}:"
             f"borderw=3:bordercolor=black@0.55:x=(w-tw)/2:y={y}:{on(a, b)}")
# logo pill, top centre, on every Reel
f.append(f"drawtext=fontfile='{esc_path(FONT_TITLE)}':textfile='{textfile('матемап')}':expansion=none:fontsize=24:fontcolor=#3df2ff:"
         f"box=1:boxcolor=0x05070d@0.55:boxborderw=12:x=(w-tw)/2:y=46")

script = os.path.join(tmp, 'filters.txt')
with open(script, 'w', encoding='utf-8') as fh:
    fh.write(',\n'.join(f))
if FRAMES == 'test':
    src = ['-f', 'lavfi', '-i', 'color=c=0x4a86e8:s=720x1280:r=30:d=60']
elif os.path.isfile(FRAMES):                  # a clean master video without captions
    src = ['-i', FRAMES]
else:
    src = ['-framerate', '30', '-i', os.path.join(FRAMES, '%04d.png')]
cmd = ['ffmpeg', '-y', '-loglevel', 'error', *src,
       '-/filter_complex', script, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium',
       '-movflags', '+faststart', OUT]
subprocess.run(cmd, check=True)
print('wrote', OUT)
