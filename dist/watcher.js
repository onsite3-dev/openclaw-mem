"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemWatcher = void 0;
const index_1 = require("./index");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
class MemWatcher {
    constructor(memoryDir) {
        this.debounceTimer = null;
        this.debounceMs = 2000; // 2 秒防抖
        const homeDir = os_1.default.homedir();
        this.watchDir = memoryDir || path_1.default.join(homeDir, '.openclaw/workspace/memory');
        this.mem = new index_1.OpenClawMem({ memoryDir: this.watchDir });
    }
    async start() {
        await this.mem.init();
        console.log(`👀 Watching ${this.watchDir} for changes...`);
        this.watcher = (0, fs_1.watch)(this.watchDir, { recursive: true }, (eventType, filename) => {
            if (!filename)
                return;
            // 只處理 .md 檔案
            if (!filename.endsWith('.md'))
                return;
            console.log(`📝 Detected ${eventType}: ${filename}`);
            // 防抖：避免短時間內多次觸發
            if (this.debounceTimer) {
                clearTimeout(this.debounceTimer);
            }
            this.debounceTimer = setTimeout(() => {
                this.handleFileChange(filename);
            }, this.debounceMs);
        });
        console.log('✅ MemWatcher started');
        console.log('   Press Ctrl+C to stop');
    }
    async handleFileChange(filename) {
        try {
            console.log(`🔄 Syncing ${filename}...`);
            const count = await this.mem.importMarkdown();
            console.log(`✅ Synced ${count} memories`);
        }
        catch (error) {
            console.error(`❌ Sync failed:`, error);
        }
    }
    stop() {
        if (this.watcher) {
            this.watcher.close();
            console.log('👋 MemWatcher stopped');
        }
        this.mem.close();
    }
}
exports.MemWatcher = MemWatcher;
// CLI 使用
if (require.main === module) {
    const watcher = new MemWatcher();
    watcher.start().catch(error => {
        console.error('❌ Failed to start watcher:', error);
        process.exit(1);
    });
    // 處理優雅關閉
    process.on('SIGINT', () => {
        console.log('\n📴 Shutting down...');
        watcher.stop();
        process.exit(0);
    });
    process.on('SIGTERM', () => {
        watcher.stop();
        process.exit(0);
    });
}
exports.default = MemWatcher;
//# sourceMappingURL=watcher.js.map