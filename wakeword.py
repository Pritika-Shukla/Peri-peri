import sys
import time
import pyaudio
import numpy as np
from openwakeword.model import Model

FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 16000
CHUNK = 1280
WAKE_MODEL = "hey jarvis"
THRESHOLD = 0.5
COOLDOWN_SEC = 2.0

def main():
    model = Model(
        wakeword_models=[WAKE_MODEL],
        inference_framework="onnx" if sys.platform == "win32" else "tflite",
        vad_threshold=0.4,
    )

    p = pyaudio.PyAudio()
    stream = p.open(format=FORMAT, channels=CHANNELS, rate=RATE, input=True, frames_per_buffer=CHUNK)

    last_wake = 0.0
    try:
        while True:
            audio = np.frombuffer(stream.read(CHUNK, exception_on_overflow=False), dtype=np.int16)
            model.predict(audio)

            now = time.monotonic()
            if now - last_wake < COOLDOWN_SEC:
                continue
            for scores in model.prediction_buffer.values():
                if scores and scores[-1] > THRESHOLD:
                    print("WAKE", flush=True)
                    last_wake = now
                    break
    except KeyboardInterrupt:
        pass
    finally:
        stream.stop_stream()
        stream.close()
        p.terminate()

if __name__ == "__main__":
    main()