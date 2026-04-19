export interface OpenClawMemConfig {
    enabled: boolean;
    dbPath: string;
    memoryDir: string;
}
export declare class OpenClawMem {
    private store;
    private config;
    private enabled;
    constructor(config?: Partial<OpenClawMemConfig>);
    init(): Promise<void>;
    importMarkdown(): Promise<number>;
    search(query: string, limit?: number): import("./store/sqlite").SearchResult[];
    getStats(): {
        totalMemories: number;
        dbSize: number;
        dbPath: string;
    };
    close(): void;
    isEnabled(): boolean;
}
export * from './store/sqlite';
export * from './store/markdown';
//# sourceMappingURL=index.d.ts.map