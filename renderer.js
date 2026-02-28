const input = document.getElementById("input")
const sendBtn = document.getElementById("send")
const micBtn = document.getElementById("mic")
const chatEl = document.getElementById("chat")
const liveEl = document.getElementById("live")

function addMessage(role, text) {
  if (!chatEl) return
  const div = document.createElement("div")
  div.className = `msg ${role}`
  div.textContent = text
  chatEl.appendChild(div)
  chatEl.scrollTop = chatEl.scrollHeight
  return div
}

async function sendUserMessage(text) {
  if (!text.trim()) return
  addMessage("user", text.trim())
  input.value = ""

  if (!window.electronAPI?.askOpenAI) {
    addMessage("assistant", "You said: " + text.trim())
    return
  }

  const thinkingEl = addMessage("assistant", "…")
  thinkingEl.classList.add("thinking")
  try {
    const reply = await window.electronAPI.askOpenAI(text.trim())
    thinkingEl.remove()
    addMessage("assistant", reply || "(No response)")
  } catch (e) {
    thinkingEl.remove()
    addMessage("assistant", e.message || "Error")
  }
}

if (sendBtn && input && chatEl) {
  sendBtn.addEventListener("click", () => sendUserMessage(input.value))
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendUserMessage(input.value)
  })
}

if (micBtn) {
  let isRecording = false
  micBtn.addEventListener("click", async () => {
    if (!window.electronAPI?.startRecording) return
    if (!isRecording) {
      await window.electronAPI.startRecording()
      isRecording = true
      micBtn.classList.add("recording")
      if (liveEl) liveEl.textContent = "Recording... click to stop"
    } else {
      if (liveEl) liveEl.textContent = "Converting..."
      try {
        const text = await window.electronAPI.stopRecording()
        if (liveEl) liveEl.textContent = ""
        if (text) {
          if (input) input.value = text
          await sendUserMessage(text)
        } else if (liveEl) {
          liveEl.textContent = "Could not understand audio"
        }
      } catch (e) {
        if (liveEl) liveEl.textContent = e.message || "Error"
      } finally {
        isRecording = false
        micBtn.classList.remove("recording")
      }
    }
  })
}
