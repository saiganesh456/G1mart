import os
import glob
from PIL import Image
import rembg

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VERIFIED_DIR = os.path.join(BASE_DIR, 'public/products/verified')

def contain_in_canvas(img, target_size=(800, 800), box_size=(640, 640)):
    canvas = Image.new('RGBA', target_size, (0, 0, 0, 0))
    w, h = img.size
    ratio = min(box_size[0] / w, box_size[1] / h)
    new_w = max(1, int(w * ratio))
    new_h = max(1, int(h * ratio))
    resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    offset = ((target_size[0] - new_w) // 2, (target_size[1] - new_h) // 2)
    canvas.paste(resized, offset, resized)
    return canvas

def main():
    print('Checking all verified product images for white box borders...')
    session = rembg.new_session('u2net')
    cleaned_count = 0

    for path in glob.glob(os.path.join(VERIFIED_DIR, '*.webp')):
        try:
            img = Image.open(path).convert('RGBA')
            b = img.getbbox()
            if not b:
                continue

            # Check 4 corners of bbox
            c1 = img.getpixel((b[0] + 2, b[1] + 2))
            c2 = img.getpixel((b[2] - 3, b[1] + 2))
            c3 = img.getpixel((b[0] + 2, b[3] - 3))
            c4 = img.getpixel((b[2] - 3, b[3] - 3))

            # If all 4 bbox corners are opaque near-white / solid box
            is_white_box = all(c[0] > 235 and c[1] > 235 and c[2] > 235 and c[3] > 200 for c in [c1, c2, c3, c4])

            if is_white_box:
                pid = os.path.splitext(os.path.basename(path))[0]
                print(f'  Cleaning white box for {pid}...')
                # Run rembg
                cropped = img.crop(b)
                cut = rembg.remove(cropped, session=session)
                clean_contained = contain_in_canvas(cut)
                clean_contained.save(path, 'WEBP')
                cleaned_count += 1
                print(f'  -> Done {pid}')
        except Exception as e:
            print(f'Error processing {path}: {e}')

    print(f'Successfully cleaned {cleaned_count} verified images!')

if __name__ == '__main__':
    main()
