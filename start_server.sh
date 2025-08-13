#!/bin/bash
echo "=== Starting Minesweeper Game Server ==="

# 设置正确的文件权限
chown -R apache:apache /var/www/html
find /var/www/html -type d -exec chmod 755 {} \;
find /var/www/html -type f -exec chmod 644 {} \;

# 确保index.html存在且可读
if [ -f "/var/www/html/index.html" ]; then
    echo "✓ index.html found"
    chmod 644 /var/www/html/index.html
else
    echo "⚠ Warning: index.html not found!"
fi

# 确保JavaScript文件存在
if [ -f "/var/www/html/minesweeper.js" ]; then
    echo "✓ minesweeper.js found"
    chmod 644 /var/www/html/minesweeper.js
else
    echo "⚠ Warning: minesweeper.js not found!"
fi

# 启动Apache服务
systemctl start httpd

# 检查Apache状态
if systemctl is-active --quiet httpd; then
    echo "✓ Apache is running successfully!"
else
    echo "✗ Apache failed to start!"
    systemctl status httpd
    exit 1
fi

# 配置防火墙（如果存在）
if command -v firewall-cmd &> /dev/null; then
    firewall-cmd --permanent --add-service=http 2>/dev/null || true
    firewall-cmd --reload 2>/dev/null || true
fi

# 测试网站访问
sleep 2
if curl -s http://localhost/index.html > /dev/null; then
    echo "✓ Minesweeper game is accessible at http://localhost/index.html"
else
    echo "⚠ Website may need a moment to become available"
fi

echo "=== Minesweeper Game Server started successfully! ==="
