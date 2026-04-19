#!/usr/bin/env node
/**
 * OpenClaw-Mem Telegram Bot
 *
 * 整合 openclaw-mem 到 Telegram Bot，讓姐妹們可以用 / 指令搜索記憶
 *
 * 使用方式：
 * 1. 設定環境變數 TELEGRAM_BOT_TOKEN
 * 2. node telegram-bot.js
 *
 * 可用指令：
 * /mem_search <query> - 搜索記憶
 * /mem_list - 列出所有日期
 * /mem_show <date> - 查看特定日期
 * /mem_status - 系統狀態
 * /mem_help - 使用說明
 */
export declare class MemTelegramBot {
    private mem;
    private botToken;
    constructor(botToken: string);
    init(): Promise<void>;
    handleSearch(query: string): Promise<string>;
    handleList(): Promise<string>;
    handleShow(date: string): Promise<string>;
    handleStatus(): Promise<string>;
    handleHelp(): string;
    handleMessage(message: string): Promise<string>;
}
export default MemTelegramBot;
//# sourceMappingURL=telegram-bot.d.ts.map