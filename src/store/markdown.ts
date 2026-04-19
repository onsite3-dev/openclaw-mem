import fs from 'fs';
import path from 'path';
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

export class MarkdownImporter {
  private memoryDir: string;

  constructor(memoryDir: string) {
    this.memoryDir = memoryDir;
  }

  // 掃描並解析所有 Markdown 記憶
  async importAll(): Promise<Omit<Memory, 'created_at'>[]> {
    const memories: Omit<Memory, 'created_at'>[] = [];

    // 掃描 memory/ 目錄
    if (!fs.existsSync(this.memoryDir)) {
      console.warn(`Memory directory not found: ${this.memoryDir}`);
      return memories;
    }

    const files = fs.readdirSync(this.memoryDir)
      .filter(f => f.endsWith('.md'))
      .sort();

    for (const file of files) {
      const filePath = path.join(this.memoryDir, file);
      const memory = this.parseMarkdownFile(filePath);
      
      if (memory) {
        memories.push(memory);
      }
    }

    // 也匯入 MEMORY.md（核心記憶）
    const coreMemoryPath = path.join(path.dirname(this.memoryDir), 'MEMORY.md');
    if (fs.existsSync(coreMemoryPath)) {
      const coreMemory = this.parseMarkdownFile(coreMemoryPath, true);
      if (coreMemory) {
        memories.push(coreMemory);
      }
    }

    return memories;
  }

  // 解析單個 Markdown 檔案
  private parseMarkdownFile(filePath: string, isCore: boolean = false): Omit<Memory, 'created_at'> | null {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const fileName = path.basename(filePath, '.md');

      // 從檔名提取日期（YYYY-MM-DD.md）
      let date = fileName;
      if (isCore) {
        date = 'core';
      } else if (!/^\d{4}-\d{2}-\d{2}$/.test(fileName)) {
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
    } catch (error) {
      console.error(`Failed to parse ${filePath}:`, error);
      return null;
    }
  }

  // 從 Markdown 內容提取 metadata
  private extractMetadata(content: string): {
    type?: string;
    concept?: string;
    files?: string[];
  } {
    const metadata: any = {};

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
  async importFile(filePath: string): Promise<Omit<Memory, 'created_at'> | null> {
    return this.parseMarkdownFile(filePath);
  }
}
