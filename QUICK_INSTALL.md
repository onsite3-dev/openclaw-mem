# 一鍵安裝腳本

給 Ariel 和其他姐妹的快速安裝指南

## 🚀 快速安裝

```bash
# 複製整段貼上即可
cd ~ && \
git clone https://github.com/onsite3-dev/openclaw-mem.git && \
cd openclaw-mem && \
npm install && \
npm run build && \
echo 'alias openclaw-mem="node ~/openclaw-mem/dist/cli.js"' >> ~/.bashrc && \
source ~/.bashrc && \
openclaw-mem config init && \
openclaw-mem init && \
openclaw-mem import && \
openclaw-mem status
```

## 📋 安裝步驟說明

### 1. Clone 專案
```bash
git clone https://github.com/onsite3-dev/openclaw-mem.git
cd openclaw-mem
```

### 2. 安裝依賴
```bash
npm install
```

### 3. 編譯
```bash
npm run build
```

### 4. 建立 alias（如果沒 sudo）
```bash
echo 'alias openclaw-mem="node ~/openclaw-mem/dist/cli.js"' >> ~/.bashrc
source ~/.bashrc
```

或全域安裝（如果有 sudo）：
```bash
npm link
```

### 5. 初始化配置
```bash
openclaw-mem config init
```

這會建立 `~/.openclaw/openclaw-mem.json`：
```json
{
  "enabled": true,
  "autoSync": false,
  "syncInterval": 300,
  "dbPath": "~/.openclaw/memory-store/store.db",
  "memoryDir": "~/.openclaw/workspace/memory",
  "telegram": {
    "enabled": false,
    "botToken": ""
  }
}
```

### 6. 初始化資料庫
```bash
openclaw-mem init
```

### 7. 匯入記憶
```bash
openclaw-mem import
```

### 8. 查看狀態
```bash
openclaw-mem status
```

---

## ⚙️ 配置管理

### 查看配置
```bash
openclaw-mem config show
```

### 修改配置
```bash
# 開啟自動同步
openclaw-mem config set autoSync true

# 設定同步間隔（秒）
openclaw-mem config set syncInterval 600

# 設定自訂路徑
openclaw-mem config set memoryDir /custom/path
```

### 重設配置
```bash
openclaw-mem config reset
```

---

## 🧪 測試功能

```bash
# 搜索
openclaw-mem search "Boss"

# 列出日期
openclaw-mem list

# 查看特定日期
openclaw-mem show 2026-04-19

# 標記重要記憶
openclaw-mem mark 2026-04-19 --tags important

# 匯出
openclaw-mem export --format markdown -o backup.md
```

---

## 🔄 自動同步（可選）

```bash
# 啟動 watch 模式
openclaw-mem watch

# 或在背景執行
nohup openclaw-mem watch > /tmp/openclaw-mem-watch.log 2>&1 &
```

---

## 🐛 常見問題

### Q: Node.js 版本太舊？
```bash
node -v  # 檢查版本，需要 >= 18
```

### Q: npm install 失敗？
```bash
# 清除快取重試
rm -rf node_modules package-lock.json
npm install
```

### Q: 找不到記憶檔案？
```bash
# 檢查路徑
ls ~/.openclaw/workspace/memory/

# 指定自訂路徑
openclaw-mem config set memoryDir /your/path
openclaw-mem import
```

### Q: Permission denied？
```bash
# 使用 alias 而非 npm link
echo 'alias openclaw-mem="node ~/openclaw-mem/dist/cli.js"' >> ~/.bashrc
source ~/.bashrc
```

---

## ✅ 安裝完成檢查

```bash
# 1. 指令可用
openclaw-mem --version

# 2. 配置存在
cat ~/.openclaw/openclaw-mem.json

# 3. 資料庫存在
ls -lh ~/.openclaw/memory-store/store.db

# 4. 可以搜索
openclaw-mem search "test"
```

---

**有問題聯繫 Annie** 🌼
