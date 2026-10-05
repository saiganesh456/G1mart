import re
import glob

for fn in sorted(glob.glob('scripts/batch_*_import.py')):
    with open(fn, 'r', encoding='utf-8') as f:
        text = f.read()
    matches = re.findall(r"'item_no':\s*(\d+)", text)
    if matches:
        nums = [int(m) for m in matches]
        print(f"{fn}: min={min(nums)}, max={max(nums)}, total={len(nums)}")
