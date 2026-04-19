"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkdownImporter = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class MarkdownImporter {
    constructor(memoryDir) {
        this.memoryDir = memoryDir;
    }
    // 掃描並解析所有 Markdown 記憶
    async importAll() {
        const memories = [];
        // 掃描 memory/ 目錄
        if (!fs_1.default.existsSync(this.memoryDir)) {
            console.warn(`Memory directory not found: ${this.memoryDir}`);
            return memories;
        }
        const files = fs_1.default.readdirSync(this.memoryDir)
            .filter(f => f.endsWith('.md'))
            .sort();
        for (const file of files) {
            const filePath = path_1.default.join(this.memoryDir, file);
            const memory = this.parseMarkdownFile(filePath);
            if (memory) {
                memories.push(memory);
            }
        }
        // 也匯入 MEMORY.md（核心記憶）
        const coreMemoryPath = path_1.default.join(path_1.default.dirname(this.memoryDir), 'MEMORY.md');
        if (fs_1.default.existsSync(coreMemoryPath)) {
            const coreMemory = this.parseMarkdownFile(coreMemoryPath, true);
            if (coreMemory) {
                memories.push(coreMemory);
            }
        }
        return memories;
    }
    // 解析單個 Markdown 檔案
    parseMarkdownFile(filePath, isCore = false) {
        try {
            const content = fs_1.default.readFileSync(filePath, 'utf-8');
            const fileName = path_1.default.basename(filePath, '.md');
            // 從檔名提取日期（YYYY-MM-DD.md）
            let date = fileName;
            if (isCore) {
                date = 'core';
            }
            else if (!/^\d{4}-\d{2}-\d{2}$/.test(fileName)) {
                date = 'unknown';
            }
            // 嘗試從內容提取 metadata
            const metadata = this.extractMetadata(content);
            return {
                id: `mem_${date}_${Date.now()}`,
                date,
                content,
                type: metadata.type,
                concept: metadata.concept,
                files: metadata.files
            };
        }
        catch (error) {
            console.error(`Failed to parse ${filePath}:`, error);
            return null;
        }
    }
    // 從 Markdown 內容提取 metadata
    extractMetadata(content) {
        const metadata = {};
        // 嘗試匹配 **類型：** 格式
        const typeMatch = content.match(/\*\*類型[：:]\*\*\s*([^\n]+)/);
        if (typeMatch) {
            metadata.type = typeMatch[1].trim();
        }
        // 嘗試匹配 **概念：** 格式
        const conceptMatch = content.match(/\*\*概念[：:]\*\*\s*([^\n]+)/);
        if (conceptMatch) {
            metadata.concept = conceptMatch[1].trim();
        }
        // 嘗試匹配 **檔案：** 或 **相關檔案：** 格式
        const filesMatch = content.match(/\*\*(?:相關)?檔案[：:]\*\*\s*([^\n]+)/);
        if (filesMatch) {
            metadata.files = filesMatch[1]
                .split(/[,，]/)
                .map(f => f.trim())
                .filter(f => f.length > 0);
        }
        return metadata;
    }
    // 匯入單個檔案
    async importFile(filePath) {
        return this.parseMarkdownFile(filePath);
    }
}
exports.MarkdownImporter = MarkdownImporter;
//# sourceMappingURL=markdown.js.map