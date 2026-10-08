import requests
from io import BytesIO
from PIL import Image
from rembg import remove

url = "https://images.openbeautyfacts.org/images/products/890/128/710/0013/front_en.11.400.jpg"
print("Downloading Mysore Sandal Soap...")
resp = requests.get(url, timeout=10)
input_img = Image.open(BytesIO(resp.content)).convert("RGBA")
print("Removing background with AI rembg...")
output_img = remove(input_img)

# Save transparent PNG
output_img.save("public/products/packshots/mysore-sandal-soap.png", "PNG")
print("Saved transparent studio cutout to public/products/packshots/mysore-sandal-soap.png!")

# Also create clean white background version
bg = Image.new("RGBA", output_img.size, (255, 255, 255, 255))
bg.paste(output_img, (0, 0), output_img)
bg.convert("RGB").save("public/products/packshots/mysore-sandal-soap.jpg", "JPEG", quality=95)
print("Saved pure white studio packshot to public/products/packshots/mysore-sandal-soap.jpg!")
