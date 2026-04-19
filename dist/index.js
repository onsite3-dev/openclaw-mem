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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenClawMem = void 0;
const sqlite_1 = require("./store/sqlite");
const markdown_1 = require("./store/markdown");
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
class OpenClawMem {
    constructor(config) {
        this.store = null;
        this.enabled = false;
        const homeDir = os_1.default.homedir();
        this.config = {
            enabled: config?.enabled ?? true,
            dbPath: config?.dbPath ?? path_1.default.join(homeDir, '.openclaw/memory-store/store.db'),
            memoryDir: config?.memoryDir ?? path_1.default.join(homeDir, '.openclaw/workspace/memory')
        };
    }
    // 初始化
    async init() {
        if (!this.config.enabled) {
            console.log('OpenClaw-Mem is disabled');
            return;
        }
        console.log('Initializing OpenClaw-Mem...');
        this.store = new sqlite_1.MemoryStore(this.config.dbPath);
        await this.store.init();
        this.enabled = true;
        console.log('✅ OpenClaw-Mem initialized');
    }
    // 匯入 Markdown 記憶
    async importMarkdown() {
        if (!this.enabled || !this.store) {
            throw new Error('OpenClaw-Mem is not initialized');
        }
        console.log(`Importing memories from ${this.config.memoryDir}...`);
        const importer = new markdown_1.MarkdownImporter(this.config.memoryDir);
        const memories = await importer.importAll();
        console.log(`Found ${memories.length} memories`);
        if (memories.length > 0) {
            this.store.addBatch(memories);
            console.log(`✅ Imported ${memories.length} memories`);
        }
        return memories.length;
    }
    // 搜索
    search(query, limit = 10) {
        if (!this.enabled || !this.store) {
            throw new Error('OpenClaw-Mem is not initialized');
        }
        return this.store.search(query, limit);
    }
    // 列出所有日期
    listDates() {
        if (!this.enabled || !this.store) {
            throw new Error('OpenClaw-Mem is not initialized');
        }
        return this.store.listDates();
    }
    // 按日期查看
    getByDate(date) {
        if (!this.enabled || !this.store) {
            throw new Error('OpenClaw-Mem is not initialized');
        }
        return this.store.getByDate(date);
    }
    // 按類型搜索
    searchByType(type) {
        if (!this.enabled || !this.store) {
            throw new Error('OpenClaw-Mem is not initialized');
        }
        return this.store.searchByType(type);
    }
    // 按概念搜索
    searchByConcept(concept) {
        if (!this.enabled || !this.store) {
            throw new Error('OpenClaw-Mem is not initialized');
        }
        return this.store.searchByConcept(concept);
    }
    // 匯出為 JSON
    exportJSON() {
        if (!this.enabled || !this.store) {
            throw new Error('OpenClaw-Mem is not initialized');
        }
        const memories = this.store.getAll();
        return JSON.stringify(memories, null, 2);
    }
    // 匯出為 Markdown
    exportMarkdown() {
        if (!this.enabled || !this.store) {
            throw new Error('OpenClaw-Mem is not initialized');
        }
        const memories = this.store.getAll();
        let markdown = '# OpenClaw-Mem Export\n\n';
        memories.forEach(mem => {
            markdown += `## ${mem.date}\n\n`;
            if (mem.type)
                markdown += `**類型：** ${mem.type}\n`;
            if (mem.concept)
                markdown += `**概念：** ${mem.concept}\n`;
            if (mem.files && mem.files.length > 0) {
                markdown += `**檔案：** ${mem.files.join(', ')}\n`;
            }
            markdown += `\n${mem.content}\n\n---\n\n`;
        });
        return markdown;
    }
    // 取得統計資訊
    getStats() {
        if (!this.enabled || !this.store) {
            throw new Error('OpenClaw-Mem is not initialized');
        }
        return this.store.getStats();
    }
    // 取得相關記憶
    getRelated(memoryId, limit = 5) {
        if (!this.enabled || !this.store) {
            throw new Error('OpenClaw-Mem is not initialized');
        }
        return this.store.getRelated(memoryId, limit);
    }
    // 標記記憶
    markMemory(memoryId, tags) {
        if (!this.enabled || !this.store) {
            throw new Error('OpenClaw-Mem is not initialized');
        }
        return this.store.markMemory(memoryId, tags);
    }
    // 取得標記的記憶
    getMarkedMemories(tag) {
        if (!this.enabled || !this.store) {
            throw new Error('OpenClaw-Mem is not initialized');
        }
        return this.store.getMarkedMemories(tag);
    }
    // 關閉
    close() {
        if (this.store) {
            this.store.close();
            this.enabled = false;
        }
    }
    // 檢查狀態
    isEnabled() {
        return this.enabled;
    }
}
exports.OpenClawMem = OpenClawMem;
// 匯出類型
__exportStar(require("./store/sqlite"), exports);
__exportStar(require("./store/markdown"), exports);
//# sourceMappingURL=index.js.map