import os
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageEnhance

# 1. Load base pouch template
base_pouch = Image.open("C:/Users/gumma/.gemini/antigravity/brain/bfb9f30b-8640-48c9-b2b8-76843dcbd894/yellow_moong_dal_1791880584664.jpg").convert("RGBA")
# Base size is 1024x1024

# 2. Extract product mask from base pouch
# The yellow dal inside has high saturation and distinct hue, while the bag, zipper, and white background are desaturated grey/white.
# Let's inspect HSV:
hsv = base_pouch.convert("HSV")
h, s, v = hsv.split()

# Where saturation > 40 and v < 240, that is the dal!
# Also dilate and smooth the mask slightly
import numpy as np
s_arr = np.array(s)
v_arr = np.array(v)
prod_mask_arr = (s_arr > 35) & (v_arr < 245)

# Convert to PIL Image mask
mask_img = Image.fromarray((prod_mask_arr * 255).astype(np.uint8), mode='L')
# Smooth mask edges
mask_img = mask_img.filter(ImageFilter.GaussianBlur(radius=2))

# 3. Load product texture
texture = Image.open("scratch_test_makhana_texture.jpg").convert("RGBA")
# Crop / resize texture to 1024x1024
tw, th = texture.size
min_dim = min(tw, th)
texture_cropped = texture.crop(((tw - min_dim)//2, (th - min_dim)//2, (tw + min_dim)//2, (th + min_dim)//2))
texture_resized = texture_cropped.resize((1024, 1024), Image.Resampling.LANCZOS)

# 4. Composite texture over the base pouch using the product mask
composite = base_pouch.copy()
composite.paste(texture_resized, (0, 0), mask_img)

# 5. Extract the bag plastic highlights and shading from base_pouch to overlay back on top!
# In grayscale, plastic highlights are bright white highlights, and side creases are soft shadows.
# We can blend the bag's specular highlights:
gray_base = base_pouch.convert("L")
# High-pass or soft light highlight:
highlights = gray_base.filter(ImageFilter.GaussianBlur(1))

# 6. Now add the G1 Mart Label
lx1, ly1 = int(286 * (1024/800)), int(286 * (1024/800))
lx2, ly2 = int(514 * (1024/800)), int(580 * (1024/800))
lw = lx2 - lx1
lh = ly2 - ly1

label_layer = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
draw = ImageDraw.Draw(label_layer)

# Drop shadow
draw.rounded_rectangle([lx1 + 3, ly1 + 4, lx2 + 3, ly2 + 4], radius=14, fill=(0, 0, 0, 45))
# Crisp white card
draw.rounded_rectangle([lx1, ly1, lx2, ly2], radius=14, fill=(255, 255, 255, 255), outline=(230, 235, 230, 255), width=2)

# Paste Logo
logo = Image.open("scratch_perfect_logo.png").convert("RGBA")
target_w = int(175 * (1024/800))
target_h = int(logo.height * (target_w / logo.width))
logo_scaled = logo.resize((target_w, target_h), Image.Resampling.LANCZOS)
logo_x = 512 - (target_w // 2)
logo_y = ly1 + int(22 * (1024/800))
label_layer.paste(logo_scaled, (logo_x, logo_y), logo_scaled)

# Fonts
font_eng1 = ImageFont.truetype("arialbd.ttf", 33)
font_eng2 = ImageFont.truetype("arialbd.ttf", 29)
font_tel = ImageFont.truetype("C:\\Windows\\Fonts\\Nirmala.ttc", 36)
font_wt = ImageFont.truetype("arialbd.ttf", 20)

c_eng = (7, 69, 34, 255)      # Deep brand green
c_tel = (25, 45, 28, 255)     # Deep dark green
c_wt = (20, 25, 20, 255)      # Charcoal

draw.text((512, ly1 + int(105 * (1024/800))), "Phool Makhana", fill=c_eng, font=font_eng1, anchor="mm")
draw.text((512, ly1 + int(140 * (1024/800))), "(Lotus Seeds)", fill=c_eng, font=font_eng2, anchor="mm")
draw.text((512, ly1 + int(192 * (1024/800))), "పూల్ మఖానా", fill=c_tel, font=font_tel, anchor="mm")
draw.text((512, ly2 - int(25 * (1024/800))), "NET WT: 250g", fill=c_wt, font=font_wt, anchor="mm")

final_img = Image.alpha_composite(composite, label_layer)
final_img_800 = final_img.resize((800, 800), Image.Resampling.LANCZOS).convert("RGB")
final_img_800.save("scratch_test_makhana_pouch.webp", "WEBP", quality=95)
print("Saved scratch_test_makhana_pouch.webp successfully!")
