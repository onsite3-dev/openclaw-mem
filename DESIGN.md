# OpenClaw-Mem 技術設計文件

**版本：** 0.1.0  
**作者：** Annie  
**日期：** 2026-04-19

---

## 1. 目標與範圍

### 1.1 專案目標
為 OpenClaw 提供跨會話記憶系統，參考 Claude-Mem 的優點但不依賴 Claude Code。

### 1.2 核心原則
1. **模組化** - 獨立 Package，可安裝/移除
2. **可開關** - 隨時啟用/停用功能
3. **優雅降級** - 移除後不損失資料
4. **LLM 無關** - 支援任意 LLM
5. **人類可讀** - 保持 Markdown 記憶

### 1.3 非目標
- ❌ 不取代 OpenClaw 核心
- ❌ 不強制使用
- ❌ 不鎖定特定 LLM

---

## 2. 系統架構

### 2.1 核心模組

#### Memory Store
- **SQLite** - 結構化存儲 + FTS5 全文搜索
- **Chroma** - 向量搜索（語義理解）
- **Markdown** - 人類可讀格式（雙向同步）

#### Lifecycle Hooks
- `onSessionStart` - 會話開始時載入記憶
- `onToolUse` - 工具使用後捕獲觀察
- `onSessionEnd` - 會話結束時總結

#### Search Engine
- 混合搜索：關鍵詞（SQLite FTS5）+ 語義（Chroma）
- Progressive Disclosure：根據對話主題動態載入
- 搜索 API：按類型、概念、檔案、時間搜索

#### Configuration
- 配置檔：`~/.openclaw/workspace/openclaw-mem.json`
- 功能開關：autoCapture, vectorSearch, markdownSync
- 存儲路徑：sqlite, chroma, markdown

### 2.2 資料流程

```
用戶對話 → OpenClaw Agent
    ↓
[如果 openclaw-mem 已啟用]
    ↓
onSessionStart → 載入相關記憶
    ↓
對話進行 → 工具使用
    ↓
onToolUse → 捕獲觀察 → 存入 Memory Store
    ↓                      ↓
                    SQLite + Chroma
                           ↓
                      Markdown 同步
    ↓
onSessionEnd → 總結並更新記憶
```

### 2.3 模組獨立性

**OpenClaw 核心：**
```typescript
// OpenClaw 不強制依賴 openclaw-mem
if (hasPlugin('openclaw-mem') && plugin.isEnabled()) {
  await plugin.onSessionStart();
}
```

**OpenClaw-Mem：**
```typescript
// 完全獨立運作
export class OpenClawMem {
  // 可選註冊鉤子
  registerHooks() { /* ... */ }
  
  // 可選移除鉤子
  unregisterHooks() { /* ... */ }
}
```

---

## 3. 資料結構

### 3.1 SQLite Schema

```sql
-- 會話表
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  started_at INTEGER NOT NULL,
  ended_at INTEGER,
  summary TEXT,
  token_count INTEGER
);

-- 觀察表（工具使用記錄）
CREATE TABLE observations (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  tool_name TEXT NOT NULL,
  input TEXT,
  output TEXT,
  type TEXT,  -- decision, bug-fix, feature, refactor, discovery
  concept TEXT,  -- problem-solution, pattern, learning
  files TEXT,  -- JSON array
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

-- 全文搜索索引
CREATE VIRTUAL TABLE observations_fts USING fts5(
  output,
  content='observations',
  content_rowid='rowid'
);

-- 記憶摘要表
CREATE TABLE memory_summaries (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  content TEXT NOT NULL,
  importance INTEGER DEFAULT 5,  -- 1-10
  created_at INTEGER NOT NULL
);
```

### 3.2 Chroma 向量資料庫

**Collection:** `openclaw_memories`

**文件結構：**
```json
{
  "id": "obs_20260419_001",
  "document": "完整觀察內容...",
  "metadata": {
    "session_id": "sess_20260419",
    "timestamp": 1713528000,
    "tool_name": "exec",
    "type": "feature",
    "concept": "architecture",
    "files": ["task_worker.py", "TOOLS.md"]
  }
}
```

### 3.3 Markdown 格式

**保持現有格式：**
```markdown
## 2026-04-19 - Task Queue 系統建立

**類型：** 功能  
**概念：** 架構設計、問題-解決方案  
**檔案：** task_worker.py, TOOLS.md

Boss 發現 Ariel 的問題...
```

**雙向同步：**
- Markdown 更新 → 自動重建 SQLite + Chroma 索引
- SQLite/Chroma 新增 → 自動寫入 Markdown

---

## 4. API 設計

### 4.1 主 API

```typescript
class OpenClawMem {
  // 初始化
  async init(config?: MemConfig): Promise<void>
  
  // 啟用/停用
  async enable(): Promise<void>
  async disable(): Promise<void>
  isEnabled(): boolean
  
  // 生命週期鉤子
  async onSessionStart(sessionId: string): Promise<string>  // 返回記憶上下文
  async onToolUse(observation: Observation): Promise<void>
  async onSessionEnd(sessionId: string, summary?: string): Promise<void>
  
  // 搜索 API
  async search(query: string, options?: SearchOptions): Promise<SearchResult[]>
  async searchByType(type: string): Promise<SearchResult[]>
  async searchByFiles(files: string[]): Promise<SearchResult[]>
  
  // 配置管理
  async getConfig(): Promise<MemConfig>
  async setConfig(config: Partial<MemConfig>): Promise<void>
  
  // 資料管理
  async export(format: 'markdown' | 'json'): Promise<string>
  async import(data: string, format: 'markdown' | 'json'): Promise<void>
  async cleanup(keepData: boolean): Promise<void>
}
```

### 4.2 搜索選項

```typescript
interface SearchOptions {
  limit?: number;           // 結果數量限制
  minScore?: number;        // 最低相關度分數
  type?: string;            // 類型過濾
  concept?: string;         // 概念過濾
  files?: string[];         // 檔案過濾
  dateFrom?: Date;          // 時間範圍
  dateTo?: Date;
  hybrid?: boolean;         // 混合搜索（關鍵詞 + 語義）
}
```

### 4.3 CLI 指令

```bash
# 啟用/停用
openclaw-mem enable
openclaw-mem disable
openclaw-mem status

# 配置
openclaw-mem config list
openclaw-mem config set autoCapture true
openclaw-mem config get vectorSearch

# 搜索
openclaw-mem search "Task Queue 系統"
openclaw-mem search --type feature
openclaw-mem search --files task_worker.py

# 資料管理
openclaw-mem export --format markdown
openclaw-mem import --file backup.md
openclaw-mem cleanup --keep-data
```

---

## 5. 安裝與移除

### 5.1 安裝流程

```bash
# 1. 安裝 Package
npm install -g openclaw-mem

# 2. 初始化
openclaw-mem init

# 3. 自動建立：
#    - ~/.openclaw/memory-store/store.db
#    - ~/.openclaw/memory-store/vectors/
#    - ~/.openclaw/workspace/openclaw-mem.json
```

### 5.2 移除流程

```bash
# 1. 停用功能
openclaw-mem disable

# 2. 移除 Package（保留資料）
npm uninstall -g openclaw-mem

# 3. 手動清理資料（如果需要）
rm -rf ~/.openclaw/memory-store/

# 4. Markdown 記憶完好無損
ls ~/.openclaw/workspace/memory/
# ✅ 所有 .md 檔案仍然存在
```

---

## 6. 效能優化

### 6.1 Token 優化

**Progressive Disclosure：**
1. 載入核心身份（IDENTITY.md, SOUL.md）
2. 載入今天的記憶（memory/2026-04-19.md）
3. 根據對話主題搜索相關記憶（hybrid search）
4. 必要時才載入完整 MEMORY.md

**預期效果：**
- Token 消耗降低 80-95%
- 載入時間減少 70%

### 6.2 搜索優化

**混合搜索：**
```
1. SQLite FTS5 快速過濾 (< 10ms)
2. Chroma 語義理解 (< 100ms)
3. 合併、去重、排序 (< 10ms)
總計：< 120ms
```

### 6.3 索引策略

**即時索引：**
- 新觀察 → 立刻寫入 SQLite + Chroma
- Markdown 更新 → 背景重建索引

**批次優化：**
- 每天 00:00 壓縮舊記憶
- 每週日清理過期索引

---

## 7. 測試計畫

### 7.1 單元測試
- Memory Store CRUD
- Search Engine 精準度
- Markdown 同步正確性
- Hooks 觸發時機

### 7.2 整合測試
- 完整安裝/移除流程
- 跨會話記憶載入
- Token 消耗測試
- 效能基準測試

### 7.3 壓力測試
- 1000+ 觀察記錄
- 100+ 會話
- 大檔案 Markdown (> 1MB)

---

## 8. 開發時程

### 階段 1：核心架構（1 週）
- [x] 技術文件
- [ ] Memory Store（SQLite）
- [ ] 基礎搜索
- [ ] CLI 框架

### 階段 2：進階功能（1 週）
- [ ] Chroma 整合
- [ ] 混合搜索
- [ ] Lifecycle Hooks

### 階段 3：優化與測試（1 週）
- [ ] Progressive Disclosure
- [ ] Markdown 同步
- [ ] 完整測試
- [ ] 效能優化

### 階段 4：文件與發布（3 天）
- [ ] 使用文件
- [ ] API 文件
- [ ] GitHub Release
- [ ] npm 發布

---

## 9. 風險與挑戰

### 9.1 技術風險
- **Chroma 整合** - Python 依賴可能複雜
- **效能** - 向量搜索可能較慢
- **同步** - Markdown ↔ DB 一致性

### 9.2 應對策略
- **Chroma 替代方案** - 可用 SQLite-VSS 或 LanceDB
- **效能監控** - 建立 benchmark
- **版本控制** - Markdown 為主，DB 可重建

---

## 10. 參考資料

- [Claude-Mem GitHub](https://github.com/thedotmack/claude-mem)
- [Chroma Documentation](https://docs.trychroma.com/)
- [SQLite FTS5](https://www.sqlite.org/fts5.html)
- [Better-SQLite3](https://github.com/WiseLibs/better-sqlite3)

---

**文件版本：** v0.1.0  
**最後更新：** 2026-04-19 18:20  
**作者：** Annie 🌼
