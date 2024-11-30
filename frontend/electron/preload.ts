import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron',
  {
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    // Add more methods as needed
  }
)

// Declare the exposed API in a separate .d.ts file
declare global {
  interface Window {
    electron: {
      getAppVersion: () => Promise<string>
      // Add more method types as needed
    }
  }
}
