#!/bin/bash

# GitHub 推送脚本
# 使用方法: ./push_to_github.sh

echo "🚀 开始推送到 GitHub..."

# 检查是否已配置远程仓库
if ! git remote | grep -q origin; then
    echo "⚠️  请先配置远程仓库："
    echo "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git"
    echo ""
    echo "   或者运行以下命令："
    echo "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git"
    echo "   git branch -M main"
    exit 1
fi

# 添加所有文件
echo "📦 添加文件..."
git add .

# 提交更改
echo "💾 提交更改..."
git commit -m "Initial commit: 节奏英语学习应用 - 游戏化英语学习平台"

# 推送到 GitHub
echo "📤 推送到 GitHub..."
git branch -M main
git push -u origin main

echo "✅ 完成！"
echo ""
echo "🌐 下一步："
echo "   1. 访问 https://vercel.com 部署应用"
echo "   2. 或访问 https://netlify.com 部署应用"
echo "   3. 查看 GITHUB_DEPLOYMENT_GUIDE.md 了解详细步骤"

