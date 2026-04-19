#!/bin/bash

# OpenClaw-Mem 效能測試腳本

echo "📊 OpenClaw-Mem 效能測試"
echo "========================"
echo ""

# 測試搜索速度
test_search_speed() {
    echo "測試 1: 搜索速度測試"
    echo "--------------------"
    
    queries=("Boss" "Task Queue" "OpenClaw" "記憶" "GitHub")
    
    for query in "${queries[@]}"; do
        echo -n "搜索 '$query': "
        start=$(date +%s%3N)
        openclaw-mem search "$query" --limit 5 > /dev/null 2>&1
        end=$(date +%s%3N)
        duration=$((end - start))
        echo "${duration}ms"
    done
    echo ""
}

# 測試資料庫大小
test_db_size() {
    echo "測試 2: 資料庫效率"
    echo "--------------------"
    
    db_path="$HOME/.openclaw/memory-store/store.db"
    mem_dir="$HOME/.openclaw/workspace/memory"
    
    if [ -f "$db_path" ]; then
        db_size=$(du -sh "$db_path" | cut -f1)
        echo "資料庫大小: $db_size"
    fi
    
    if [ -d "$mem_dir" ]; then
        mem_size=$(du -sh "$mem_dir" | cut -f1)
        echo "Markdown 大小: $mem_size"
    fi
    
    # 計算壓縮率
    db_bytes=$(stat -f%z "$db_path" 2>/dev/null || stat -c%s "$db_path" 2>/dev/null)
    mem_bytes=$(du -sb "$mem_dir" 2>/dev/null | cut -f1 || du -s "$mem_dir" | cut -f1)
    
    if [ -n "$db_bytes" ] && [ -n "$mem_bytes" ] && [ "$mem_bytes" -gt 0 ]; then
        ratio=$(echo "scale=2; $db_bytes * 100 / $mem_bytes" | bc)
        echo "壓縮率: ${ratio}%"
    fi
    echo ""
}

# 測試記憶統計
test_stats() {
    echo "測試 3: 記憶統計"
    echo "--------------------"
    openclaw-mem status
    echo ""
}

# 對比 memory_search
test_vs_memory_search() {
    echo "測試 4: 與 memory_search 對比"
    echo "--------------------"
    
    query="Task Queue"
    
    # OpenClaw-Mem
    echo -n "OpenClaw-Mem 搜索 '$query': "
    start=$(date +%s%3N)
    result=$(openclaw-mem search "$query" --limit 3 2>/dev/null | grep -c "^\[")
    end=$(date +%s%3N)
    duration1=$((end - start))
    echo "${duration1}ms (找到 $result 個結果)"
    
    # memory_search (如果可用)
    if command -v memory_search &> /dev/null; then
        echo -n "memory_search 搜索 '$query': "
        start=$(date +%s%3N)
        # 這裡需要實際的 memory_search 指令
        # result=$(memory_search "$query" 2>/dev/null | wc -l)
        end=$(date +%s%3N)
        duration2=$((end - start))
        echo "${duration2}ms"
    else
        echo "memory_search: 未安裝"
    fi
    echo ""
}

# 執行所有測試
echo "開始效能測試..."
echo ""

test_search_speed
test_db_size
test_stats
test_vs_memory_search

echo "✅ 效能測試完成"
