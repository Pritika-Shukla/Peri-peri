import path from "path"
import { fileURLToPath } from "url"
import { app, BrowserWindow, globalShortcut, screen } from "electron"

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

app.whenReady().then(() => {
  createWindow()
  globalShortcut.register("F9", toggleWindow)
})

app.on("will-quit", () => {
  globalShortcut.unregisterAll()
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit()
})