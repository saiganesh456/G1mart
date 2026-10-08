import os
from PIL import Image

def process_good_day():
    src_path = 'public/products/packshots/test-good_day_2.png'
    if not os.path.exists(src_path):
        print(f"File not found: {src_path}")
        return
    
    img = Image.open(src_path).convert('RGBA')
    # Trim transparent borders if any
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    # Create 600x600 canvas
    canvas_size = (600, 600)
    # Fit into 540x540 to leave padding
    target_box = 540
    w, h = img.size
    ratio = min(target_box / w, target_box / h)
    new_w, new_h = int(w * ratio), int(h * ratio)
    img_resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # Save transparent PNG
    png_canvas = Image.new('RGBA', canvas_size, (255, 255, 255, 0))
    paste_x = (canvas_size[0] - new_w) // 2
    paste_y = (canvas_size[1] - new_h) // 2
    png_canvas.paste(img_resized, (paste_x, paste_y), img_resized)
    png_canvas.save('public/products/packshots/good-day.png', 'PNG')
    
    # Save white background JPG
    jpg_canvas = Image.new('RGB', canvas_size, (255, 255, 255))
    jpg_canvas.paste(img_resized, (paste_x, paste_y), img_resized)
    jpg_canvas.save('public/products/packshots/good-day.jpg', 'JPEG', quality=95)
    print("Processed good-day.png and good-day.jpg successfully!")

def process_curd_dahi():
    src_path = 'public/products/packshots/curd-dahi.jpg'
    if not os.path.exists(src_path):
        print(f"File not found: {src_path}")
        return
        
    img = Image.open(src_path).convert('RGB')
    w, h = img.size
    # Right ~28% is the blue sidebar ("POUCH CURD 500g")
    # Let's crop from 0 to 71% of width
    crop_w = int(w * 0.71)
    cropped = img.crop((0, 0, crop_w, h))
    
    # Now find bounding box of the pouch (non-white pixels)
    # The background is white (255, 255, 255)
    canvas_size = (600, 600)
    target_box = 540
    cw, ch = cropped.size
    ratio = min(target_box / cw, target_box / ch)
    new_w, new_h = int(cw * ratio), int(ch * ratio)
    resized = cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    jpg_canvas = Image.new('RGB', canvas_size, (255, 255, 255))
    paste_x = (canvas_size[0] - new_w) // 2
    paste_y = (canvas_size[1] - new_h) // 2
    jpg_canvas.paste(resized, (paste_x, paste_y))
    jpg_canvas.save('public/products/packshots/curd-dahi.jpg', 'JPEG', quality=95)
    
    # Also save .png
    png_canvas = Image.new('RGBA', canvas_size, (255, 255, 255, 255))
    png_canvas.paste(resized, (paste_x, paste_y))
    png_canvas.save('public/products/packshots/curd-dahi.png', 'PNG')
    print("Processed curd-dahi.jpg and curd-dahi.png successfully!")

if __name__ == '__main__':
    process_good_day()
    process_curd_dahi()
