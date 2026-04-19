export declare class MemWatcher {
    private mem;
    private watchDir;
    private watcher;
    private debounceTimer;
    private debounceMs;
    constructor(memoryDir?: string);
    start(): Promise<void>;
    private handleFileChange;
    stop(): void;
}
export default MemWatcher;
//# sourceMappingURL=watcher.d.ts.map