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

  // 列出所有日期
  listDates(): string[] {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      SELECT DISTINCT date FROM memories 
      WHERE date != 'core' AND date != 'unknown'
      ORDER BY date DESC
    `);

    const dates: string[] = [];
    
    while (stmt.step()) {
      const row = stmt.getAsObject();
      dates.push(row.date as string);
    }

    stmt.free();
    return dates;
  }

  // 按類型搜索
  searchByType(type: string): Memory[] {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      SELECT * FROM memories WHERE type = ? ORDER BY date DESC
    `);

    stmt.bind([type]);
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

  // 按概念搜索
  searchByConcept(concept: string): Memory[] {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      SELECT * FROM memories WHERE concept LIKE ? ORDER BY date DESC
    `);

    stmt.bind([`%${concept}%`]);
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

  // 取得相關記憶（基於內容相似度）
  getRelated(memoryId: string, limit: number = 5): Memory[] {
    if (!this.db) throw new Error('Database not initialized');

    // 先取得目標記憶
    const targetStmt = this.db.prepare('SELECT * FROM memories WHERE id = ?');
    targetStmt.bind([memoryId]);
    
    let target: Memory | null = null;
    if (targetStmt.step()) {
      const row = targetStmt.getAsObject();
      target = {
        id: row.id as string,
        date: row.date as string,
        content: row.content as string,
        type: row.type as string | undefined,
        concept: row.concept as string | undefined,
        files: row.files ? JSON.parse(row.files as string) : [],
        created_at: row.created_at as number
      };
    }
    targetStmt.free();

    if (!target) return [];

    // 提取關鍵詞
    const keywords = target.content
      .split(/\s+/)
      .filter(w => w.length > 2)
      .slice(0, 10);

    if (keywords.length === 0) return [];

    // 搜索包含相似關鍵詞的記憶
    const keyword = keywords[0];
    const stmt = this.db.prepare(`
      SELECT * FROM memories 
      WHERE id != ? 
      AND content LIKE ?
      ORDER BY date DESC
      LIMIT ?
    `);

    stmt.bind([memoryId, `%${keyword}%`, limit]);
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

  // 標記記憶
  markMemory(memoryId: string, tags: string[]): void {
    if (!this.db) throw new Error('Database not initialized');

    // 檢查 tags 欄位是否存在
    const checkStmt = this.db.prepare("PRAGMA table_info(memories)");
    let hasTagsColumn = false;
    
    while (checkStmt.step()) {
      const row = checkStmt.getAsObject();
      if (row.name === 'tags') {
        hasTagsColumn = true;
        break;
      }
    }
    checkStmt.free();

    // 如果沒有 tags 欄位，先加入
    if (!hasTagsColumn) {
      this.db.exec("ALTER TABLE memories ADD COLUMN tags TEXT");
      this.save();
    }

    // 更新標記
    const stmt = this.db.prepare(`
      UPDATE memories SET tags = ? WHERE id = ?
    `);
    
    stmt.bind([JSON.stringify(tags), memoryId]);
    stmt.step();
    stmt.free();

    this.save();
  }

  // 取得標記的記憶
  getMarkedMemories(tag: string): Memory[] {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      SELECT * FROM memories 
      WHERE tags LIKE ?
      ORDER BY date DESC
    `);

    stmt.bind([`%"${tag}"%`]);
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

  // 關閉資料庫
  close() {
    if (this.db) {
      this.save();
      this.db.close();
      this.db = null;
    }
  }
}
