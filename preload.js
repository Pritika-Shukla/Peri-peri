const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  sendToPython: (arg) => ipcRenderer.send('send-to-python', arg),
  onPythonResponse: (cb) =>
    ipcRenderer.on('python-response', (_, reply) => cb(reply))
})
