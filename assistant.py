import json
import re
import sys

try:
    from appopener import close_app, open_app
except ImportError:
    open_app = close_app = None

OPEN_RE = re.compile(r"\bopen\s+([^.,!?]+)", re.IGNORECASE)
CLOSE_RE = re.compile(r"\bclose\s+([^.,!?]+)", re.IGNORECASE)
TRAILING_JUNK = re.compile(
    r"\s*(?:for\s+me|please|thanks|thank\s+you|the\s+app(?:lication)?|\s+app(?:lication)?|would\s+you\s+mind)?\s*$",
    re.IGNORECASE,
)

VOLUME_UP_RE = re.compile(r"\b(volume\s+up|increase\s+volume|turn\s+up\s+the\s+volume)\b", re.IGNORECASE)
VOLUME_DOWN_RE = re.compile(r"\b(volume\s+down|decrease\s+volume|turn\s+down\s+the\s+volume)\b", re.IGNORECASE)
MUTE_RE = re.compile(r"\b(mute|mute\s+volume|turn\s+off\s+the\s+sound)\b", re.IGNORECASE)
UNMUTE_RE = re.compile(r"\b(unmute|unmute\s+volume|turn\s+on\s+the\s+sound)\b", re.IGNORECASE)
VOLUME_SET_RE = re.compile(
    r"\b(?:set\s+)?volume\s+(?:to\s+)?(\d{1,3})\s*(?:percent|%)?\b", re.IGNORECASE
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

    # Volume commands (handled in Electron main via action)
    m = VOLUME_SET_RE.search(t)
    if m:
        percent = int(m.group(1))
        return {"action": "volume_set", "value": percent, "fallback": False}

    if VOLUME_UP_RE.search(t):
        return {"action": "volume_up", "fallback": False}
    if VOLUME_DOWN_RE.search(t):
        return {"action": "volume_down", "fallback": False}
    if MUTE_RE.search(t):
        return {"action": "volume_mute", "fallback": False}
    if UNMUTE_RE.search(t):
        return {"action": "volume_unmute", "fallback": False}

    # App open/close commands
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
