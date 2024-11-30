"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const node_fetch_1 = __importDefault(require("node-fetch"));
// Handle creating/removing shortcuts on Windows when installing/uninstalling
try {
    if (require('electron-squirrel-startup')) {
        electron_1.app.quit();
    }
}
catch (err) {
    // Ignore if module is not found
    console.log('electron-squirrel-startup not found, skipping...');
}
const defaultWindowState = {
    width: 1200,
    height: 800
};
function getWindowState() {
    try {
        const userDataPath = electron_1.app.getPath('userData');
        const stateFilePath = path.join(userDataPath, 'window-state.json');
        if (fs.existsSync(stateFilePath)) {
            const state = JSON.parse(fs.readFileSync(stateFilePath, 'utf8'));
            return { ...defaultWindowState, ...state };
        }
    }
    catch (err) {
        console.error('Failed to load window state:', err);
    }
    return defaultWindowState;
}
function saveWindowState(window) {
    try {
        const state = {
            width: window.getBounds().width,
            height: window.getBounds().height,
            x: window.getBounds().x,
            y: window.getBounds().y,
            isMaximized: window.isMaximized()
        };
        const userDataPath = electron_1.app.getPath('userData');
        const stateFilePath = path.join(userDataPath, 'window-state.json');
        fs.writeFileSync(stateFilePath, JSON.stringify(state));
    }
    catch (err) {
        console.error('Failed to save window state:', err);
    }
}
async function createWindow() {
    const windowState = getWindowState();
    // Create the browser window.
    const mainWindow = new electron_1.BrowserWindow({
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
    });
    if (windowState.isMaximized) {
        mainWindow.maximize();
    }
    // Save window state on close
    mainWindow.on('close', () => {
        saveWindowState(mainWindow);
    });
    // Wait for the window to be ready before showing
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        // Open DevTools in development
        if (!electron_1.app.isPackaged) {
            mainWindow.webContents.openDevTools();
        }
    });
    try {
        // In development, load from Vite dev server
        if (!electron_1.app.isPackaged) {
            await connectToDevServer(mainWindow);
        }
        else {
            // In production, load the built index.html
            await mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
        }
    }
    catch (err) {
        console.error('Failed to load the app:', err);
        electron_1.app.quit();
    }
    return mainWindow;
}
async function connectToDevServer(window, retries = 30) {
    const devServerUrl = 'http://localhost:5173';
    for (let i = 0; i < retries; i++) {
        try {
            const response = await (0, node_fetch_1.default)(devServerUrl);
            if (response.ok) {
                await window.loadURL(devServerUrl);
                return;
            }
        }
        catch (err) {
            console.log(`Dev server not ready, attempt ${i + 1} of ${retries}...`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    throw new Error('Failed to connect to dev server after multiple attempts');
}
// Handle app lifecycle
let mainWindow = null;
electron_1.app.whenReady().then(async () => {
    mainWindow = await createWindow();
    electron_1.app.on('activate', async () => {
        // On macOS it's common to re-create a window when the dock icon is clicked
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            mainWindow = await createWindow();
        }
        else if (mainWindow) {
            mainWindow.show();
        }
    });
    // Set up IPC handlers
    setupIpcHandlers();
});
// Quit when all windows are closed, except on macOS
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('before-quit', () => {
    if (mainWindow) {
        saveWindowState(mainWindow);
    }
});
// Set up IPC handlers
function setupIpcHandlers() {
    // Example IPC handler
    electron_1.ipcMain.handle('get-app-version', () => electron_1.app.getVersion());
    // Add more IPC handlers as needed
}
// Handle errors
process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled rejection at:', promise, 'reason:', reason);
});
