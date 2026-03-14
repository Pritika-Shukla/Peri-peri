# peri-pero

A desktop voice assistant that lives in a small bar at the top of your screen. Say the wake word or press **F9** to bring it up, then type or talk. It handles volume and apps on your PC; for everything else it uses OpenAI, and can look at your screen to suggest replies.

---

## What you can do

- **Show it anytime** — Press **F9** or say the wake word. The window hides when you click away.
- **Type or speak** — Type in the box and hit Enter, or click the mic, speak, then click again to send. Your words (or transcript) go to the assistant.
- **Control volume** — Say things like “volume to 70”, “increase volume”, “decrease volume”, “mute”, “unmute”. No API needed.
- **Open and close apps** — “Open Notepad”, “close Chrome”, etc. Uses app names you’d see in the taskbar.
- **Ask anything else** — Questions or requests that aren’t volume or apps go to OpenAI. The app can include a screenshot for context when that helps.
- **Quick replies from your screen** — Press **F10**: it captures your screen, sends it (and any prompt you typed) to the AI, then pastes the suggested reply into whatever’s focused (email, chat, etc.).

---

## What you need

- **Node.js** and **Python 3** on your machine.
- An **OpenAI API key** in a `.env` file if you want AI and screenshot features:
  ```
  OPENAI_API_KEY=sk-...
  ```

## Get started

```bash
npm install
pip install -r requirements.txt
npm start
```

| Key | Action |
|-----|--------|
| **F9** | Show or hide the assistant window |
| **F10** | Screenshot → AI suggests reply → paste into focused app |

---

## License

ISC
