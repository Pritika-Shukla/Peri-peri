import dotenv from "dotenv";
dotenv.config();
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { app, BrowserWindow, globalShortcut, screen, ipcMain, clipboard } from "electron"
import { spawn } from "child_process"
import { ask as askOpenAI, askWithScreenshot } from "./services/openai.js"

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
let assistantProcess = null
let assistantPending = null

function startAssistant() {
  if (assistantProcess) return
  const scriptPath = path.join(__dirname, "assistant.py")
  assistantProcess = spawn("python", [scriptPath], {
    cwd: __dirname,
    stdio: ["pipe", "pipe", "pipe"],
  })
  let buffer = ""
  assistantProcess.stdout.on("data", (chunk) => {
    buffer += chunk.toString()
    const lines = buffer.split("\n")
    buffer = lines.pop() || ""
    for (const line of lines) {
      if (!line.trim() || !assistantPending) continue
      let data = null
      try {
        data = JSON.parse(line)
      } catch {
        const lastBrace = line.lastIndexOf("}")
        if (lastBrace !== -1) {
          try {
            const start = line.lastIndexOf("{", lastBrace)
            if (start !== -1) data = JSON.parse(line.slice(start, lastBrace + 1))
          } catch {}
        }
      }
      if (data && ("reply" in data || "fallback" in data)) {
        assistantPending.resolve(data)
        assistantPending = null
      }
    }
  })
  assistantProcess.stderr.on("data", (chunk) => {
    console.error("[assistant]", chunk.toString())
  })
  assistantProcess.on("close", (code) => {
    assistantProcess = null
    if (assistantPending) {
      assistantPending.resolve({ fallback: true })
      assistantPending = null
    }
    if (code !== 0 && code !== null) {
      console.warn("[assistant] process exited with code", code)
    }
  })
}

function askAssistant(message) {
  return new Promise((resolve) => {
    if (!assistantProcess || !assistantProcess.stdin.writable) {
      resolve({ fallback: true })
      return
    }
    assistantPending = { resolve }
    assistantProcess.stdin.write(JSON.stringify({ message }) + "\n")
    setTimeout(() => {
      if (assistantPending) {
        assistantPending.resolve({ fallback: true })
        assistantPending = null
      }
    }, 15000)
  })
}

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

const DEFAULT_SCREENSHOT_PROMPT = [
  "Analyze this screenshot of my screen.",
  "Identify the active text input area, reply box, or composition field that needs content.",
  "Based on the visible context (emails, chats, forms, documents, etc.),",
  "generate an appropriate, natural response for that field.",
  "Output ONLY the response text — no explanations, no labels, no quotation marks.",
].join(" ")

function takeScreenshot() {
  return new Promise((resolve) => {
    const scriptPath = path.join(__dirname, "screencapture.py")
    const proc = spawn("python", [scriptPath], { cwd: __dirname })
    let stdout = ""
    proc.stdout.on("data", (chunk) => { stdout += chunk })
    proc.stderr.on("data", (chunk) => {
      console.error("[screencapture]", chunk.toString())
    })
    proc.on("close", () => {
      try {
        const data = JSON.parse(stdout.trim())
        resolve(data.error ? null : data.path)
      } catch {
        resolve(null)
      }
    })
  })
}

function simulatePaste() {
  return new Promise((resolve) => {
    const scriptPath = path.join(__dirname, "autotype.py")
    const proc = spawn("python", [scriptPath], { cwd: __dirname })
    proc.on("close", () => resolve())
  })
}

async function screenshotRespondAndType(userPrompt) {
  const wasVisible = mainWindow?.isVisible()
  if (wasVisible) mainWindow.hide()

  await new Promise((r) => setTimeout(r, 500))

  const screenshotPath = await takeScreenshot()
  if (!screenshotPath) throw new Error("Screenshot capture failed")

  let base64Image
  try {
    base64Image = fs.readFileSync(screenshotPath).toString("base64")
  } finally {
    try { fs.unlinkSync(screenshotPath) } catch {}
  }

  const prompt = userPrompt?.trim() || DEFAULT_SCREENSHOT_PROMPT
  const response = await askWithScreenshot(prompt, base64Image)
  if (!response) throw new Error("AI returned an empty response")

  clipboard.writeText(response)
  await simulatePaste()

  return response
}

ipcMain.handle("screenshot-respond-and-type", async (_, userPrompt) => {
  try {
    return await screenshotRespondAndType(userPrompt)
  } catch (e) {
    throw new Error(e.message || "Screenshot workflow failed")
  }
})

ipcMain.handle("ask-openai", async (_, text) => {
  try {
    const result = await askAssistant(text)
    if (result.fallback) {
      const screenshotPath = await takeScreenshot()
      if (screenshotPath) {
        let base64Image
        try {
          base64Image = fs.readFileSync(screenshotPath).toString("base64")
        } finally {
          try { fs.unlinkSync(screenshotPath) } catch {}
        }
        return await askWithScreenshot(text, base64Image)
      }
      return await askOpenAI(text)
    }
    return result.reply ?? ""
  } catch (e) {
    throw new Error(e.message || "OpenAI request failed")
  }
})

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
  globalShortcut.register("F10", async () => {
    let userPrompt = ""
    if (mainWindow?.isVisible()) {
      try {
        userPrompt = await mainWindow.webContents.executeJavaScript(
          'document.getElementById("input")?.value || ""'
        )
      } catch {}
    }
    try {
      await screenshotRespondAndType(userPrompt)
    } catch (e) {
      console.error("[screenshot-workflow]", e.message)
    }
  })
  startAssistant()
  startWakeWordListener()
})

app.on("will-quit", () => {
  globalShortcut.unregisterAll()
  if (assistantProcess) {
    assistantProcess.kill()
    assistantProcess = null
  }
  if (wakeWordProcess) {
    wakeWordProcess.kill()
    wakeWordProcess = null
  }
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit()
})