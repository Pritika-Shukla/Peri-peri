const input = document.getElementById('input')
const sendBtn = document.getElementById('send')
const responseEl = document.getElementById('response')
const api = window.electronAPI

if (sendBtn && input && responseEl && api) {
  api.onPythonResponse((reply) => {
    responseEl.textContent = reply
  })
  sendBtn.addEventListener('click', () => {
    const text = input.value.trim()
    if (text) {
      api.sendToPython(text)
      input.value = ''
    }
  })
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      sendBtn.click()
    }
  })
}
