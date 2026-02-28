import sys
import threading
import speech_recognition as sr

try:
    import pyaudio
except ImportError:
    pyaudio = None

r = sr.Recognizer()

RATE = 16000
CHUNK = 1024
SAMPLE_WIDTH = 2
FORMAT = pyaudio.paInt16 if pyaudio else None
CHANNELS = 1


def record_until_stop():
    """Record audio until 'stop' is received on stdin (for Electron start/stop flow)."""
    if not pyaudio:
        sys.stderr.write("pyaudio is required for --record-until-stop\n")
        return None
    p = pyaudio.PyAudio()
    stream = p.open(
        format=FORMAT,
        channels=CHANNELS,
        rate=RATE,
        input=True,
        frames_per_buffer=CHUNK,
    )
    frames = []
    recording = [True]

    def read_stdin():
        sys.stdin.readline()
        recording[0] = False

    t = threading.Thread(target=read_stdin)
    t.daemon = True
    t.start()

    while recording[0]:
        try:
            data = stream.read(CHUNK, exception_on_overflow=False)
            frames.append(data)
        except Exception:
            break

    stream.stop_stream()
    stream.close()
    p.terminate()

    if not frames:
        return None
    audio_bytes = b"".join(frames)
    audio_data = sr.AudioData(audio_bytes, RATE, SAMPLE_WIDTH)
    try:
        text = r.recognize_google(audio_data)
        return text.lower().strip()
    except sr.UnknownValueError:
        return None
    except sr.RequestError as e:
        sys.stderr.write("Could not request results; {0}\n".format(e))
        return None


def listen_once():
    """Record once and return recognized text (for Electron integration)."""
    try:
        with sr.Microphone() as source:
            r.adjust_for_ambient_noise(source, duration=0.2)
            audio = r.listen(source)
            text = r.recognize_google(audio)
            return text.lower().strip()
    except sr.RequestError as e:
        sys.stderr.write("Could not request results; {0}\n".format(e))
        return None
    except sr.UnknownValueError:
        return None

def run_loop():
    """Interactive loop (standalone mode)."""
    while True:
        try:
            with sr.Microphone() as source:
                print("Listening...")
                r.adjust_for_ambient_noise(source, duration=0.2)
                audio = r.listen(source)
                text = r.recognize_google(audio)
                text = text.lower()
                print("You said:", text)
                if "exit" in text:
                    print("Exiting program...")
                    break
        except sr.RequestError as e:
            print("Could not request results; {0}".format(e))
        except sr.UnknownValueError:
            print("Could not understand audio")
        except KeyboardInterrupt:
            print("Program terminated by user")
            break

if __name__ == "__main__":
    if "--record-until-stop" in sys.argv:
        result = record_until_stop()
        if result:
            print(result)
        sys.exit(0 if result else 1)
    if "--once" in sys.argv:
        result = listen_once()
        if result:
            print(result)
        sys.exit(0 if result else 1)
    run_loop()