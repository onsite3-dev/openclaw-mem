"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryStore = void 0;
const sql_js_1 = __importDefault(require("sql.js"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class MemoryStore {
    constructor(dbPath) {
        this.db = null;
        this.SQL = null;
        this.dbPath = dbPath;
    }
    async init() {
        // 確保目錄存在
        const dir = path_1.default.dirname(this.dbPath);
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        // 初始化 sql.js
        this.SQL = await (0, sql_js_1.default)();
        // 載入或建立資料庫
        if (fs_1.default.existsSync(this.dbPath)) {
            const buffer = fs_1.default.readFileSync(this.dbPath);
            this.db = new this.SQL.Database(buffer);
        }
        else {
            this.db = new this.SQL.Database();
        }
        this.initDatabase();
        this.save();
    }
    initDatabase() {
        if (!this.db)
            return;
        // 建立 memories 表
        this.db.run(`
      CREATE TABLE IF NOT EXISTS memories (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        content TEXT NOT NULL,
        type TEXT,
        concept TEXT,
        files TEXT,
        created_at INTEGER NOT NULL
      )
    `);
        // 建立索引
        this.db.run(`
      CREATE INDEX IF NOT EXISTS idx_date ON memories(date)
    `);
        this.db.run(`
      CREATE INDEX IF NOT EXISTS idx_type ON memories(type)
    `);
    }
    // 儲存資料庫到檔案
    save() {
        if (!this.db)
            return;
        const data = this.db.export();
        const buffer = Buffer.from(data);
        fs_1.default.writeFileSync(this.dbPath, buffer);
    }
    // 新增記憶
    add(memory) {
        if (!this.db)
            throw new Error('Database not initialized');
        this.db.run(`
      INSERT INTO memories (id, date, content, type, concept, files, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
            memory.id,
            memory.date,
            memory.content,
            memory.type || null,
            memory.concept || null,
            memory.files ? JSON.stringify(memory.files) : null,
            Date.now()
        ]);
        this.save();
    }
    // 批次新增
    addBatch(memories) {
        if (!this.db)
            throw new Error('Database not initialized');
        for (const mem of memories) {
            this.db.run(`
        INSERT INTO memories (id, date, content, type, concept, files, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
                mem.id,
                mem.date,
                mem.content,
                mem.type || null,
                mem.concept || null,
                mem.files ? JSON.stringify(mem.files) : null,
                Date.now()
            ]);
        }
        this.save();
    }
    // 簡單搜索（LIKE 查詢）
    search(query, limit = 10) {
        if (!this.db)
            throw new Error('Database not initialized');
        const stmt = this.db.prepare(`
      SELECT id, date, content
      FROM memories
      WHERE content LIKE ?
      ORDER BY date DESC
      LIMIT ?
    `);
        const searchPattern = `%${query}%`;
        const results = [];
        stmt.bind([searchPattern, limit]);
        while (stmt.step()) {
            const row = stmt.getAsObject();
            const content = row.content;
            // 建立簡單的 snippet
            const lowerContent = content.toLowerCase();
            const lowerQuery = query.toLowerCase();
            const index = lowerContent.indexOf(lowerQuery);
            let snippet = content;
            if (index !== -1) {
                const start = Math.max(0, index - 50);
                const end = Math.min(content.length, index + query.length + 50);
                snippet = '...' + content.slice(start, end) + '...';
            }
            else {
                snippet = content.slice(0, 100) + '...';
            }
            results.push({
                id: row.id,
                date: row.date,
                content: content,
                score: 1.0,
                snippet: snippet
            });
        }
        stmt.free();
        return results;
    }
    // 按日期搜索
    getByDate(date) {
        if (!this.db)
            throw new Error('Database not initialized');
        const stmt = this.db.prepare(`
      SELECT * FROM memories WHERE date = ?
    `);
        stmt.bind([date]);
        if (stmt.step()) {
            const row = stmt.getAsObject();
            stmt.free();
            return {
                id: row.id,
                date: row.date,
                content: row.content,
                type: row.type,
                concept: row.concept,
                files: row.files ? JSON.parse(row.files) : [],
                created_at: row.created_at
            };
        }
        stmt.free();
        return null;
    }
    // 取得所有記憶
    getAll() {
        if (!this.db)
            throw new Error('Database not initialized');
        const stmt = this.db.prepare(`
      SELECT * FROM memories ORDER BY date DESC
    `);
        const results = [];
        while (stmt.step()) {
            const row = stmt.getAsObject();
            results.push({
                id: row.id,
                date: row.date,
                content: row.content,
                type: row.type,
                concept: row.concept,
                files: row.files ? JSON.parse(row.files) : [],
                created_at: row.created_at
            });
        }
        stmt.free();
        return results;
    }
    // 列出所有日期
    listDates() {
        if (!this.db)
            throw new Error('Database not initialized');
        const stmt = this.db.prepare(`
      SELECT DISTINCT date FROM memories 
      WHERE date != 'core' AND date != 'unknown'
      ORDER BY date DESC
    `);
        const dates = [];
        while (stmt.step()) {
            const row = stmt.getAsObject();
            dates.push(row.date);
        }
        stmt.free();
        return dates;
    }
    // 按類型搜索
    searchByType(type) {
        if (!this.db)
            throw new Error('Database not initialized');
        const stmt = this.db.prepare(`
      SELECT * FROM memories WHERE type = ? ORDER BY date DESC
    `);
        stmt.bind([type]);
        const results = [];
        while (stmt.step()) {
            const row = stmt.getAsObject();
            results.push({
                id: row.id,
                date: row.date,
                content: row.content,
                type: row.type,
                concept: row.concept,
                files: row.files ? JSON.parse(row.files) : [],
                created_at: row.created_at
            });
        }
        stmt.free();
        return results;
    }
    // 按概念搜索
    searchByConcept(concept) {
        if (!this.db)
            throw new Error('Database not initialized');
        const stmt = this.db.prepare(`
      SELECT * FROM memories WHERE concept LIKE ? ORDER BY date DESC
    `);
        stmt.bind([`%${concept}%`]);
        const results = [];
        while (stmt.step()) {
            const row = stmt.getAsObject();
            results.push({
                id: row.id,
                date: row.date,
                content: row.content,
                type: row.type,
                concept: row.concept,
                files: row.files ? JSON.parse(row.files) : [],
                created_at: row.created_at
            });
        }
        stmt.free();
        return results;
    }
    // 取得統計資訊
    getStats() {
        if (!this.db)
            throw new Error('Database not initialized');
        const countStmt = this.db.prepare('SELECT COUNT(*) as count FROM memories');
        countStmt.step();
        const count = countStmt.getAsObject().count || 0;
        countStmt.free();
        let size = 0;
        try {
            const stats = fs_1.default.statSync(this.dbPath);
            size = stats.size;
        }
        catch (e) {
            size = 0;
        }
        return {
            totalMemories: count,
            dbSize: size,
            dbPath: this.dbPath
        };
    }
    // 關閉資料庫
    close() {
        if (this.db) {
            this.save();
            this.db.close();
            this.db = null;
        }
    }
}
exports.MemoryStore = MemoryStore;
//# sourceMappingURL=sqlite.js.map