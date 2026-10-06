import sys
sys.path.append('scripts')

for b in [1, 2, 3]:
    mod_name = f"batch_{b}_import"
    mod = __import__(mod_name)
    data = getattr(mod, f"BATCH_{b}_DATA")
    verified = [d for d in data if d.get('image_match_status') == 'VERIFIED']
    needs_review = [d for d in data if d.get('image_match_status') == 'NEEDS_REVIEW']
    print(f"Batch {b}: total={len(data)}, VERIFIED={len(verified)}, NEEDS_REVIEW={len(needs_review)}")
    for v in verified:
        print(f"   Item {v['item_no']}: {v['source_name']} -> {v.get('display_name')} (img: {v.get('image_source_url')[:60] if v.get('image_source_url') else 'None'})")
