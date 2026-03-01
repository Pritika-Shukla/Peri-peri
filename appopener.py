import re
import subprocess
try:
    import AppOpener
except ImportError:
    AppOpener = None

LEADING_PHRASES = re.compile(r"^(?:my |the |open |close )+", re.IGNORECASE)
TRAILING_PHRASES = re.compile(r"(?:\s+app|\s+application)s?$", re.IGNORECASE)


def _normalize_app_name(raw: str) -> str:
    if not raw or not raw.strip():
        return raw
    s = raw.strip().lower()
    s = LEADING_PHRASES.sub("", s)
    s = TRAILING_PHRASES.sub("", s)
    return s.strip() or raw.strip()


def open_app(app_name: str) -> str:
    if AppOpener is None:
        return "AppOpener is not installed. Run: pip install appopener"
    normalized = _normalize_app_name(app_name)
    display_name = normalized or app_name.strip()
    try:
        AppOpener.open(normalized, match_closest=True)
        return f"Opening {display_name}"
    except Exception as e:
        return f"Sorry, I couldn't find '{display_name}'. Error: {e}"


def close_app(app_name: str) -> str:
    if AppOpener is None:
        return "AppOpener is not installed. Run: pip install appopener"
    normalized = _normalize_app_name(app_name)
    display_name = normalized or app_name.strip()
    try:
        AppOpener.close(normalized, match_closest=True)
        return f"Closing {display_name}"
    except Exception as e:
        return f"Sorry, couldn't close '{display_name}'. Error: {e}"
