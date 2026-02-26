const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  sendToPython: (arg: string) => ipcRenderer.send('send-to-python', arg),
  onPythonResponse: (cb: (reply: string) => void) =>
    ipcRenderer.on('python-response', (_: unknown, reply: string) => cb(reply))
})
