import sys
import os
from PIL import Image, ImageChops

def remove_background_fallback(img, tolerance=25):
    """
    Robust background cutout using corner-sampled color thresholding
    and alpha channel segmentation. Works offline without network download.
    """
    img = img.convert("RGBA")
    w, h = img.size
    
    # Sample background color from corners
    corners = [img.getpixel((0, 0)), img.getpixel((w - 1, 0)), img.getpixel((0, h - 1)), img.getpixel((w - 1, h - 1))]
    bg_r = sum(c[0] for c in corners) // 4
    bg_g = sum(c[1] for c in corners) // 4
    bg_b = sum(c[2] for c in corners) // 4

    datas = img.getdata()
    new_data = []
    for item in datas:
        r, g, b, a = item
        # Check distance from background color or if pixel is near-white
        diff = abs(r - bg_r) + abs(g - bg_g) + abs(b - bg_b)
        if diff < tolerance or (r > 242 and g > 242 and b > 242):
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append((r, g, b, a))

    img.putdata(new_data)
    return img

def process_product_image(input_img_path_or_bytes, output_webp_path, target_size=(800, 800), padding_pct=0.10):
    """
    Takes an input image, removes background, centers on a transparent 800x800 canvas,
    and exports as WebP.
    """
    os.makedirs(os.path.dirname(os.path.abspath(output_webp_path)), exist_ok=True)

    # 1. Load image
    if isinstance(input_img_path_or_bytes, (str, os.PathLike)):
        raw_img = Image.open(input_img_path_or_bytes)
    else:
        import io
        raw_img = Image.open(io.BytesIO(input_img_path_or_bytes))

    raw_img = raw_img.convert("RGBA")

    # 2. Background removal
    cutout = None
    u2net_path = os.path.expanduser("~/.u2net/u2net.onnx")
    if os.path.exists(u2net_path):
        try:
            from rembg import remove
            cutout = remove(raw_img)
        except Exception:
            cutout = remove_background_fallback(raw_img)
    else:
        cutout = remove_background_fallback(raw_img)

    # 3. Crop bounding box of non-transparent pixels
    bbox = cutout.getbbox()
    if bbox:
        cropped = cutout.crop(bbox)
    else:
        cropped = cutout

    # 4. Resize to fit within target canvas leaving padding
    canvas_w, canvas_h = target_size
    max_w = int(canvas_w * (1.0 - 2 * padding_pct))
    max_h = int(canvas_h * (1.0 - 2 * padding_pct))

    crop_w, crop_h = cropped.size
    ratio = min(max_w / max_w if crop_w == 0 else max_w / crop_w,
                max_h / max_h if crop_h == 0 else max_h / crop_h)
    
    new_w = max(1, int(crop_w * ratio))
    new_h = max(1, int(crop_h * ratio))

    resized = cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)

    # 5. Composite onto centered transparent 800x800 canvas
    canvas = Image.new("RGBA", target_size, (0, 0, 0, 0))
    offset_x = (canvas_w - new_w) // 2
    offset_y = (canvas_h - new_h) // 2
    canvas.paste(resized, (offset_x, offset_y), resized)

    # 6. Save as WebP
    canvas.save(output_webp_path, "WEBP", quality=90, method=6)
    return output_webp_path

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python image_processor.py <input_img> <output_webp>")
        sys.exit(1)
    out = process_product_image(sys.argv[1], sys.argv[2])
    print(f"Processed and exported: {out}")
