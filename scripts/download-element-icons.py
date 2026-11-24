import os, urllib.request, json

TARGET_DIR = os.path.join("public", "images", "elements")
os.makedirs(TARGET_DIR, exist_ok=True)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://genshin-impact.fandom.com/wiki/Element",
}

# Query actual URLs via Fandom MediaWiki API
elements = {
    "anemo":   "File:Element Anemo.png",
    "geo":     "File:Element Geo.png",
    "electro": "File:Element Electro.png",
    "dendro":  "File:Element Dendro.png",
    "hydro":   "File:Element Hydro.png",
    "pyro":    "File:Element Pyro.png",
    "cryo":    "File:Element Cryo.png",
}

titles = "|".join(elements.values())
import urllib.parse
api_url = f"https://genshin-impact.fandom.com/api.php?action=query&titles={urllib.parse.quote(titles)}&prop=imageinfo&iiprop=url&format=json"
req = urllib.request.Request(api_url, headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode())

pages = data.get("query", {}).get("pages", {})
title_to_url = {}
for page in pages.values():
    t = page.get("title", "")
    info = page.get("imageinfo", [])
    if info and info[0].get("url"):
        title_to_url[t] = info[0]["url"]

print("Resolved URLs:", json.dumps(title_to_url, indent=2))

results = {}
for key, file_title in elements.items():
    url = title_to_url.get(file_title)
    if not url:
        print(f"[MISS] {key}: no URL resolved")
        continue
    filename = f"{key}.png"
    dest = os.path.join(TARGET_DIR, filename)
    try:
        r = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(r) as resp:
            raw = resp.read()
        with open(dest, "wb") as f:
            f.write(raw)
        print(f"[OK] {key}: {len(raw)} bytes -> {dest}")
        results[key] = f"/images/elements/{filename}"
    except Exception as e:
        print(f"[ERR] {key}: {e}")

manifest_path = os.path.join(TARGET_DIR, "elements.json")
with open(manifest_path, "w") as f:
    json.dump(results, f, indent=2)
print("Manifest:", manifest_path)
