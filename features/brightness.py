"""Control primary display brightness (0–100%). Windows uses WMI via screen_brightness_control."""
import sys

try:
    import screen_brightness_control as sbc
except ImportError:
    sbc = None

STEP = 10


def _get_brightness() -> int:
    if sbc is None:
        return 50
    try:
        value = sbc.get_brightness()
        if isinstance(value, list):
            value = value[0] if value else 50
        return int(value)
    except Exception:
        return 50


def brightness_up(step: int = STEP) -> None:
    if sbc is None:
        return
    current = _get_brightness()
    sbc.set_brightness(min(current + step, 100))


def brightness_down(step: int = STEP) -> None:
    if sbc is None:
        return
    current = _get_brightness()
    sbc.set_brightness(max(current - step, 0))


def set_brightness(percent: int) -> None:
    """Set brightness to 0–100%."""
    if sbc is None:
        return
    percent = max(0, min(100, int(percent)))
    sbc.set_brightness(percent)


if __name__ == "__main__":
    action = sys.argv[1] if len(sys.argv) > 1 else "up"
    if action == "up":
        brightness_up()
    elif action == "down":
        brightness_down()
    elif action == "set" and len(sys.argv) > 2:
        try:
            pct = int(sys.argv[2])
            set_brightness(pct)
        except ValueError:
            pass
