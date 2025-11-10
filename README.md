# 节奏英语学习应用

> 一个专为忙碌上班族设计的游戏化英语学习平台，融合音乐节拍、速度挑战和智能复习算法

## ✨ 项目特色

- 🎮 **游戏化学习**: 等级系统、经验值、成就徽章，让学习充满乐趣
- 🎵 **音乐节奏**: 7个难度的节奏挑战，通过音乐提升学习效率
- 🧠 **智能复习**: 基于FSRS算法的间隔重复系统，科学记忆
- 📱 **响应式设计**: 完美适配手机、平板、电脑，随时随地学习
- 🔥 **连续学习**: 追踪学习连续天数，培养良好习惯
- 🏆 **成就系统**: 8种成就等你解锁，见证成长轨迹
- 🎬 **视频学习**: 多媒体学习资源，提升学习效果
- 🧠 **记忆助手**: 多维度记忆辅助，让记忆更轻松

## 🚀 快速开始

### 安装依赖

```bash
cd english-learning-app
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:5173

### 生产构建

```bash
npm run build
```

## 📦 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式方案**: TailwindCSS
- **后端服务**: Supabase (Database + Auth + API)
- **图标库**: Lucide React
- **核心算法**: FSRS间隔重复算法

## 🎯 核心功能

### 1. 用户系统
- 邮箱注册/登录
- 个人资料管理
- 学习进度追踪

### 2. 词汇学习
- FSRS智能复习算法
- 四级评分系统 (Again/Hard/Good/Easy)
- 单词卡片 (音标+释义+例句)
- 自动调度复习时间

### 3. 节奏挑战
- 7个难度等级 (BPM 60-140)
- 实时节拍可视化
- 精确判定系统 (Perfect/Good/Miss)
- 成绩统计和排行

### 4. 游戏化系统
- 等级和经验值
- 8种成就徽章
- 连续学习天数
- 今日学习目标

### 5. 视频学习
- 视频课程播放
- 学习进度跟踪
- 字幕支持

### 6. 快速学习
- 5分钟快速学习模式
- 离线缓存支持
- 学习提醒

## 📊 数据库架构

应用使用Supabase PostgreSQL，包含以下表：

- `user_profiles` - 用户资料和统计
- `vocabulary` - 词汇库
- `user_vocabulary` - 学习记录 (FSRS参数)
- `achievements` - 成就定义
- `user_achievements` - 用户成就
- `study_sessions` - 学习会话
- `rhythm_challenges` - 节奏关卡
- `user_rhythm_scores` - 节奏成绩
- `video_lessons` - 视频课程
- `user_video_progress` - 视频学习进度

## 🔧 环境配置

项目已配置Supabase，需要在 `english-learning-app/src/lib/supabase.ts` 中配置：

```typescript
const supabaseUrl = "YOUR_SUPABASE_URL"
const supabaseAnonKey = "YOUR_SUPABASE_ANON_KEY"
```

## 📱 部署

### Vercel (推荐)

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置构建命令: `cd english-learning-app && npm run build`
4. 配置输出目录: `english-learning-app/dist`
5. 添加环境变量（如需要）
6. 点击部署

### Netlify

1. 将代码推送到 GitHub
2. 在 [Netlify](https://netlify.com) 导入项目
3. 配置构建命令: `cd english-learning-app && npm run build`
4. 配置发布目录: `english-learning-app/dist`
5. 点击部署

### 其他平台

部署 `english-learning-app/dist/` 目录到任何静态托管服务

## 📖 文档

- [项目总结](./PROJECT_SUMMARY.md) - 完整功能说明
- [部署指南](./DEPLOYMENT_GUIDE.md) - 详细部署步骤
- [项目完整性分析](./项目完整性分析报告.md) - 项目分析报告

## 🎯 使用场景

适合:
- 🕐 忙碌的上班族 - 碎片时间学习
- 📱 移动学习者 - 随时随地复习
- 🎮 游戏爱好者 - 寓教于乐
- 🎵 音乐爱好者 - 结合节奏学习

## 📄 许可

MIT License

## 👨‍💻 开发者

开始你的英语学习之旅吧! 🚀

