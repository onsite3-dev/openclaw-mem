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
    listDates(): string[];
    getByDate(date: string): import("./store/sqlite").Memory | null;
    searchByType(type: string): import("./store/sqlite").Memory[];
    searchByConcept(concept: string): import("./store/sqlite").Memory[];
    exportJSON(): string;
    exportMarkdown(): string;
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