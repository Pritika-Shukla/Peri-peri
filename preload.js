const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("electronAPI", {
  askOpenAI: (text) => ipcRenderer.invoke("ask-openai", text),
  startRecording: () => ipcRenderer.invoke("start-recording"),
  stopRecording: () => ipcRenderer.invoke("stop-recording"),
  screenshotAndType: (prompt) => ipcRenderer.invoke("screenshot-respond-and-type", prompt),
  brightnessControl: (action, value) => ipcRenderer.invoke("brightness-control", action, value),
})
