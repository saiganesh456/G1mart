from duckduckgo_search import DDGS

try:
    with DDGS() as ddgs:
        results = list(ddgs.images("Aashirvaad Shudh Chakki Atta 1kg pack", max_results=5))
        print(f"Success! Got {len(results)} images:")
        for r in results:
            print("TITLE:", r.get('title'))
            print("IMAGE:", r.get('image'))
            print("SOURCE:", r.get('source'))
            print("---")
except Exception as e:
    print("Error:", e)
