# Peri-peri 🌶️

A smart **voice-activated AI assistant** built with **Electron** and **Python**.
Peri-peri listens to voice commands, processes them through an assistant, and performs system tasks like opening apps, taking screenshots, and executing commands.

---

## Features

* **Voice Recognition** — Speech-to-text command processing
* **Wake Word Detection** — Activates using a custom wake word
* **Application Launcher** — Open system apps via voice commands
* **Screen Capture** — Capture and process screen content
* **AI Assistant** — Handles queries and generates responses
* **Modular Architecture** — Easy to extend with new features

---

## Tech Stack

**Frontend**

* Electron
* JavaScript
* HTML / CSS

**Backend**

* Python
* SpeechRecognition
* PyAudio
* Pillow

---

## Project Structure

```
peri-peri/
│
├── main.js
├── preload.js
├── renderer.js
├── index.html
│
├── package.json
├── requirements.txt
│
├── assistant.py
├── speechrecognition.py
├── wakeword.py
├── screencapture.py
├── appopener.py
│
├── features/
├── services/
└── .gitignore
```

---

## Installation

### Prerequisites

* Node.js (v14+)
* Python (v3.8+)
* pip
* Git

### Setup

```bash
git clone https://github.com/Pritika-Shukla/Peri-peri.git
cd Peri-peri
npm install
pip install -r requirements.txt
```

---

## Run

```bash
npm start
```

---

## Example Commands

```
Open Chrome
Take a screenshot
What is the weather?
Set a reminder
```

---

## Configuration

**Wake word**

Edit `wakeword.py` to change the wake word or detection sensitivity.

**Application mapping**

Edit `appopener.py`:

```python
APPLICATIONS = {
    "chrome": "google-chrome",
    "vs code": "code",
    "terminal": "gnome-terminal"
}
```

---


If you want, I can also show you **how to make this README look like a top-tier repo (with badges + demo GIF + architecture diagram)** which will make your GitHub profile look **much stronger to recruiters.**
