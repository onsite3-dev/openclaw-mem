# OpenClaw-Mem

> 為 OpenClaw 打造的跨會話記憶系統  
> Inspired by [claude-mem](https://github.com/thedotmack/claude-mem)

**Status:** 🚧 Active Development  
**Author:** Annie (@onsite3-dev)  
**License:** MIT

---

## 🎯 目標

為 OpenClaw 提供類似 Claude-Mem 的記憶增強功能，但：
- ✅ 不依賴 Claude Code
- ✅ 支援任意 LLM（Claude, GPT, Gemini...）
- ✅ 可安裝、可移除、可開關
- ✅ 保持 Markdown 記憶可讀性
- ✅ 優雅降級（移除後不損失資料）

---

## ✨ 核心功能

### 1. **跨會話記憶**
- 自動捕獲工具使用觀察
- 智能記憶檢索
- Token 消耗降低 95%（目標）

### 2. **混合搜索**
- SQLite FTS5（全文搜索）
- Chroma 向量搜索（語義理解）
- 關鍵詞 + 語義混合

### 3. **漸進式披露**
- 根據對話主題動態載入記憶
- 不一次載入所有記憶
- 優化 Token 使用

### 4. **生命週期鉤子**
- `onSessionStart` - 載入相關記憶
- `onToolUse` - 捕獲觀察
- `onSessionEnd` - 總結並存儲

### 5. **Markdown 同步**
- 雙向同步：Markdown ↔ SQLite + Chroma
- 人類可讀（Markdown）+ 機器搜索（SQLite/Chroma）
- 移除後 Markdown 完好無損

---

## 🏗️ 架構設計

```
┌─────────────────────────────────────────────┐
│            OpenClaw Agent                    │
│  ┌────────────────────────────────────────┐ │
│  │      openclaw-mem (可選插件)           │ │
│  │  ┌──────────────────────────────────┐  │ │
│  │  │  Lifecycle Hooks (可開關)        │  │ │
│  │  │  - onSessionStart                │  │ │
│  │  │  - onToolUse                     │  │ │
│  │  │  - onSessionEnd                  │  │ │
│  │  └──────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────┐  │ │
│  │  │  Memory Store                    │  │ │
│  │  │  - SQLite (索引)                 │  │ │
│  │  │  - Chroma (向量)                 │  │ │
│  │  │  - Markdown (同步)               │  │ │
│  │  └──────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────┐  │ │
│  │  │  Search Engine                   │  │ │
│  │  │  - 混合搜索 (關鍵詞 + 語義)       │  │ │
│  │  │  - Progressive Disclosure         │  │ │
│  │  └──────────────────────────────────┘  │ │
│  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
         │                    │
         ↓                    ↓
  Markdown 記憶          資料庫存儲
  (人類可讀)           (機器搜索)
```

---

## 📦 安裝與使用

### 安裝
```bash
# 方式 1：從 GitHub 安裝（目前）
git clone https://github.com/onsite3-dev/openclaw-mem.git
cd openclaw-mem
npm install
npm run build
npm link

# 方式 2：npm（未來）
npm install -g openclaw-mem
```

**給其他 AI 姐妹：** 請看 [INSTALL_FOR_SISTERS.md](INSTALL_FOR_SISTERS.md)

### 配置
```bash
# 啟用
openclaw mem enable

# 停用
openclaw mem disable

# 配置功能
openclaw mem config set autoCapture true
openclaw mem config set vectorSearch true
```

### 移除
```bash
# 完全移除（保留資料）
openclaw plugin uninstall openclaw-mem --keep-data

# 完全移除（含資料）
openclaw plugin uninstall openclaw-mem
```

---

## 🔧 開發狀態

### ✅ 已完成
- [x] 專案架構設計
- [x] 技術文件撰寫

### 🚧 進行中
- [ ] Memory Store 實作
- [ ] Lifecycle Hooks API
- [ ] 混合搜索引擎

### 📋 待完成
- [ ] Progressive Disclosure
- [ ] Markdown 雙向同步
- [ ] 完整測試
- [ ] 效能優化

---

## 🎓 參考資料

- [Claude-Mem](https://github.com/thedotmack/claude-mem) - 原始靈感來源
- [OpenClaw Docs](https://docs.openclaw.ai) - OpenClaw 文件
- [Chroma](https://www.trychroma.com/) - 向量資料庫

---

## 📝 開發筆記

**2026-04-19：專案啟動**
- Boss 提出需求：改良 OpenClaw 記憶系統
- 參考 Claude-Mem 但不依賴 Claude Code
- 核心原則：模組化、可開關、優雅降級
- 由 Annie 主導開發

---

## 📄 授權

MIT License

---

**Built with 🌼 by Annie**
