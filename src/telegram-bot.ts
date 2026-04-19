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

import { OpenClawMem } from './index';

interface TelegramMessage {
  text: string;
  chat: {
    id: number;
  };
  from: {
    first_name: string;
  };
}

export class MemTelegramBot {
  private mem: OpenClawMem;
  private botToken: string;
  
  constructor(botToken: string) {
    this.botToken = botToken;
    this.mem = new OpenClawMem();
  }

  async init() {
    await this.mem.init();
    console.log('✅ MemTelegramBot initialized');
  }

  // 處理 /mem_search 指令
  async handleSearch(query: string): Promise<string> {
    try {
      const results = this.mem.search(query, 5);
      
      if (results.length === 0) {
        return `🔍 找不到「${query}」相關的記憶`;
      }
      
      let response = `🔍 找到 ${results.length} 個結果：\n\n`;
      
      results.forEach((result, index) => {
        response += `${index + 1}. [${result.date}]\n`;
        response += `${result.snippet}\n\n`;
      });
      
      return response;
    } catch (error) {
      return `❌ 搜索失敗：${error}`;
    }
  }

  // 處理 /mem_list 指令
  async handleList(): Promise<string> {
    try {
      const dates = this.mem.listDates();
      
      if (dates.length === 0) {
        return '📅 目前沒有記憶';
      }
      
      let response = `📅 記憶日期列表 (共 ${dates.length} 天)：\n\n`;
      
      dates.slice(0, 10).forEach((date, index) => {
        response += `${index + 1}. ${date}\n`;
      });
      
      if (dates.length > 10) {
        response += `\n...還有 ${dates.length - 10} 天`;
      }
      
      return response;
    } catch (error) {
      return `❌ 列表失敗：${error}`;
    }
  }

  // 處理 /mem_show 指令
  async handleShow(date: string): Promise<string> {
    try {
      const memory = this.mem.getByDate(date);
      
      if (!memory) {
        return `📅 找不到 ${date} 的記憶`;
      }
      
      let response = `📅 ${date} 的記憶：\n\n`;
      
      if (memory.type) {
        response += `類型：${memory.type}\n`;
      }
      if (memory.concept) {
        response += `概念：${memory.concept}\n`;
      }
      
      response += `\n${memory.content.slice(0, 1000)}`;
      
      if (memory.content.length > 1000) {
        response += '\n\n...(內容過長，已截斷)';
      }
      
      return response;
    } catch (error) {
      return `❌ 查看失敗：${error}`;
    }
  }

  // 處理 /mem_status 指令
  async handleStatus(): Promise<string> {
    try {
      const stats = this.mem.getStats();
      
      return `📊 OpenClaw-Mem 狀態：\n\n` +
             `記憶數量：${stats.totalMemories}\n` +
             `資料庫大小：${(stats.dbSize / 1024).toFixed(2)} KB`;
    } catch (error) {
      return `❌ 狀態查詢失敗：${error}`;
    }
  }

  // 處理 /mem_help 指令
  handleHelp(): string {
    return `📖 OpenClaw-Mem 使用說明：\n\n` +
           `/mem_search <關鍵字> - 搜索記憶\n` +
           `/mem_list - 列出所有日期\n` +
           `/mem_show <日期> - 查看特定日期\n` +
           `/mem_status - 系統狀態\n` +
           `/mem_help - 顯示此說明\n\n` +
           `範例：\n` +
           `/mem_search Boss\n` +
           `/mem_show 2026-04-19`;
  }

  // 處理訊息（給 OpenClaw 呼叫）
  async handleMessage(message: string): Promise<string> {
    const parts = message.trim().split(/\s+/);
    const command = parts[0];
    const args = parts.slice(1).join(' ');

    switch (command) {
      case '/mem_search':
        if (!args) return '❌ 請提供搜索關鍵字\n範例：/mem_search Boss';
        return await this.handleSearch(args);
      
      case '/mem_list':
        return await this.handleList();
      
      case '/mem_show':
        if (!args) return '❌ 請提供日期\n範例：/mem_show 2026-04-19';
        return await this.handleShow(args);
      
      case '/mem_status':
        return await this.handleStatus();
      
      case '/mem_help':
        return this.handleHelp();
      
      default:
        return this.handleHelp();
    }
  }
}

// 如果直接執行（非 import）
if (require.main === module) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!token) {
    console.error('❌ 請設定 TELEGRAM_BOT_TOKEN 環境變數');
    process.exit(1);
  }
  
  const bot = new MemTelegramBot(token);
  
  bot.init().then(() => {
    console.log('🤖 MemTelegramBot 啟動中...');
    console.log('📝 使用 /mem_help 查看可用指令');
  });
}

export default MemTelegramBot;
