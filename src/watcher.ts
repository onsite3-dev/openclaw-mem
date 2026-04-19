import { OpenClawMem } from './index';
import { watch } from 'fs';
import path from 'path';
import os from 'os';

export class MemWatcher {
  private mem: OpenClawMem;
  private watchDir: string;
  private watcher: any;
  private debounceTimer: NodeJS.Timeout | null = null;
  private debounceMs: number = 2000; // 2 秒防抖

  constructor(memoryDir?: string) {
    const homeDir = os.homedir();
    this.watchDir = memoryDir || path.join(homeDir, '.openclaw/workspace/memory');
    this.mem = new OpenClawMem({ memoryDir: this.watchDir });
  }

  async start() {
    await this.mem.init();
    console.log(`👀 Watching ${this.watchDir} for changes...`);

    this.watcher = watch(this.watchDir, { recursive: true }, (eventType, filename) => {
      if (!filename) return;
      
      // 只處理 .md 檔案
      if (!filename.endsWith('.md')) return;

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

  private async handleFileChange(filename: string) {
    try {
      console.log(`🔄 Syncing ${filename}...`);
      const count = await this.mem.importMarkdown();
      console.log(`✅ Synced ${count} memories`);
    } catch (error) {
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

export default MemWatcher;
