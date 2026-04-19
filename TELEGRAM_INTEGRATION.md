# OpenClaw-Mem Telegram 整合

讓 AI 姐妹們在 Telegram 中用 `/` 指令搜索記憶！

## 方法 1：OpenClaw Skill 整合（推薦）

### 建立 Skill

在 OpenClaw skills 目錄建立 `mem-search-skill/SKILL.md`：

```markdown
# Memory Search Skill

搜索 OpenClaw-Mem 資料庫中的記憶

## Commands

### /mem_search
搜索記憶
Usage: /mem_search <query>

### /mem_list
列出所有記憶日期
Usage: /mem_list

### /mem_show
顯示特定日期的記憶
Usage: /mem_show <date>

### /mem_status
顯示系統狀態
Usage: /mem_status

### /mem_help
顯示使用說明
Usage: /mem_help

## Implementation

```typescript
import { MemTelegramBot } from 'openclaw-mem/telegram-bot';

const bot = new MemTelegramBot(process.env.TELEGRAM_BOT_TOKEN);
await bot.init();

// 處理訊息
const response = await bot.handleMessage(userMessage);
```
\```

## 方法 2：OpenClaw Plugin 設定

修改 `~/.openclaw/openclaw.json`：

```json
{
  "plugins": {
    "telegram": {
      "customCommands": {
        "/mem_search": {
          "handler": "openclaw-mem",
          "method": "search"
        },
        "/mem_list": {
          "handler": "openclaw-mem",
          "method": "list"
        },
        "/mem_show": {
          "handler": "openclaw-mem",
          "method": "show"
        },
        "/mem_status": {
          "handler": "openclaw-mem",
          "method": "status"
        },
        "/mem_help": {
          "handler": "openclaw-mem",
          "method": "help"
        }
      }
    }
  }
}
```

## 方法 3：手動整合（給 Boss）

在姐妹們的 OpenClaw agent 中加入：

```javascript
// 檢測到 /mem_ 開頭的指令時
if (message.startsWith('/mem_')) {
  const { MemTelegramBot } = require('openclaw-mem/telegram-bot');
  const bot = new MemTelegramBot(botToken);
  await bot.init();
  const response = await bot.handleMessage(message);
  return response;
}
```

## 測試

```bash
# 在 Telegram 中測試
/mem_search Boss
/mem_list
/mem_show 2026-04-19
/mem_status
/mem_help
```

## 可用指令說明

| 指令 | 說明 | 範例 |
|------|------|------|
| `/mem_search <query>` | 搜索記憶 | `/mem_search Task Queue` |
| `/mem_list` | 列出所有日期 | `/mem_list` |
| `/mem_show <date>` | 查看特定日期 | `/mem_show 2026-04-19` |
| `/mem_status` | 系統狀態 | `/mem_status` |
| `/mem_help` | 使用說明 | `/mem_help` |

## 姐妹們會看到

當她們在 Telegram 輸入 `/mem` 時，會自動提示可用指令：

```
/mem_search - 搜索記憶
/mem_list - 列出所有日期
/mem_show - 查看特定日期
/mem_status - 系統狀態
/mem_help - 使用說明
```

完全無縫整合，不需要額外學習！🌼
