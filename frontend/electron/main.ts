import { app, BrowserWindow, ipcMain } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import fetch from 'node-fetch'

// Handle creating/removing shortcuts on Windows when installing/uninstalling
try {
  if (require('electron-squirrel-startup')) {
    app.quit()
  }
} catch (err) {
  // Ignore if module is not found
  console.log('electron-squirrel-startup not found, skipping...')
}

interface WindowState {
  width: number
  height: number
  x?: number
  y?: number
  isMaximized?: boolean
}

const defaultWindowState: WindowState = {
  width: 1200,
  height: 800
}

function getWindowState(): WindowState {
  try {
    const userDataPath = app.getPath('userData')
    const stateFilePath = path.join(userDataPath, 'window-state.json')
    
    if (fs.existsSync(stateFilePath)) {
      const state = JSON.parse(fs.readFileSync(stateFilePath, 'utf8'))
      return { ...defaultWindowState, ...state }
    }
  } catch (err) {
    console.error('Failed to load window state:', err)
  }
  return defaultWindowState
}

function saveWindowState(window: BrowserWindow): void {
  try {
    const state: WindowState = {
      width: window.getBounds().width,
      height: window.getBounds().height,
      x: window.getBounds().x,
      y: window.getBounds().y,
      isMaximized: window.isMaximized()
    }
    
    const userDataPath = app.getPath('userData')
    const stateFilePath = path.join(userDataPath, 'window-state.json')
    fs.writeFileSync(stateFilePath, JSON.stringify(state))
  } catch (err) {
    console.error('Failed to save window state:', err)
  }
}

async function createWindow(): Promise<BrowserWindow> {
  const windowState = getWindowState()

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    ...windowState,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false,
    backgroundColor: '#1a1a1a', // Dark background
    titleBarStyle: 'hidden',
    frame: process.platform !== 'darwin', // Use native frame on macOS
  })

  if (windowState.isMaximized) {
    mainWindow.maximize()
  }

  // Save window state on close
  mainWindow.on('close', () => {
    saveWindowState(mainWindow)
  })

  // Wait for the window to be ready before showing
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    // Open DevTools in development
    if (!app.isPackaged) {
      mainWindow.webContents.openDevTools()
    }
  })

  try {
    // In development, load from Vite dev server
    if (!app.isPackaged) {
      await connectToDevServer(mainWindow)
    } else {
      // In production, load the built index.html
      await mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
    }
  } catch (err) {
    console.error('Failed to load the app:', err)
    app.quit()
  }

  return mainWindow
}

async function connectToDevServer(window: BrowserWindow, retries = 30): Promise<void> {
  const devServerUrl = 'http://localhost:5173'
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(devServerUrl)
      if (response.ok) {
        await window.loadURL(devServerUrl)
        return
      }
    } catch (err) {
      console.log(`Dev server not ready, attempt ${i + 1} of ${retries}...`)
    }
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  throw new Error('Failed to connect to dev server after multiple attempts')
}

// Handle app lifecycle
let mainWindow: BrowserWindow | null = null

app.whenReady().then(async () => {
  mainWindow = await createWindow()

  app.on('activate', async () => {
    // On macOS it's common to re-create a window when the dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = await createWindow()
    } else if (mainWindow) {
      mainWindow.show()
    }
  })

  // Set up IPC handlers
  setupIpcHandlers()
})

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  if (mainWindow) {
    saveWindowState(mainWindow)
  }
})

// Set up IPC handlers
function setupIpcHandlers(): void {
  // Example IPC handler
  ipcMain.handle('get-app-version', () => app.getVersion())

  // Add more IPC handlers as needed
}

// Handle errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason)
})