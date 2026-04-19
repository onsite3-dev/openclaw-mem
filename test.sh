#!/bin/bash

# OpenClaw-Mem 完整功能測試

echo "🧪 OpenClaw-Mem 完整功能測試"
echo "============================="
echo ""

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 測試 1: 系統狀態
test_status() {
    echo -e "${BLUE}[測試 1] 系統狀態${NC}"
    openclaw-mem status
    echo ""
}

# 測試 2: 列出所有日期
test_list() {
    echo -e "${BLUE}[測試 2] 列出所有日期${NC}"
    openclaw-mem list
    echo ""
}

# 測試 3: 查看特定日期（摘要）
test_show() {
    echo -e "${BLUE}[測試 3] 查看 2026-04-19 (摘要)${NC}"
    openclaw-mem show 2026-04-19 --summary
    echo ""
}

# 測試 4: 基礎搜索
test_search() {
    echo -e "${BLUE}[測試 4] 搜索 'Boss'${NC}"
    openclaw-mem search "Boss" --limit 2
    echo ""
}

# 測試 5: 技術搜索
test_search_tech() {
    echo -e "${BLUE}[測試 5] 搜索 'OpenClaw-Mem'${NC}"
    openclaw-mem search "OpenClaw-Mem" --limit 2
    echo ""
}

# 主選單
show_menu() {
    echo ""
    echo -e "${YELLOW}選擇測試項目：${NC}"
    echo "1) 系統狀態"
    echo "2) 列出所有日期"
    echo "3) 查看特定日期 (2026-04-19)"
    echo "4) 搜索: Boss"
    echo "5) 搜索: OpenClaw-Mem"
    echo "6) 全部測試"
    echo "7) 自訂搜索"
    echo "8) 自訂日期查看"
    echo "0) 結束"
    echo ""
    read -p "請選擇 (0-8): " choice
    
    case $choice in
        1) test_status ;;
        2) test_list ;;
        3) test_show ;;
        4) test_search ;;
        5) test_search_tech ;;
        6)
            test_status
            test_list
            test_show
            test_search
            test_search_tech
            echo -e "${GREEN}✅ 全部測試完成${NC}"
            ;;
        7)
            read -p "輸入搜索關鍵字: " keyword
            read -p "結果數量 (預設 10): " limit
            limit=${limit:-10}
            openclaw-mem search "$keyword" --limit $limit
            ;;
        8)
            read -p "輸入日期 (YYYY-MM-DD): " date
            read -p "顯示摘要？ (y/n, 預設 y): " summary
            summary=${summary:-y}
            if [ "$summary" = "y" ]; then
                openclaw-mem show "$date" --summary
            else
                openclaw-mem show "$date"
            fi
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
    test_status
    test_list
    test_show
    test_search
    test_search_tech
    echo -e "${GREEN}✅ 自動測試完成${NC}"
else
    show_menu
fi
