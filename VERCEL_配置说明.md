# Vercel 部署配置说明

## ⚠️ 重要：Vercel 项目设置

如果遇到 404 错误，请检查以下 Vercel 项目设置：

### 1. Root Directory（必须设置！）

在 Vercel 项目设置中：

1. 进入你的项目 → **Settings** → **General**
2. 找到 **Root Directory** 设置
3. 点击 **Edit**，设置为：`english-learning-app`
4. 点击 **Save**

**这是最重要的设置！** 如果不设置，Vercel 会在错误的目录下查找项目。

### 2. Build & Development Settings

在 **Settings** → **General** → **Build & Development Settings** 中：

- **Framework Preset**: `Vite`（会自动检测）
- **Build Command**: `npm run build`（默认，无需修改）
- **Output Directory**: `dist`（默认，无需修改）
- **Install Command**: `npm install`（默认，无需修改）

### 3. 环境变量（如果需要）

如果你的 Supabase 配置使用环境变量，在 **Settings** → **Environment Variables** 中添加：

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 4. 重新部署

修改设置后：

1. 进入 **Deployments** 标签
2. 点击最新的部署右侧的 **⋯** 菜单
3. 选择 **Redeploy**
4. 或者直接推送代码触发自动部署

---

## 🔍 排查 404 错误的步骤

### 步骤 1：检查 Root Directory

**最常见的原因！**

确保 Root Directory 设置为 `english-learning-app`，而不是根目录。

### 步骤 2：检查构建日志

1. 进入 Vercel 项目的 **Deployments** 标签
2. 点击最新的部署
3. 查看 **Build Logs**
4. 确认构建成功，没有错误

### 步骤 3：检查构建输出

在构建日志中，确认：
- `npm run build` 执行成功
- 生成了 `dist` 目录
- 没有构建错误

### 步骤 4：检查文件结构

构建完成后，在 Vercel 的部署详情中，应该能看到：
- `dist/index.html`
- `dist/assets/` 目录（包含 JS/CSS 文件）

---

## ✅ 正确的 Vercel 配置示例

```
项目结构：
english-learning-app/
├── english-learning-app/     ← 这是实际的项目目录
│   ├── package.json
│   ├── vite.config.ts
│   ├── vercel.json
│   ├── src/
│   └── dist/                ← 构建输出
└── README.md

Vercel 设置：
Root Directory: english-learning-app
Build Command: npm run build
Output Directory: dist
```

---

## 🚀 快速修复步骤

1. **进入 Vercel Dashboard**
   - 访问 https://vercel.com/dashboard
   - 选择你的项目

2. **设置 Root Directory**
   - Settings → General → Root Directory
   - 设置为：`english-learning-app`
   - 保存

3. **重新部署**
   - Deployments → 选择最新部署 → Redeploy
   - 或推送代码触发自动部署

4. **验证**
   - 等待部署完成
   - 访问你的 Vercel URL
   - 应该能看到应用了！

---

## 📝 如果还是不行

如果按照上述步骤操作后仍然 404，请检查：

1. **GitHub 仓库结构**
   - 确认 `english-learning-app/vercel.json` 文件存在
   - 确认 `english-learning-app/package.json` 存在

2. **构建命令**
   - 在本地运行 `cd english-learning-app && npm run build`
   - 确认能成功构建
   - 确认生成了 `dist` 目录

3. **联系支持**
   - 查看 Vercel 构建日志中的错误信息
   - 在 Vercel 社区寻求帮助

---

## 💡 提示

- Root Directory 设置是最常见的 404 原因
- 修改设置后必须重新部署
- 可以查看 Vercel 的构建日志来诊断问题
- 确保 `vercel.json` 文件在正确的位置（`english-learning-app/vercel.json`）

