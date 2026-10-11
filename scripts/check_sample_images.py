import os
import json
from PIL import Image

pids = ['g1-p0675', 'g1-p0679', 'g1-p0693', 'g1-p0694', 'g1-p0695', 'g1-p0706', 'g1-p0003', 'g1-p0041', 'g1-p0042', 'g1-p0418']
for pid in pids:
    p = f"public/products/verified/{pid}.webp"
    exists = os.path.exists(p)
    sz = os.path.getsize(p) if exists else 0
    print(f"{pid}: exists={exists}, size={sz} bytes")
