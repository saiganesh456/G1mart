import json
import re

with open('scripts/generate_472_catalog.js', 'r', encoding='utf-8') as f:
    text = f.read()

pattern = r'\{\s*id:\s*(\d+),\s*name:\s*"([^"]+)",\s*qty:\s*([\d\.]+),\s*unit:\s*"([^"]+)",\s*total:\s*([\d\.]+)\s*\}'
matches = re.findall(pattern, text)
print(f"Total raw items parsed: {len(matches)}")
for m in matches:
    if int(m[0]) in [171, 172, 173, 458, 459, 460, 461]:
        print(f"ID {m[0]}: Name='{m[1]}', Qty={m[2]}, Unit='{m[3]}', Total={m[4]}")
