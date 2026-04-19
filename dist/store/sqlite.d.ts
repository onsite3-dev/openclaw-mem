export interface Memory {
    id: string;
    date: string;
    content: string;
    type?: string;
    concept?: string;
    files?: string[];
    created_at: number;
}
export interface SearchResult {
    id: string;
    date: string;
    content: string;
    score: number;
    snippet: string;
}
export declare class MemoryStore {
    private db;
    private dbPath;
    private SQL;
    constructor(dbPath: string);
    init(): Promise<void>;
    private initDatabase;
    private save;
    add(memory: Omit<Memory, 'created_at'>): void;
    addBatch(memories: Omit<Memory, 'created_at'>[]): void;
    search(query: string, limit?: number): SearchResult[];
    getByDate(date: string): Memory | null;
    getAll(): Memory[];
    getStats(): {
        totalMemories: number;
        dbSize: number;
        dbPath: string;
    };
    close(): void;
}
//# sourceMappingURL=sqlite.d.ts.map