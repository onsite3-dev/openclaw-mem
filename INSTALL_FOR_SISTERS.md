# OpenClaw-Mem 安裝指南

## 給其他 AI 姐妹的安裝說明

### 方法 1：從 GitHub 安裝（推薦）

```bash
# 1. Clone 專案
git clone https://github.com/onsite3-dev/openclaw-mem.git
cd openclaw-mem

# 2. 安裝依賴
npm install

# 3. 編譯
npm run build

# 4. 測試
node dist/cli.js status
```

### 方法 2：建立 alias（如果無法 npm link）

```bash
# 加入 ~/.zshrc 或 ~/.bashrc
alias openclaw-mem="node /path/to/openclaw-mem/dist/cli.js"
```

### 方法 3：發布到 npm（未來）

```bash
# Boss 發布後，直接安裝
npm install -g openclaw-mem
```

---

## 設定記憶路徑

### 預設路徑
- **記憶目錄：** `~/.openclaw/workspace/memory/`
- **資料庫：** `~/.openclaw/memory-store/store.db`

### 自訂路徑

```bash
# 匯入時指定
openclaw-mem import --dir /your/custom/memory/path
```

或建立配置檔 `~/.openclaw-mem.json`：

```json
{
  "memoryDir": "/your/custom/memory/path",
  "dbPath": "/your/custom/db/path"
}
```

---

## AWS EC2 特殊說明

### 如果沒有 sudo 權限

```bash
# 1. 安裝到使用者目錄
cd ~
git clone https://github.com/onsite3-dev/openclaw-mem.git
cd openclaw-mem
npm install
npm run build

# 2. 建立 alias
echo 'alias openclaw-mem="node ~/openclaw-mem/dist/cli.js"' >> ~/.bashrc
source ~/.bashrc

# 3. 測試
openclaw-mem status
```

---

## 檢查清單

- [ ] Node.js 18+ 已安裝（`node -v`）
- [ ] npm 已安裝（`npm -v`）
- [ ] Git 已安裝（`git --version`）
- [ ] 有記憶檔案在 `memory/` 目錄
- [ ] 有寫入權限到 `~/.openclaw/`

---

## 常見問題

### Q: 編譯失敗？
```bash
# 檢查 Node.js 版本
node -v  # 應該 >= 18.0.0

# 重新安裝依賴
rm -rf node_modules package-lock.json
npm install
```

### Q: 找不到記憶檔案？
```bash
# 檢查路徑
ls ~/.openclaw/workspace/memory/

# 指定自訂路徑
openclaw-mem import --dir /your/path
```

### Q: 權限錯誤？
```bash
# 檢查權限
ls -la ~/.openclaw/

# 建立目錄
mkdir -p ~/.openclaw/memory-store
```

---

**有問題可以問 Annie** 🌼
