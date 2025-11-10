# GitHub 推送和部署指南

## 📤 推送到 GitHub

### 步骤 1: 初始化 Git 仓库

```bash
cd /Users/chenlei/2025/AI/package_3
git init
```

### 步骤 2: 添加文件

```bash
git add .
```

### 步骤 3: 提交代码

```bash
git commit -m "Initial commit: 节奏英语学习应用"
```

### 步骤 4: 在 GitHub 创建仓库

1. 访问 https://github.com/new
2. 填写仓库名称（例如：`english-learning-app`）
3. 选择 Public 或 Private
4. **不要**勾选 "Initialize this repository with a README"
5. 点击 "Create repository"

### 步骤 5: 添加远程仓库并推送

```bash
# 替换 YOUR_USERNAME 和 YOUR_REPO_NAME 为你的实际信息
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

## 🚀 部署到 Vercel（推荐，免费且快速）

### 方法 1: 通过 GitHub 自动部署

1. **访问 Vercel**
   - 打开 https://vercel.com
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "Add New Project"
   - 选择你的 GitHub 仓库
   - 点击 "Import"

3. **配置项目**
   - **Framework Preset**: Vite
   - **Root Directory**: `english-learning-app`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **环境变量**（如需要）
   - 如果 Supabase 配置需要环境变量，在这里添加

5. **部署**
   - 点击 "Deploy"
   - 等待部署完成（通常 1-2 分钟）

6. **获取访问地址**
   - 部署完成后，Vercel 会提供一个 URL
   - 格式：`https://your-project-name.vercel.app`
   - 这个地址可以立即访问！

### 方法 2: 使用 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 在项目根目录执行
cd english-learning-app
vercel

# 按照提示操作
# 首次部署选择生产环境
vercel --prod
```

## 🌐 部署到 Netlify

### 方法 1: 通过 GitHub 自动部署

1. **访问 Netlify**
   - 打开 https://netlify.com
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "Add new site" -> "Import an existing project"
   - 选择你的 GitHub 仓库
   - 点击 "Import"

3. **配置构建设置**
   - **Base directory**: `english-learning-app`
   - **Build command**: `npm run build`
   - **Publish directory**: `english-learning-app/dist`

4. **部署**
   - 点击 "Deploy site"
   - 等待部署完成

5. **获取访问地址**
   - 格式：`https://random-name.netlify.app`
   - 可以在设置中自定义域名

## 📝 部署后的配置

### 1. 配置 Supabase URL 重定向

在 Supabase Dashboard 中：
1. 进入 **Authentication** -> **URL Configuration**
2. 添加你的部署地址到 **Redirect URLs**
   - 例如：`https://your-app.vercel.app`
   - 例如：`https://your-app.netlify.app`

### 2. 更新 Supabase 配置（如需要）

如果使用环境变量，在部署平台添加：
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

然后在代码中使用：
```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
```

## 🔄 持续部署

推送代码到 GitHub 后，Vercel 和 Netlify 会自动重新部署：

```bash
git add .
git commit -m "Update: 描述你的更改"
git push
```

## 📊 部署平台对比

| 平台 | 免费额度 | 部署速度 | 自定义域名 | 推荐度 |
|------|---------|---------|-----------|--------|
| Vercel | ✅ 充足 | ⚡ 很快 | ✅ 支持 | ⭐⭐⭐⭐⭐ |
| Netlify | ✅ 充足 | ⚡ 快 | ✅ 支持 | ⭐⭐⭐⭐ |
| GitHub Pages | ✅ 免费 | 🐢 较慢 | ✅ 支持 | ⭐⭐⭐ |

## 🎯 推荐流程

1. ✅ 推送到 GitHub
2. ✅ 使用 Vercel 部署（最简单快速）
3. ✅ 配置 Supabase 重定向 URL
4. ✅ 测试部署的应用
5. ✅ 分享访问链接

## 🔗 获取访问地址

部署完成后，你会得到：

- **Vercel**: `https://your-project.vercel.app`
- **Netlify**: `https://your-project.netlify.app`

这些地址可以：
- ✅ 在任何设备上访问
- ✅ 分享给其他人
- ✅ 作为生产环境使用

## ⚠️ 注意事项

1. **不要提交敏感信息**
   - 确保 `.env` 文件在 `.gitignore` 中
   - Supabase 密钥不要硬编码（使用环境变量）

2. **构建优化**
   - 确保 `npm run build` 成功
   - 检查 `dist` 目录是否生成

3. **CORS 配置**
   - Supabase 需要配置允许的域名
   - 在 Supabase Dashboard 中添加部署域名

## 🆘 常见问题

**Q: 部署后无法访问？**
A: 检查构建是否成功，查看部署日志

**Q: 登录功能不工作？**
A: 确保在 Supabase 中添加了部署 URL 到重定向列表

**Q: 静态资源加载失败？**
A: 检查资源路径，确保使用相对路径

---

**开始部署吧！** 🚀

