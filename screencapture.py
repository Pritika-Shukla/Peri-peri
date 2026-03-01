import sys
import json
import tempfile

try:
    import pyautogui
except ImportError:
    print(json.dumps({"error": "pyautogui not installed. Run: pip install pyautogui"}))
    sys.exit(1)

try:
    screenshot = pyautogui.screenshot()

    max_width = 1920
    if screenshot.width > max_width:
        ratio = max_width / screenshot.width
        new_size = (max_width, int(screenshot.height * ratio))
        screenshot = screenshot.resize(new_size)

    fd, filepath = tempfile.mkstemp(suffix=".png")
    screenshot.save(filepath, format="PNG")
    print(json.dumps({"path": filepath}))
except Exception as e:
    print(json.dumps({"error": str(e)}))
