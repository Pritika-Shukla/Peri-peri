const input = document.getElementById("input")
const sendBtn = document.getElementById("send")
const micBtn = document.getElementById("mic")
const responseEl = document.getElementById("response")
const liveEl = document.getElementById("live")

if (sendBtn && input && responseEl) {
  sendBtn.addEventListener("click", async () => {
    const text = input.value.trim()
    if (!text) return
    if (!window.electronAPI?.askOpenAI) {
      responseEl.textContent = "You said: " + text
      input.value = ""
      return
    }
    responseEl.textContent = "…"
    input.value = ""
    try {
      const reply = await window.electronAPI.askOpenAI(text)
      responseEl.textContent = reply || "(No response)"
    } catch (e) {
      responseEl.textContent = e.message || "Error"
    }
  })
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendBtn.click()
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
        if (text && responseEl) {
          responseEl.textContent = "You said: " + text
          if (input) input.value = text
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
