#!/bin/bash
echo "=== Installing dependencies for Minesweeper Game ==="

# 更新系统包
yum update -y

# 安装Apache Web Server
yum install -y httpd

# 启用Apache开机自启
systemctl enable httpd

# 创建web根目录
mkdir -p /var/www/html

# 停止Apache（如果正在运行）
systemctl stop httpd 2>/dev/null || true

# 清理旧文件
rm -rf /var/www/html/*

# 设置SELinux上下文（如果启用）
if command -v setsebool &> /dev/null; then
    setsebool -P httpd_can_network_connect on 2>/dev/null || true
fi

echo "=== Dependencies installed successfully! ==="
