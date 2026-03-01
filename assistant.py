import re
import sys
import json

try:
    from appopener import open_app, close_app
except ImportError:
    open_app = close_app = None

OPEN_RE = re.compile(r"\bopen\s+([^.,!?]+)", re.IGNORECASE)
CLOSE_RE = re.compile(r"\bclose\s+([^.,!?]+)", re.IGNORECASE)
TRAILING_JUNK = re.compile(
    r"\s*(?:for\s+me|please|thanks|thank\s+you|the\s+app(?:lication)?|\s+app(?:lication)?|would\s+you\s+mind)?\s*$",
    re.IGNORECASE,
)


def _clean_app_name(s):
    if not s:
        return s
    s = s.strip()
    if " on " in s.lower():
        s = s.split(" on ", 1)[-1].strip()
    s = TRAILING_JUNK.sub("", s).strip()
    return s or None


def process_command(text):
    if not text or not text.strip():
        return {"reply": "What would you like to do?", "fallback": False}
    t = text.strip()
    if open_app is None:
        if OPEN_RE.search(t) or CLOSE_RE.search(t):
            return {"reply": "App actions unavailable. Install: pip install appopener", "fallback": False}
        return {"fallback": True}
    m = OPEN_RE.search(t)
    if m:
        name = _clean_app_name(m.group(1))
        if name:
            return {"reply": open_app(name), "fallback": False}
    m = CLOSE_RE.search(t)
    if m:
        name = _clean_app_name(m.group(1))
        if name:
            return {"reply": close_app(name), "fallback": False}
    return {"fallback": True}


if __name__ == "__main__":
    while True:
        line = sys.stdin.readline()
        if not line:
            break
        try:
            data = json.loads(line)
            msg = data.get("message", "")
            out = process_command(msg)
            print(json.dumps(out))
        except Exception as e:
            print(json.dumps({"reply": str(e), "fallback": False}))
        sys.stdout.flush()
