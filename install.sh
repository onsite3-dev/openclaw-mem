#!/bin/bash

# OpenClaw-Mem 一鍵安裝腳本
# 用法: ./install.sh [memory-dir]

set -e  # 遇到錯誤立刻停止

echo "🚀 OpenClaw-Mem 一鍵安裝腳本"
echo "================================"
echo ""

# 檢查參數
MEMORY_DIR="${1:-$HOME/.openclaw/workspace/memory}"
echo "📁 記憶目錄: $MEMORY_DIR"
echo ""

# 1. Clone 專案
if [ -d "$HOME/openclaw-mem" ]; then
    echo "⚠️  openclaw-mem 目錄已存在，跳過 clone"
    cd $HOME/openclaw-mem
    git pull
else
    echo "📥 Clone 專案..."
    cd $HOME
    git clone https://github.com/onsite3-dev/openclaw-mem.git
    cd openclaw-mem
fi

# 2. 安裝依賴
echo "📦 安裝依賴..."
npm install

# 3. 編譯
echo "🔨 編譯..."
npm run build

# 4. 設定 alias
echo "🔗 設定 alias..."
SHELL_RC="$HOME/.bashrc"
if [ -n "$ZSH_VERSION" ]; then
    SHELL_RC="$HOME/.zshrc"
fi

if ! grep -q "alias openclaw-mem=" "$SHELL_RC" 2>/dev/null; then
    echo "alias openclaw-mem=\"node $HOME/openclaw-mem/dist/cli.js\"" >> "$SHELL_RC"
    echo "✅ Alias 已加入 $SHELL_RC"
else
    echo "✅ Alias 已存在"
fi

# 5. 載入 alias（當前 session）
alias openclaw-mem="node $HOME/openclaw-mem/dist/cli.js"

# 6. 初始化配置
echo "⚙️  初始化配置..."
if [ -f "$HOME/.openclaw/openclaw-mem.json" ]; then
    echo "⚠️  配置檔已存在，跳過初始化"
else
    node $HOME/openclaw-mem/dist/cli.js config init
fi

# 7. 設定記憶目錄
echo "📝 設定記憶目錄..."
node $HOME/openclaw-mem/dist/cli.js config set memoryDir "$MEMORY_DIR"

# 8. 初始化資料庫
echo "💾 初始化資料庫..."
node $HOME/openclaw-mem/dist/cli.js init

# 9. 匯入記憶
echo "📚 匯入記憶..."
node $HOME/openclaw-mem/dist/cli.js import

# 10. 顯示狀態
echo ""
echo "✅ 安裝完成！"
echo ""
node $HOME/openclaw-mem/dist/cli.js status

echo ""
echo "================================"
echo "🎉 OpenClaw-Mem 已就緒！"
echo ""
echo "常用指令："
echo "  openclaw-mem search \"關鍵字\"  # 搜索記憶"
echo "  openclaw-mem list              # 列出所有日期"
echo "  openclaw-mem status            # 查看狀態"
echo "  openclaw-mem --help            # 查看所有指令"
echo ""
echo "⚠️  記得執行: source $SHELL_RC"
echo ""
