import re

path = r'C:\Users\gumma\.gemini\antigravity-ide\brain\2954e95a-4e50-4762-bdcc-feb953725071\.system_generated\steps\643\content.md'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

imgs = re.findall(r'src=["\']([^"\']+\.(?:jpg|png|webp))["\']', text)
for img in set(imgs):
    if 'salt' in img.lower():
        print(img)
