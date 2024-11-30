export interface ElectronWindow {
  getAppVersion: () => Promise<string>
  // Add more method types as needed
}

declare global {
  interface Window {
    electron: ElectronWindow
  }
}

export {}
