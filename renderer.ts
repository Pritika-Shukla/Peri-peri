interface ElectronAPI {
  sendToPython: (arg: string) => void
  onPythonResponse: (cb: (reply: string) => void) => void
}

const input = document.getElementById('input') as HTMLInputElement
const sendBtn = document.getElementById('send')
const responseEl = document.getElementById('response')
const api = (window as Window & { electronAPI?: ElectronAPI }).electronAPI

if (sendBtn && input && responseEl && api) {
  api.onPythonResponse((reply: string) => {
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
