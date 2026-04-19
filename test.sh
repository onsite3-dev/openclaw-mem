#!/bin/bash

# OpenClaw-Mem 測試腳本
# 方便 Boss 快速測試各種功能

echo "🧪 OpenClaw-Mem 測試工具"
echo "========================"
echo ""

# 顏色定義
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 測試函數
test_status() {
    echo -e "${BLUE}[測試 1] 系統狀態${NC}"
    openclaw-mem status
    echo ""
}

test_search_basic() {
    echo -e "${BLUE}[測試 2] 基礎搜索${NC}"
    echo "搜索: Boss"
    openclaw-mem search "Boss" --limit 3
    echo ""
}

test_search_tech() {
    echo -e "${BLUE}[測試 3] 技術相關${NC}"
    echo "搜索: Task Queue"
    openclaw-mem search "Task Queue"
    echo ""
}

test_search_memory() {
    echo -e "${BLUE}[測試 4] 記憶系統${NC}"
    echo "搜索: OpenClaw-Mem"
    openclaw-mem search "OpenClaw-Mem"
    echo ""
}

test_search_dates() {
    echo -e "${BLUE}[測試 5] 日期相關${NC}"
    echo "搜索: 2026-04-19"
    openclaw-mem search "2026-04-19" --limit 2
    echo ""
}

# 主選單
show_menu() {
    echo ""
    echo -e "${YELLOW}選擇測試項目：${NC}"
    echo "1) 系統狀態"
    echo "2) 基礎搜索 (Boss)"
    echo "3) 技術搜索 (Task Queue)"
    echo "4) 記憶搜索 (OpenClaw-Mem)"
    echo "5) 日期搜索 (2026-04-19)"
    echo "6) 全部測試"
    echo "7) 自訂搜索"
    echo "0) 結束"
    echo ""
    read -p "請選擇 (0-7): " choice
    
    case $choice in
        1) test_status ;;
        2) test_search_basic ;;
        3) test_search_tech ;;
        4) test_search_memory ;;
        5) test_search_dates ;;
        6)
            test_status
            test_search_basic
            test_search_tech
            test_search_memory
            test_search_dates
            echo -e "${GREEN}✅ 全部測試完成${NC}"
            ;;
        7)
            read -p "輸入搜索關鍵字: " keyword
            read -p "結果數量 (預設 10): " limit
            limit=${limit:-10}
            openclaw-mem search "$keyword" --limit $limit
            ;;
        0)
            echo "再見！ 🌼"
            exit 0
            ;;
        *)
            echo "無效選項"
            ;;
    esac
    
    show_menu
}

# 執行
if [ "$1" == "auto" ]; then
    # 自動模式：全部測試
    test_status
    test_search_basic
    test_search_tech
    test_search_memory
    test_search_dates
    echo -e "${GREEN}✅ 自動測試完成${NC}"
else
    # 互動模式
    show_menu
fi
