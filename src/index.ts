import { MemoryStore } from './store/sqlite';
import { MarkdownImporter } from './store/markdown';
import path from 'path';
import os from 'os';

export interface OpenClawMemConfig {
  enabled: boolean;
  dbPath: string;
  memoryDir: string;
}

export class OpenClawMem {
  private store: MemoryStore | null = null;
  private config: OpenClawMemConfig;
  private enabled: boolean = false;

  constructor(config?: Partial<OpenClawMemConfig>) {
    const homeDir = os.homedir();
    
    this.config = {
      enabled: config?.enabled ?? true,
      dbPath: config?.dbPath ?? path.join(homeDir, '.openclaw/memory-store/store.db'),
      memoryDir: config?.memoryDir ?? path.join(homeDir, '.openclaw/workspace/memory')
    };
  }

  // 初始化
  async init(): Promise<void> {
    if (!this.config.enabled) {
      console.log('OpenClaw-Mem is disabled');
      return;
    }

    console.log('Initializing OpenClaw-Mem...');
    this.store = new MemoryStore(this.config.dbPath);
    await this.store.init();
    this.enabled = true;
    console.log('✅ OpenClaw-Mem initialized');
  }

  // 匯入 Markdown 記憶
  async importMarkdown(): Promise<number> {
    if (!this.enabled || !this.store) {
      throw new Error('OpenClaw-Mem is not initialized');
    }

    console.log(`Importing memories from ${this.config.memoryDir}...`);
    
    const importer = new MarkdownImporter(this.config.memoryDir);
    const memories = await importer.importAll();

    console.log(`Found ${memories.length} memories`);
    
    if (memories.length > 0) {
      this.store.addBatch(memories);
      console.log(`✅ Imported ${memories.length} memories`);
    }

    return memories.length;
  }

  // 搜索
  search(query: string, limit: number = 10) {
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
  getByDate(date: string) {
    if (!this.enabled || !this.store) {
      throw new Error('OpenClaw-Mem is not initialized');
    }

    return this.store.getByDate(date);
  }

  // 按類型搜索
  searchByType(type: string) {
    if (!this.enabled || !this.store) {
      throw new Error('OpenClaw-Mem is not initialized');
    }

    return this.store.searchByType(type);
  }

  // 按概念搜索
  searchByConcept(concept: string) {
    if (!this.enabled || !this.store) {
      throw new Error('OpenClaw-Mem is not initialized');
    }

    return this.store.searchByConcept(concept);
  }

  // 匯出為 JSON
  exportJSON(): string {
    if (!this.enabled || !this.store) {
      throw new Error('OpenClaw-Mem is not initialized');
    }

    const memories = this.store.getAll();
    return JSON.stringify(memories, null, 2);
  }

  // 匯出為 Markdown
  exportMarkdown(): string {
    if (!this.enabled || !this.store) {
      throw new Error('OpenClaw-Mem is not initialized');
    }

    const memories = this.store.getAll();
    let markdown = '# OpenClaw-Mem Export\n\n';
    
    memories.forEach(mem => {
      markdown += `## ${mem.date}\n\n`;
      if (mem.type) markdown += `**類型：** ${mem.type}\n`;
      if (mem.concept) markdown += `**概念：** ${mem.concept}\n`;
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
  getRelated(memoryId: string, limit: number = 5) {
    if (!this.enabled || !this.store) {
      throw new Error('OpenClaw-Mem is not initialized');
    }

    return this.store.getRelated(memoryId, limit);
  }

  // 標記記憶
  markMemory(memoryId: string, tags: string[]) {
    if (!this.enabled || !this.store) {
      throw new Error('OpenClaw-Mem is not initialized');
    }

    return this.store.markMemory(memoryId, tags);
  }

  // 取得標記的記憶
  getMarkedMemories(tag: string) {
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
  isEnabled(): boolean {
    return this.enabled;
  }
}

// 匯出類型
export * from './store/sqlite';
export * from './store/markdown';
