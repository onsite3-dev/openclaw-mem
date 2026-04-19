/**
 * OpenClaw-Mem Configuration
 *
 * 獨立配置檔，不干擾 OpenClaw 核心設定
 * 位置：~/.openclaw/openclaw-mem.json
 */
export interface OpenClawMemUserConfig {
    enabled?: boolean;
    autoSync?: boolean;
    syncInterval?: number;
    dbPath?: string;
    memoryDir?: string;
    telegram?: {
        enabled?: boolean;
        botToken?: string;
    };
}
export declare const DEFAULT_CONFIG: Required<OpenClawMemUserConfig>;
export declare class ConfigManager {
    private configPath;
    private config;
    constructor(configPath?: string);
    load(): Required<OpenClawMemUserConfig>;
    save(config: Partial<OpenClawMemUserConfig>): void;
    get(): Required<OpenClawMemUserConfig>;
    reset(): void;
    exists(): boolean;
}
export default ConfigManager;
//# sourceMappingURL=config.d.ts.map