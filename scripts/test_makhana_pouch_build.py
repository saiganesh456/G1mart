import os
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageEnhance

base_pouch = Image.open("C:/Users/gumma/.gemini/antigravity/brain/bfb9f30b-8640-48c9-b2b8-76843dcbd894/yellow_moong_dal_1791880584664.jpg").convert("RGBA")
mask = Image.open("scratch_pouch_mask.png").convert("L")

# Load makhana texture
tex = Image.open("scratch_makhana_wiki.jpg").convert("RGBA")
# Center crop square
tw, th = tex.size
md = min(tw, th)
tex_sq = tex.crop(((tw-md)//2, (th-md)//2, (tw+md)//2, (th+md)//2)).resize((1024, 1024), Image.Resampling.LANCZOS)

# Create composite:
comp = base_pouch.copy()
comp.paste(tex_sq, (0, 0), mask)

# Extract plastic bag highlights from base_pouch
# High luminance pixels of base_pouch create the plastic reflection sheen!
base_gray = base_pouch.convert("L")
# Where base_gray is bright in the mask area, that's plastic glare/reflection:
sheen = Image.new("RGBA", (1024, 1024), (255, 255, 255, 0))
# Let's add natural curved glossy highlight lines
gl_draw = ImageDraw.Draw(sheen)
gl_draw.line([(320, 370), (300, 780)], fill=(255, 255, 255, 75), width=28)
gl_draw.line([(715, 370), (700, 780)], fill=(255, 255, 255, 45), width=20)
sheen = sheen.filter(ImageFilter.GaussianBlur(10))

comp.alpha_composite(sheen)

# Label bounds matching G1 Mart standard:
# In 1024x1024 coordinates:
lx1 = int(286 * (1024/800))  # 366
ly1 = int(286 * (1024/800))  # 366
lx2 = int(514 * (1024/800))  # 657
ly2 = int(580 * (1024/800))  # 742

lbl_layer = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
draw = ImageDraw.Draw(lbl_layer)

# Drop shadow
draw.rounded_rectangle([lx1 + 2, ly1 + 3, lx2 + 2, ly2 + 3], radius=14, fill=(0, 0, 0, 45))
# Pure white card with subtle border
draw.rounded_rectangle([lx1, ly1, lx2, ly2], radius=14, fill=(255, 255, 255, 255), outline=(225, 230, 225, 255), width=1)

# G1 Mart Logo
logo = Image.open("scratch_perfect_logo.png").convert("RGBA")
target_w = int(175 * (1024/800))
target_h = int(logo.height * (target_w / logo.width))
logo_scaled = logo.resize((target_w, target_h), Image.Resampling.LANCZOS)
logo_x = 512 - (target_w // 2)
logo_y = ly1 + int(18 * (1024/800))
lbl_layer.paste(logo_scaled, (logo_x, logo_y), logo_scaled)

# Fonts
font_eng1 = ImageFont.truetype("arialbd.ttf", int(26 * (1024/800)))
font_eng2 = ImageFont.truetype("arialbd.ttf", int(23 * (1024/800)))
font_tel = ImageFont.truetype("C:\\Windows\\Fonts\\Nirmala.ttc", int(28 * (1024/800)))
font_wt = ImageFont.truetype("arialbd.ttf", int(16 * (1024/800)))

c_eng = (7, 69, 34, 255)      # Deep brand green
c_tel = (25, 45, 28, 255)     # Deep dark green
c_wt = (20, 25, 20, 255)      # Charcoal

draw.text((512, ly1 + int(105 * (1024/800))), "Phool Makhana", fill=c_eng, font=font_eng1, anchor="mm")
draw.text((512, ly1 + int(140 * (1024/800))), "(Lotus Seeds)", fill=c_eng, font=font_eng2, anchor="mm")
draw.text((512, ly1 + int(192 * (1024/800))), "పూల్ మఖానా", fill=c_tel, font=font_tel, anchor="mm")
draw.text((512, ly2 - int(25 * (1024/800))), "NET WT: 250g", fill=c_wt, font=font_wt, anchor="mm")

final_img = Image.alpha_composite(comp, lbl_layer)
final_800 = final_img.resize((800, 800), Image.Resampling.LANCZOS).convert("RGB")
final_800.save("scratch_makhana_pouch_perfect.webp", "WEBP", quality=95)
print("Saved scratch_makhana_pouch_perfect.webp successfully!")
