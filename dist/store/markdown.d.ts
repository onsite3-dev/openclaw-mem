import { Memory } from './sqlite';
export interface MarkdownMemory {
    date: string;
    content: string;
    metadata?: {
        type?: string;
        concept?: string;
        files?: string[];
    };
}
export declare class MarkdownImporter {
    private memoryDir;
    constructor(memoryDir: string);
    importAll(): Promise<Omit<Memory, 'created_at'>[]>;
    private parseMarkdownFile;
    private extractMetadata;
    importFile(filePath: string): Promise<Omit<Memory, 'created_at'> | null>;
}
//# sourceMappingURL=markdown.d.ts.map