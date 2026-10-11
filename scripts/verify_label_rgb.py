from PIL import Image
import numpy as np

im = Image.open('public/products/verified/g1-p0675.webp').convert('RGB')
arr = np.array(im)
# The label center was at (400, 330), let's check the center color
center_box = arr[320:340, 390:410]
print("Label center mean RGB (should be white or text):", center_box.mean(axis=(0,1)))
# Check area around (400, 250) which is inside the label card
label_bg = arr[240:260, 350:450]
print("Label card bg mean RGB (should be ~255, 255, 255):", label_bg.mean(axis=(0,1)))

# Also check g1-p0695.webp
im2 = Image.open('public/products/verified/g1-p0695.webp').convert('RGB')
arr2 = np.array(im2)
label_bg2 = arr2[240:260, 350:450]
print("g1-p0695 label card bg mean RGB:", label_bg2.mean(axis=(0,1)))
