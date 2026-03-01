import sys
import json
import time

try:
    import pyautogui
except ImportError:
    print(json.dumps({"error": "pyautogui not installed. Run: pip install pyautogui"}))
    sys.exit(1)

try:
    time.sleep(0.15)
    pyautogui.hotkey("ctrl", "v")
    print(json.dumps({"success": True}))
except Exception as e:
    print(json.dumps({"error": str(e)}))
