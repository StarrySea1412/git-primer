# -*- coding: utf-8 -*-
"""按 index.html / demo.js / style.css 的用字做文楷子集（woff2）。全量 TTF 放 build/fonts-src/。"""
import io, string, subprocess, os
chars = set(string.printable)
for f in ('index.html', 'assets/demo.js', 'assets/style.css'):
    chars |= set(io.open(f, encoding='utf-8').read())
chars |= set('，。、；：？！「」『』（）《》〈〉——……·×✔✕←→↑↓·°①②③④⑤⑥⑦⑧⑨⑩§⚓️🧭🌊☁️')
for c in '\n\t\r\x0b\x0c': chars.discard(c)
io.open('build/charset.txt', 'w', encoding='utf-8').write(''.join(sorted(chars)))
PY = r'C:/Users/45111/AppData/Local/Programs/Python/Python311/python.exe'
SUBSET = r'C:/Users/45111/AppData/Local/Programs/Python/Python311/Scripts/pyftsubset.exe'
for w in ('Regular', 'Medium'):
    out = 'assets/fonts/wenkai-%s.woff2' % w.lower()
    subprocess.run([SUBSET, 'build/fonts-src/wenkai-%s.ttf' % w,
        '--text-file=build/charset.txt', '--flavor=woff2',
        '--layout-features=*', '--output-file=' + out], check=True)
    print(w, '->', os.path.getsize(out), 'bytes')
