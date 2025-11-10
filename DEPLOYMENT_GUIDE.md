# 节奏英语学习应用 - 部署指南

## 快速部署步骤

由于构建环境限制,以下是手动部署的步骤:

### 方法1: 使用Node.js环境部署

1. **安装依赖**
```bash
cd english-learning-app
npm install @supabase/supabase-js
npm install
```

2. **构建项目**
```bash
npm run build
```

3. **部署dist目录**
将生成的 `dist/` 目录部署到任何静态托管服务:
- Vercel: `vercel --prod`
- Netlify: 拖拽dist文件夹到netlify.com
- GitHub Pages: 推送dist到gh-pages分支

### 方法2: 使用Vercel一键部署

1. 将项目推送到GitHub
2. 在Vercel导入项目
3. 配置构建命令: `npm run build`
4. 配置输出目录: `dist`
5. 点击部署

### 方法3: 手动测试

如果只想快速测试,可以:

1. **启动开发服务器**
```bash
cd english-learning-app
npm install
npm run dev
```

2. **访问** `http://localhost:5173`

## 环境配置

项目已配置Supabase连接:
- URL: https://tfebjrfmdeibddmmwbii.supabase.co
- 匿名密钥: 已硬编码在 `src/lib/supabase.ts`

## 数据库已就绪

所有数据库表已创建并填充初始数据:
- ✅ user_profiles
- ✅ vocabulary (20个单词)
- ✅ user_vocabulary
- ✅ achievements (8个成就)
- ✅ user_achievements
- ✅ study_sessions
- ✅ rhythm_challenges (7个关卡)
- ✅ user_rhythm_scores

## 功能清单

- ✅ 用户注册/登录
- ✅ 个人仪表盘
- ✅ 词汇学习(FSRS算法)
- ✅ 节奏挑战游戏
- ✅ 成就系统
- ✅ 经验值和等级
- ✅ 连续学习追踪
- ✅ 响应式设计

## 注意事项

1. **依赖安装**: 确保网络畅通,@supabase/supabase-js需要从npm下载
2. **浏览器兼容**: 支持现代浏览器(Chrome, Firefox, Safari, Edge)
3. **移动端**: 完全响应式,支持手机和平板访问
4. **数据持久化**: 所有数据存储在Supabase,无需担心数据丢失

## 故障排除

### 如果构建失败

尝试删除node_modules重新安装:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 如果Supabase连接失败

检查网络连接和Supabase服务状态:
- 访问 https://tfebjrfmdeibddmmwbii.supabase.co
- 检查浏览器控制台错误信息

### 如果依赖安装超时

使用国内镜像:
```bash
npm config set registry https://registry.npmmirror.com
npm install
```

## 下一步

部署成功后,你可以:
1. 注册一个测试账号
2. 体验词汇学习功能
3. 挑战节奏游戏
4. 查看统计数据和成就

祝学习愉快!
