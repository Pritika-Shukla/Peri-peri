import path from "path"
import { fileURLToPath } from "url"
import { app, BrowserWindow, globalShortcut, screen, ipcMain } from "electron"
import { spawn } from "child_process"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let mainWindow = null

function createWindow() {
  const { width } = screen.getPrimaryDisplay().workAreaSize

  mainWindow = new BrowserWindow({
    width: 520,
    height: 220,
    x: Math.floor((width - 520) / 2),
    y: 0,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    show: false,
    resizable: false,
    transparent: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  })

  mainWindow.loadFile(path.join(__dirname, "index.html"))

  mainWindow.on("blur", () => {
    mainWindow.hide()
  })
}

function toggleWindow() {
  if (!mainWindow) return

  if (mainWindow.isVisible()) {
    mainWindow.hide()
  } else {
    mainWindow.show()
    mainWindow.focus()
  }
}

let recordingProcess = null
let wakeWordProcess = null

function startWakeWordListener() {
  if (wakeWordProcess) return
  const scriptPath = path.join(__dirname, "wakeword.py")
  wakeWordProcess = spawn("python", [scriptPath], {
    cwd: __dirname,
    stdio: ["ignore", "pipe", "pipe"],
  })
  let buffer = ""
  wakeWordProcess.stdout.on("data", (chunk) => {
    buffer += chunk.toString()
    const lines = buffer.split("\n")
    buffer = lines.pop() || ""
    for (const line of lines) {
      if (line.trim() === "WAKE" && mainWindow) {
        if (!mainWindow.isVisible()) {
          mainWindow.show()
          mainWindow.focus()
        }
      }
    }
  })
  wakeWordProcess.stderr.on("data", (chunk) => {
    console.error("[wakeword]", chunk.toString())
  })
  wakeWordProcess.on("close", (code) => {
    wakeWordProcess = null
    if (code !== 0 && code !== null) {
      console.warn("[wakeword] process exited with code", code)
    }
  })
}

ipcMain.handle("start-recording", () => {
  if (recordingProcess) return
  const scriptPath = path.join(__dirname, "speechrecognition.py")
  recordingProcess = spawn("python", [scriptPath, "--record-until-stop"], {
    cwd: __dirname,
    stdio: ["pipe", "pipe", "pipe"],
  })
  return true
})

ipcMain.handle("stop-recording", async () => {
  if (!recordingProcess) return null
  return new Promise((resolve) => {
    let stdout = ""
    let stderr = ""
    recordingProcess.stdout.on("data", (chunk) => { stdout += chunk })
    recordingProcess.stderr.on("data", (chunk) => { stderr += chunk })
    recordingProcess.on("close", (code) => {
      recordingProcess = null
      const text = stdout.trim()
      if (code === 0 && text) resolve(text)
      else resolve(null)
    })
    recordingProcess.stdin.write("stop\n")
    recordingProcess.stdin.end()
  })
})

app.whenReady().then(() => {
  createWindow()
  globalShortcut.register("F9", toggleWindow)
  startWakeWordListener()
})

app.on("will-quit", () => {
  globalShortcut.unregisterAll()
  if (wakeWordProcess) {
    wakeWordProcess.kill()
    wakeWordProcess = null
  }
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit()
})