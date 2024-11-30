declare global {
    interface Window {
        electron: {
            getAppVersion: () => Promise<string>;
        };
    }
}
export {};
//# sourceMappingURL=preload.d.ts.map