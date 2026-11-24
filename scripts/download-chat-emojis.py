import os
import json
import urllib.request
import urllib.parse
import re
import time

TARGET_DIR = os.path.join("public", "images", "chat-emojis")
os.makedirs(TARGET_DIR, exist_ok=True)

# 1. Fetch images listed on Chat/Gallery
print("Fetching image list from Chat/Gallery...")
url = "https://genshin-impact.fandom.com/api.php?action=parse&page=Chat/Gallery&format=json&prop=images"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode("utf-8"))

images = [img for img in data.get("parse", {}).get("images", []) if img.startswith("Icon_Emoji")]
print(f"Total Icon_Emoji images found: {len(images)}")

# Select a wide range of popular characters and varied sets
desired_chars = [
    "Hu_Tao", "Furina", "Zhongli", "Raiden_Shogun", "Venti", "Nahida",
    "Kaedehara_Kazuha", "Neuvillette", "Klee", "Ganyu", "Xiao",
    "Kamisato_Ayaka", "Paimon", "Aether", "Lumine", "Navia",
    "Arlecchino", "Wanderer", "Yelan", "Tartaglia", "Albedo", "Tighnari",
    "Mona", "Keqing", "Shenhe", "Yae_Miko", "Yoimiya", "Lyney", "Lynette", "Chiori"
]

selected = []
for char in desired_chars:
    matching = [img for img in images if char.lower() in img.lower()]
    selected.extend(matching[:2])

# Add varied set representation
import random
random.seed(1337)
sampled = random.sample([img for img in images if img not in selected], 25)
selected.extend(sampled)
selected = list(dict.fromkeys(selected))
print(f"Selected {len(selected)} emojis to download.")

# 2. Batch query image URLs from MediaWiki API
def chunks(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i:i + n]

image_urls = {}
for batch in chunks(selected, 25):
    titles = [f"File:{img}" for img in batch]
    titles_param = "|".join(titles)
    query_url = f"https://genshin-impact.fandom.com/api.php?action=query&titles={urllib.parse.quote(titles_param)}&prop=imageinfo&iiprop=url&format=json"
    q_req = urllib.request.Request(query_url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(q_req) as resp:
        q_data = json.loads(resp.read().decode("utf-8"))
    
    pages = q_data.get("query", {}).get("pages", {})
    for pid, pdata in pages.items():
        title = pdata.get("title", "").replace("File:", "").replace(" ", "_")
        infos = pdata.get("imageinfo", [])
        if infos and infos[0].get("url"):
            # Clean URL: strip revision/latest suffix parameters to get direct static asset or retain clean url
            raw_url = infos[0]["url"]
            image_urls[title] = raw_url
    time.sleep(0.3)

print(f"Resolved direct URLs for {len(image_urls)} images.")

# 3. Download the assets
manifest = []

for filename, img_url in image_urls.items():
    # Make clean, safe local filename
    safe_filename = filename.replace("'", "").replace("%27", "")
    target_path = os.path.join(TARGET_DIR, safe_filename)
    
    # Parse character name and set
    # Pattern: Icon_Emoji_Paimons_Paintings_(\d+)_(.*?)_(\d+)\.png
    match = re.search(r"Paintings_(\d+)_([A-Za-z_]+)_(\d+)", safe_filename, re.IGNORECASE)
    set_num = match.group(1) if match else "00"
    char_name = match.group(2).replace("_", " ") if match else "Character"
    variant = match.group(3) if match else "1"
    
    emoji_id = safe_filename.replace(".png", "").lower().replace("_", "-")

    print(f"Downloading {safe_filename}...")
    try:
        d_req = urllib.request.Request(img_url, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": "https://genshin-impact.fandom.com/wiki/Chat/Gallery"
        })
        with urllib.request.urlopen(d_req) as resp:
            content = resp.read()
        with open(target_path, "wb") as f:
            f.write(content)
            
        manifest.append({
            "id": emoji_id,
            "filename": safe_filename,
            "path": f"/images/chat-emojis/{safe_filename}",
            "character": char_name,
            "set": f"Paimon's Paintings Set {set_num}",
            "variant": variant,
            "sourceUrl": img_url
        })
    except Exception as e:
        print(f"Error downloading {safe_filename}: {e}")

# 4. Save manifest
manifest_path = os.path.join(TARGET_DIR, "emojis.json")
with open(manifest_path, "w", encoding="utf-8") as f:
    json.dump(manifest, f, indent=2)

print(f"Successfully downloaded {len(manifest)} emojis and saved manifest to {manifest_path}")

# 5. Write ATTRIBUTION.md
attribution_path = os.path.join(TARGET_DIR, "ATTRIBUTION.md")
with open(attribution_path, "w", encoding="utf-8") as f:
    f.write("""# Genshin Impact In-Game Chat Emojis Attribution

## Source Information
- **Source Gallery:** [Genshin Impact Wiki - Chat/Gallery](https://genshin-impact.fandom.com/wiki/Chat/Gallery)
- **Asset Collection:** In-game emoji stickers ("Paimon's Paintings" series)
- **Original Copyright:** &copy; miHoYo / HoYoverse (Cognosphere PTE. LTD.)

## Usage & Licensing
- All character designs, in-game stickers, icons, and related assets are property of miHoYo / HoYoverse.
- Used in Character Getter for non-commercial educational, companion, and personal planning purposes in accordance with HoYoverse Overseas Fan-Made Merchandise & Content Guidelines.
- Assets are unaltered transparent PNGs as released in the official Genshin Impact client and documented on the community wiki.
""")

print("Attribution file generated successfully.")
