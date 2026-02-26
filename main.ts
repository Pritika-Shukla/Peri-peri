const { app, BrowserWindow, ipcMain } = require('electron')
const { spawn } = require('child_process')
const path = require('path')
import type { ChildProcess } from 'child_process'

let pyProcess: ChildProcess | undefined

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  pyProcess = spawn('python', ['assistant.py'])

  createWindow()

  ipcMain.on('send-to-python', (_event: unknown, arg: string) => {
    pyProcess!.stdin!.write(JSON.stringify({ message: arg }) + '\n')
  })

  pyProcess!.stdout!.on('data', (data: Buffer | string) => {
    const result = JSON.parse(data.toString())
    BrowserWindow.getAllWindows()[0].webContents.send('python-response', result.reply)
  })
})