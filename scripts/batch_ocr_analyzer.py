import os
import json
import time
import glob
from rapidocr_onnxruntime import RapidOCR

scratch_docs = r'C:\Users\gumma\.gemini\antigravity-ide\brain\58a874f3-b075-4129-b1fd-3720bfc2a963\scratch\docs'
ocr_cache_file = r'C:\Users\gumma\.gemini\antigravity-ide\brain\58a874f3-b075-4129-b1fd-3720bfc2a963\scratch\ocr_cache.json'

engine = RapidOCR()

cache = {}
if os.path.exists(ocr_cache_file):
    try:
        with open(ocr_cache_file, 'r', encoding='utf-8') as f:
            cache = json.load(f)
        print(f"Loaded existing cache with {len(cache)} pages.")
    except Exception:
        cache = {}

images = sorted(glob.glob(os.path.join(scratch_docs, "*.jpg")))
print(f"Total images to process: {len(images)}")

start_time = time.time()
processed = 0

for idx, img_path in enumerate(images, 1):
    fname = os.path.basename(img_path)
    if fname in cache:
        continue
    
    t0 = time.time()
    try:
        result, _ = engine(img_path)
        # Store clean representation: list of [box, text, confidence]
        clean_result = []
        if result:
            for item in result:
                clean_result.append({
                    'box': item[0],
                    'text': item[1],
                    'conf': float(item[2])
                })
        cache[fname] = clean_result
        processed += 1
        dur = time.time() - t0
        print(f"[{idx}/{len(images)}] {fname}: {len(clean_result)} boxes ({dur:.2f}s)")
        
        # Periodic save every 5 pages
        if processed % 5 == 0:
            with open(ocr_cache_file, 'w', encoding='utf-8') as f:
                json.dump(cache, f, indent=2)
    except Exception as e:
        print(f"[{idx}/{len(images)}] ERROR on {fname}: {e}")
        cache[fname] = []

with open(ocr_cache_file, 'w', encoding='utf-8') as f:
    json.dump(cache, f, indent=2)

total_dur = time.time() - start_time
print(f"OCR finished in {total_dur:.1f}s. Total cached pages: {len(cache)}")
