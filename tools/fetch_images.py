#!/usr/bin/env python3
"""Download exercise photos from free-exercise-db (public domain) into img/.

Reads the `'<id>': { ... src: '<dataset id>'` pairs from js/data.js, fetches
frames 0 and 1 for each, and shrinks them to 640px wide. Requires Pillow.
Usage: python3 tools/fetch_images.py
"""
import io, pathlib, re, urllib.request
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises'
src = (ROOT / 'js' / 'data.js').read_text()
pairs = re.findall(r"'([a-z0-9-]+)': \{\s*name: '[^']*', src: '([^']+)'", src)
out = ROOT / 'img'
out.mkdir(exist_ok=True)
for ex_id, ds_id in pairs:
    for frame in (0, 1):
        dest = out / f'{ex_id}-{frame}.jpg'
        if dest.exists():
            continue
        with urllib.request.urlopen(f'{BASE}/{ds_id}/{frame}.jpg') as r:
            im = Image.open(io.BytesIO(r.read())).convert('RGB')
        im.thumbnail((640, 640))
        im.save(dest, 'JPEG', quality=72, optimize=True, progressive=True)
        print('saved', dest.name)
print(f'{len(pairs)} exercises')
