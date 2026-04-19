import initSqlJs, { Database } from 'sql.js';
import path from 'path';
import fs from 'fs';

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

export class MemoryStore {
  private db: Database | null = null;
  private dbPath: string;
  private SQL: any = null;

  constructor(dbPath: string) {
    this.dbPath = dbPath;
  }

  async init() {
    // 確保目錄存在
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 初始化 sql.js
    this.SQL = await initSqlJs();

    // 載入或建立資料庫
    if (fs.existsSync(this.dbPath)) {
      const buffer = fs.readFileSync(this.dbPath);
      this.db = new this.SQL.Database(buffer);
    } else {
      this.db = new this.SQL.Database();
    }

    this.initDatabase();
    this.save();
  }

  private initDatabase() {
    if (!this.db) return;

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
  private save() {
    if (!this.db) return;
    
    const data = this.db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(this.dbPath, buffer);
  }

  // 新增記憶
  add(memory: Omit<Memory, 'created_at'>): void {
    if (!this.db) throw new Error('Database not initialized');

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
  addBatch(memories: Omit<Memory, 'created_at'>[]): void {
    if (!this.db) throw new Error('Database not initialized');

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
  search(query: string, limit: number = 10): SearchResult[] {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      SELECT id, date, content
      FROM memories
      WHERE content LIKE ?
      ORDER BY date DESC
      LIMIT ?
    `);

    const searchPattern = `%${query}%`;
    const results: SearchResult[] = [];

    stmt.bind([searchPattern, limit]);
    while (stmt.step()) {
      const row = stmt.getAsObject();
      const content = row.content as string;
      
      // 建立簡單的 snippet
      const lowerContent = content.toLowerCase();
      const lowerQuery = query.toLowerCase();
      const index = lowerContent.indexOf(lowerQuery);
      
      let snippet = content;
      if (index !== -1) {
        const start = Math.max(0, index - 50);
        const end = Math.min(content.length, index + query.length + 50);
        snippet = '...' + content.slice(start, end) + '...';
      } else {
        snippet = content.slice(0, 100) + '...';
      }

      results.push({
        id: row.id as string,
        date: row.date as string,
        content: content,
        score: 1.0,
        snippet: snippet
      });
    }

    stmt.free();
    return results;
  }

  // 按日期搜索
  getByDate(date: string): Memory | null {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      SELECT * FROM memories WHERE date = ?
    `);

    stmt.bind([date]);
    
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      
      return {
        id: row.id as string,
        date: row.date as string,
        content: row.content as string,
        type: row.type as string | undefined,
        concept: row.concept as string | undefined,
        files: row.files ? JSON.parse(row.files as string) : [],
        created_at: row.created_at as number
      };
    }

    stmt.free();
    return null;
  }

  // 取得所有記憶
  getAll(): Memory[] {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      SELECT * FROM memories ORDER BY date DESC
    `);

    const results: Memory[] = [];
    
    while (stmt.step()) {
      const row = stmt.getAsObject();
      results.push({
        id: row.id as string,
        date: row.date as string,
        content: row.content as string,
        type: row.type as string | undefined,
        concept: row.concept as string | undefined,
        files: row.files ? JSON.parse(row.files as string) : [],
        created_at: row.created_at as number
      });
    }

    stmt.free();
    return results;
  }

  // 取得統計資訊
  getStats() {
    if (!this.db) throw new Error('Database not initialized');

    const countStmt = this.db.prepare('SELECT COUNT(*) as count FROM memories');
    countStmt.step();
    const count = (countStmt.getAsObject().count as number) || 0;
    countStmt.free();

    let size = 0;
    try {
      const stats = fs.statSync(this.dbPath);
      size = stats.size;
    } catch (e) {
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
