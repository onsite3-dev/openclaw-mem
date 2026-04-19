/**
 * OpenClaw-Mem Configuration
 * 
 * 獨立配置檔，不干擾 OpenClaw 核心設定
 * 位置：~/.openclaw/openclaw-mem.json
 */

export interface OpenClawMemUserConfig {
  enabled?: boolean;
  autoSync?: boolean;
  syncInterval?: number;  // 秒
  dbPath?: string;
  memoryDir?: string;
  telegram?: {
    enabled?: boolean;
    botToken?: string;
  };
}

export const DEFAULT_CONFIG: Required<OpenClawMemUserConfig> = {
  enabled: true,
  autoSync: false,
  syncInterval: 300,  // 5 分鐘
  dbPath: '~/.openclaw/memory-store/store.db',
  memoryDir: '~/.openclaw/workspace/memory',
  telegram: {
    enabled: false,
    botToken: ''
  }
};

import fs from 'fs';
import path from 'path';
import os from 'os';

export class ConfigManager {
  private configPath: string;
  private config: Required<OpenClawMemUserConfig>;

  constructor(configPath?: string) {
    const homeDir = os.homedir();
    this.configPath = configPath || path.join(homeDir, '.openclaw/openclaw-mem.json');
    this.config = DEFAULT_CONFIG;
  }

  // 載入配置
  load(): Required<OpenClawMemUserConfig> {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, 'utf-8');
        const userConfig = JSON.parse(data);
        
        // 合併預設配置
        this.config = {
          ...DEFAULT_CONFIG,
          ...userConfig,
          telegram: {
            ...DEFAULT_CONFIG.telegram,
            ...(userConfig.telegram || {})
          }
        };
        
        // 展開 ~ 路徑
        if (this.config.dbPath.startsWith('~')) {
          this.config.dbPath = this.config.dbPath.replace('~', os.homedir());
        }
        if (this.config.memoryDir.startsWith('~')) {
          this.config.memoryDir = this.config.memoryDir.replace('~', os.homedir());
        }
      }
    } catch (error) {
      console.warn('Failed to load config, using defaults:', error);
    }
    
    return this.config;
  }

  // 儲存配置
  save(config: Partial<OpenClawMemUserConfig>): void {
    try {
      // 合併現有配置
      this.config = {
        ...this.config,
        ...config,
        telegram: {
          ...this.config.telegram,
          ...(config.telegram || {})
        }
      };

      // 確保目錄存在
      const dir = path.dirname(this.configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // 寫入檔案
      fs.writeFileSync(
        this.configPath,
        JSON.stringify(this.config, null, 2),
        'utf-8'
      );
    } catch (error) {
      throw new Error(`Failed to save config: ${error}`);
    }
  }

  // 取得配置
  get(): Required<OpenClawMemUserConfig> {
    return this.config;
  }

  // 重設為預設值
  reset(): void {
    this.config = DEFAULT_CONFIG;
    this.save(this.config);
  }

  // 檢查配置檔是否存在
  exists(): boolean {
    return fs.existsSync(this.configPath);
  }
}

export default ConfigManager;
