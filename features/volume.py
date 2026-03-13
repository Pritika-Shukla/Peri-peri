from ctypes import POINTER, cast
import sys

from comtypes import CLSCTX_ALL
from pycaw.pycaw import AudioUtilities, IAudioEndpointVolume  # pylint: disable=import-error


def _get_volume_interface() -> IAudioEndpointVolume:
    device = AudioUtilities.GetSpeakers()
    interface = device._dev.Activate(IAudioEndpointVolume._iid_, CLSCTX_ALL, None)  # pylint: disable=protected-access
    return cast(interface, POINTER(IAudioEndpointVolume))


def volume_up(step: float = 0.1) -> None:
    volume = _get_volume_interface()
    current = volume.GetMasterVolumeLevelScalar()
    volume.SetMasterVolumeLevelScalar(min(current + step, 1.0), None)


def volume_down(step: float = 0.1) -> None:
    volume = _get_volume_interface()
    current = volume.GetMasterVolumeLevelScalar()
    volume.SetMasterVolumeLevelScalar(max(current - step, 0.0), None)


def mute() -> None:
    volume = _get_volume_interface()
    volume.SetMute(1, None)


def unmute() -> None:
    volume = _get_volume_interface()
    volume.SetMute(0, None)


def set_volume(target: float = 0.7) -> None:
    """Set absolute volume as scalar 0.0–1.0."""
    target = max(0.0, min(target, 1.0))
    volume = _get_volume_interface()
    volume.SetMasterVolumeLevelScalar(target, None)


if __name__ == "__main__":
    action = sys.argv[1] if len(sys.argv) > 1 else "up"
    if action == "up":
        volume_up()
    elif action == "down":
        volume_down()
    elif action == "mute":
        mute()
    elif action == "unmute":
        unmute()
    elif action == "set" and len(sys.argv) > 2:
        try:
            # Expect percentage 0–100 from CLI, convert to 0.0–1.0
            pct = float(sys.argv[2])
            set_volume(pct / 100.0)
        except ValueError:
            pass