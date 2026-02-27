const input = document.getElementById("input")
const sendBtn = document.getElementById("send")
const micBtn = document.getElementById("mic")
const responseEl = document.getElementById("response")
const liveEl = document.getElementById("live")

if (sendBtn && input && responseEl) {
  sendBtn.addEventListener("click", () => {
    const text = input.value.trim()
    if (text) {
      responseEl.textContent = "You said: " + text
      input.value = ""
    }
  })
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendBtn.click()
  })
}

if (micBtn) {
  micBtn.addEventListener("click", () => {
    micBtn.classList.toggle("recording")
  })
}
