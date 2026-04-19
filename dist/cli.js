#!/usr/bin/env node
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const index_1 = require("./index");
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const fs_1 = __importDefault(require("fs"));
const program = new commander_1.Command();
program
    .name('openclaw-mem')
    .description('OpenClaw Memory System')
    .version('0.3.0');
// init 指令
program
    .command('init')
    .description('Initialize OpenClaw-Mem')
    .action(async () => {
    try {
        const mem = new index_1.OpenClawMem();
        await mem.init();
        console.log('✅ OpenClaw-Mem initialized successfully');
    }
    catch (error) {
        console.error('❌ Initialization failed:', error);
        process.exit(1);
    }
});
// import 指令
program
    .command('import')
    .description('Import memories from Markdown files')
    .option('-d, --dir <directory>', 'Memory directory', path_1.default.join(os_1.default.homedir(), '.openclaw/workspace/memory'))
    .action(async (options) => {
    try {
        const mem = new index_1.OpenClawMem({
            memoryDir: options.dir
        });
        await mem.init();
        const count = await mem.importMarkdown();
        console.log(`✅ Imported ${count} memories`);
        mem.close();
    }
    catch (error) {
        console.error('❌ Import failed:', error);
        process.exit(1);
    }
});
// search 指令
program
    .command('search <query>')
    .description('Search memories')
    .option('-l, --limit <number>', 'Result limit', '10')
    .action(async (query, options) => {
    try {
        const mem = new index_1.OpenClawMem();
        await mem.init();
        const results = mem.search(query, parseInt(options.limit));
        if (results.length === 0) {
            console.log('No results found');
        }
        else {
            console.log(`Found ${results.length} results:\n`);
            results.forEach((result, index) => {
                console.log(`${index + 1}. [${result.date}] (score: ${result.score.toFixed(2)})`);
                console.log(`   ${result.snippet}`);
                console.log('');
            });
        }
        mem.close();
    }
    catch (error) {
        console.error('❌ Search failed:', error);
        process.exit(1);
    }
});
// list 指令
program
    .command('list')
    .description('List all memory dates')
    .action(async () => {
    try {
        const mem = new index_1.OpenClawMem();
        await mem.init();
        const dates = mem.listDates();
        if (dates.length === 0) {
            console.log('No memories found');
        }
        else {
            console.log(`Found ${dates.length} dates:\n`);
            dates.forEach((date, index) => {
                console.log(`${index + 1}. ${date}`);
            });
        }
        mem.close();
    }
    catch (error) {
        console.error('❌ Failed to list dates:', error);
        process.exit(1);
    }
});
// show 指令
program
    .command('show <date>')
    .description('Show memory for a specific date')
    .option('-s, --summary', 'Show summary only (first 500 chars)')
    .action(async (date, options) => {
    try {
        const mem = new index_1.OpenClawMem();
        await mem.init();
        const memory = mem.getByDate(date);
        if (!memory) {
            console.log(`No memory found for date: ${date}`);
        }
        else {
            console.log(`Memory for ${date}:\n`);
            if (memory.type) {
                console.log(`Type: ${memory.type}`);
            }
            if (memory.concept) {
                console.log(`Concept: ${memory.concept}`);
            }
            if (memory.files && memory.files.length > 0) {
                console.log(`Files: ${memory.files.join(', ')}`);
            }
            console.log('\nContent:');
            console.log('---');
            if (options.summary) {
                console.log(memory.content.slice(0, 500) + '...');
            }
            else {
                console.log(memory.content);
            }
        }
        mem.close();
    }
    catch (error) {
        console.error('❌ Failed to show memory:', error);
        process.exit(1);
    }
});
// filter 指令
program
    .command('filter')
    .description('Filter memories by type or concept')
    .option('-t, --type <type>', 'Filter by type')
    .option('-c, --concept <concept>', 'Filter by concept')
    .option('-l, --limit <number>', 'Result limit', '10')
    .action(async (options) => {
    try {
        const mem = new index_1.OpenClawMem();
        await mem.init();
        let results = [];
        if (options.type) {
            results = mem.searchByType(options.type);
        }
        else if (options.concept) {
            results = mem.searchByConcept(options.concept);
        }
        else {
            console.log('Please specify --type or --concept');
            mem.close();
            return;
        }
        const limit = parseInt(options.limit);
        const limited = results.slice(0, limit);
        if (limited.length === 0) {
            console.log('No results found');
        }
        else {
            console.log(`Found ${results.length} results (showing ${limited.length}):\n`);
            limited.forEach((result, index) => {
                console.log(`${index + 1}. [${result.date}]`);
                if (result.type)
                    console.log(`   Type: ${result.type}`);
                if (result.concept)
                    console.log(`   Concept: ${result.concept}`);
                console.log(`   ${result.content.slice(0, 100)}...`);
                console.log('');
            });
        }
        mem.close();
    }
    catch (error) {
        console.error('❌ Failed to filter:', error);
        process.exit(1);
    }
});
// export 指令
program
    .command('export')
    .description('Export memories')
    .option('-f, --format <format>', 'Export format (json|markdown)', 'json')
    .option('-o, --output <file>', 'Output file')
    .action(async (options) => {
    try {
        const mem = new index_1.OpenClawMem();
        await mem.init();
        let content;
        if (options.format === 'markdown' || options.format === 'md') {
            content = mem.exportMarkdown();
        }
        else {
            content = mem.exportJSON();
        }
        if (options.output) {
            fs_1.default.writeFileSync(options.output, content, 'utf-8');
            console.log(`✅ Exported to ${options.output}`);
        }
        else {
            console.log(content);
        }
        mem.close();
    }
    catch (error) {
        console.error('❌ Failed to export:', error);
        process.exit(1);
    }
});
// status 指令
program
    .command('status')
    .description('Show OpenClaw-Mem status')
    .action(async () => {
    try {
        const mem = new index_1.OpenClawMem();
        await mem.init();
        const stats = mem.getStats();
        console.log('OpenClaw-Mem Status:');
        console.log(`  Total Memories: ${stats.totalMemories}`);
        console.log(`  Database Size: ${(stats.dbSize / 1024).toFixed(2)} KB`);
        console.log(`  Database Path: ${stats.dbPath}`);
        mem.close();
    }
    catch (error) {
        console.error('❌ Failed to get status:', error);
        process.exit(1);
    }
});
// watch 指令 - 監控記憶目錄自動同步
program
    .command('watch')
    .description('Watch memory directory for changes and auto-sync')
    .option('-d, --dir <directory>', 'Memory directory to watch')
    .action(async (options) => {
    try {
        const { MemWatcher } = await Promise.resolve().then(() => __importStar(require('./watcher')));
        const watcher = new MemWatcher(options.dir);
        await watcher.start();
    }
    catch (error) {
        console.error('❌ Failed to start watcher:', error);
        process.exit(1);
    }
});
// mark 指令 - 標記記憶
program
    .command('mark <date>')
    .description('Mark a memory with tags')
    .option('-t, --tags <tags...>', 'Tags to add (space separated)')
    .action(async (date, options) => {
    try {
        const mem = new index_1.OpenClawMem();
        await mem.init();
        if (!options.tags || options.tags.length === 0) {
            console.log('❌ Please provide at least one tag');
            mem.close();
            return;
        }
        // 取得記憶 ID
        const memory = mem.getByDate(date);
        if (!memory) {
            console.log(`❌ No memory found for date: ${date}`);
            mem.close();
            return;
        }
        mem.markMemory(memory.id, options.tags);
        console.log(`✅ Marked ${date} with tags: ${options.tags.join(', ')}`);
        mem.close();
    }
    catch (error) {
        console.error('❌ Failed to mark:', error);
        process.exit(1);
    }
});
// marked 指令 - 查看標記的記憶
program
    .command('marked <tag>')
    .description('Show memories marked with a specific tag')
    .action(async (tag) => {
    try {
        const mem = new index_1.OpenClawMem();
        await mem.init();
        const results = mem.getMarkedMemories(tag);
        if (results.length === 0) {
            console.log(`No memories marked with: ${tag}`);
        }
        else {
            console.log(`Found ${results.length} memories marked with "${tag}":\n`);
            results.forEach((result, index) => {
                console.log(`${index + 1}. [${result.date}]`);
                console.log(`   ${result.content.slice(0, 100)}...`);
                console.log('');
            });
        }
        mem.close();
    }
    catch (error) {
        console.error('❌ Failed to show marked memories:', error);
        process.exit(1);
    }
});
program.parse();
//# sourceMappingURL=cli.js.map