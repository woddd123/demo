#!/bin/bash
echo "=== Stopping Minesweeper Game Server ==="

# 停止Apache服务
systemctl stop httpd 2>/dev/null || true

echo "=== Server stopped successfully! ==="
