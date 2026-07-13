"""DeepL FR->EN translation with an on-disk cache.

The cache (translations_cache.json) maps each source French string to its
English translation, so we only pay DeepL for text we have not seen before.
The scheduled workflow commits the cache, which makes daily runs incremental:
only genuinely new descriptions are sent to DeepL.

Design notes:
- Best-effort. If DEEPL_API_KEY is unset (e.g. a local run) or the API fails,
  the data update still proceeds; events simply keep whatever cached English
  they have, or none (the frontend falls back to French). Translation must
  never block the event feed from refreshing.
- Free-tier keys end in ":fx" and must use the api-free.deepl.com host.
"""
import json
import os

import requests

CACHE_PATH = os.path.join(os.path.dirname(__file__), "translations_cache.json")
DEEPL_KEY = os.environ.get("DEEPL_API_KEY", "").strip()

# DeepL accepts up to 50 text params per request.
BATCH = 50
TIMEOUT = 30


def _endpoint():
    free = DEEPL_KEY.endswith(":fx")
    return (
        "https://api-free.deepl.com/v2/translate"
        if free
        else "https://api.deepl.com/v2/translate"
    )


def load_cache():
    try:
        with open(CACHE_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except (OSError, json.JSONDecodeError):
        return {}


def save_cache(cache):
    # Atomic write so a crash mid-write can't corrupt the committed cache.
    tmp = CACHE_PATH + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(cache, f, ensure_ascii=False, indent=2, sort_keys=True)
    os.replace(tmp, CACHE_PATH)


def _deepl(texts):
    """Translate a batch of French texts to English via DeepL."""
    resp = requests.post(
        _endpoint(),
        headers={"Authorization": f"DeepL-Auth-Key {DEEPL_KEY}"},
        data=[("text", t) for t in texts]
        + [("source_lang", "FR"), ("target_lang", "EN-US")],
        timeout=TIMEOUT,
    )
    resp.raise_for_status()
    return [t["text"] for t in resp.json()["translations"]]


def translate_descriptions(events):
    """Attach event['description_en'] to each event, using/updating the cache.

    Only new (uncached) unique descriptions are sent to DeepL. On any failure
    the function returns having attached whatever translations are available.
    """
    cache = load_cache()

    # Unique, non-empty descriptions we haven't translated yet.
    todo = sorted(
        {
            e["description"]
            for e in events
            if e.get("description") and e["description"] not in cache
        }
    )

    if todo and not DEEPL_KEY:
        print(f"DEEPL_API_KEY not set; skipping translation of {len(todo)} descriptions.")
    elif todo:
        print(f"Translating {len(todo)} new descriptions via DeepL...")
        try:
            for i in range(0, len(todo), BATCH):
                chunk = todo[i : i + BATCH]
                for src, en in zip(chunk, _deepl(chunk)):
                    cache[src] = en
            save_cache(cache)
            print(f"Translation cache now holds {len(cache)} entries.")
        except requests.RequestException as exc:
            # Persist any batches that succeeded before the failure.
            save_cache(cache)
            print(f"Translation failed ({exc}); proceeding with cached translations only.")

    for e in events:
        desc = e.get("description")
        if desc and desc in cache:
            e["description_en"] = cache[desc]

    return events
