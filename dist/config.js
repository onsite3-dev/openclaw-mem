"use strict";
/**
 * OpenClaw-Mem Configuration
 *
 * 獨立配置檔，不干擾 OpenClaw 核心設定
 * 位置：~/.openclaw/openclaw-mem.json
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = exports.DEFAULT_CONFIG = void 0;
exports.DEFAULT_CONFIG = {
    enabled: true,
    autoSync: false,
    syncInterval: 300, // 5 分鐘
    dbPath: '~/.openclaw/memory-store/store.db',
    memoryDir: '~/.openclaw/workspace/memory',
    telegram: {
        enabled: false,
        botToken: ''
    }
};
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
class ConfigManager {
    constructor(configPath) {
        const homeDir = os_1.default.homedir();
        this.configPath = configPath || path_1.default.join(homeDir, '.openclaw/openclaw-mem.json');
        this.config = exports.DEFAULT_CONFIG;
    }
    // 載入配置
    load() {
        try {
            if (fs_1.default.existsSync(this.configPath)) {
                const data = fs_1.default.readFileSync(this.configPath, 'utf-8');
                const userConfig = JSON.parse(data);
                // 合併預設配置
                this.config = {
                    ...exports.DEFAULT_CONFIG,
                    ...userConfig,
                    telegram: {
                        ...exports.DEFAULT_CONFIG.telegram,
                        ...(userConfig.telegram || {})
                    }
                };
                // 展開 ~ 路徑
                if (this.config.dbPath.startsWith('~')) {
                    this.config.dbPath = this.config.dbPath.replace('~', os_1.default.homedir());
                }
                if (this.config.memoryDir.startsWith('~')) {
                    this.config.memoryDir = this.config.memoryDir.replace('~', os_1.default.homedir());
                }
            }
        }
        catch (error) {
            console.warn('Failed to load config, using defaults:', error);
        }
        return this.config;
    }
    // 儲存配置
    save(config) {
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
            const dir = path_1.default.dirname(this.configPath);
            if (!fs_1.default.existsSync(dir)) {
                fs_1.default.mkdirSync(dir, { recursive: true });
            }
            // 寫入檔案
            fs_1.default.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2), 'utf-8');
        }
        catch (error) {
            throw new Error(`Failed to save config: ${error}`);
        }
    }
    // 取得配置
    get() {
        return this.config;
    }
    // 重設為預設值
    reset() {
        this.config = exports.DEFAULT_CONFIG;
        this.save(this.config);
    }
    // 檢查配置檔是否存在
    exists() {
        return fs_1.default.existsSync(this.configPath);
    }
}
exports.ConfigManager = ConfigManager;
exports.default = ConfigManager;
//# sourceMappingURL=config.js.map