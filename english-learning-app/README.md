# 节奏英语学习应用

> 一个专为忙碌上班族设计的游戏化英语学习平台,融合音乐节拍、速度挑战和智能复习算法

## ✨ 项目特色

- 🎮 **游戏化学习**: 等级系统、经验值、成就徽章,让学习充满乐趣
- 🎵 **音乐节奏**: 7个难度的节奏挑战,通过音乐提升学习效率
- 🧠 **智能复习**: 基于FSRS算法的间隔重复系统,科学记忆
- 📱 **响应式设计**: 完美适配手机、平板、电脑,随时随地学习
- 🔥 **连续学习**: 追踪学习连续天数,培养良好习惯
- 🏆 **成就系统**: 8种成就等你解锁,见证成长轨迹

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

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

## 📊 数据库架构

应用使用Supabase PostgreSQL,包含以下表:

- `user_profiles` - 用户资料和统计
- `vocabulary` - 词汇库 (已有20个单词)
- `user_vocabulary` - 学习记录 (FSRS参数)
- `achievements` - 成就定义 (8个成就)
- `user_achievements` - 用户成就
- `study_sessions` - 学习会话
- `rhythm_challenges` - 节奏关卡 (7关)
- `user_rhythm_scores` - 节奏成绩

## 🎮 游戏化设计

### 经验值获取
- 学习新单词: +10 XP
- 复习单词: +5 XP
- 完成节奏挑战: +50~300 XP
- 解锁成就: +50~500 XP

### 成就列表
1. **初学者** - 完成第一次学习 (+50 XP)
2. **连续学习者** - 连续学习7天 (+200 XP)
3. **词汇达人** - 学习100个单词 (+500 XP)
4. **速度之王** - 完成5个节奏挑战 (+300 XP)
5. **完美主义者** - 获得10次完美评分 (+400 XP)
6. **经验大师** - 获得1000经验值 (+100 XP)
7. **学习马拉松** - 单次学习超过1小时 (+250 XP)
8. **复习专家** - 完成50次复习 (+150 XP)

## 🎵 节奏挑战关卡

1. **入门村 - 慢节奏** (60 BPM) - 轻松入门
2. **入门村 - 中节奏** (80 BPM) - 稳步提升
3. **职场区 - 工作节奏** (90 BPM) - 模拟职场
4. **职场区 - 会议节奏** (100 BPM) - 快速反应
5. **进阶区 - 速度挑战** (120 BPM) - 挑战极限
6. **进阶区 - 音乐律动** (110 BPM) - 随乐而动
7. **Boss战 - 终极考验** (140 BPM) - 终极挑战

## 🧠 FSRS算法

应用使用Free Spaced Repetition Scheduler (FSRS)算法:
- 比传统SM-2算法更精确
- 动态调整复习间隔
- 个性化学习路径
- 最大化记忆保持率

评分影响:
- **Again**: 大幅缩短间隔,增加难度
- **Hard**: 略微缩短间隔
- **Good**: 正常延长间隔
- **Easy**: 大幅延长间隔

## 📱 响应式设计

完美适配:
- 📱 手机 (320px+)
- 📱 平板 (768px+)
- 💻 桌面 (1024px+)

## 🔧 环境配置

项目已配置Supabase:
```
SUPABASE_URL: https://tfebjrfmdeibddmmwbii.supabase.co
SUPABASE_ANON_KEY: (已配置在代码中)
```

## 📂 项目结构

```
src/
├── components/
│   ├── Auth.tsx              # 认证组件
│   ├── Dashboard.tsx         # 仪表盘
│   ├── VocabularyLearning.tsx  # 词汇学习
│   └── RhythmChallenge.tsx    # 节奏挑战
├── lib/
│   └── supabase.ts           # Supabase配置
├── App.tsx                    # 主应用
└── App.css                    # 样式
```

## 🚀 部署

### Vercel (推荐)
```bash
vercel --prod
```

### Netlify
拖拽 `dist/` 目录到 netlify.com

### 其他平台
部署 `dist/` 目录到任何静态托管服务

详见: [DEPLOYMENT_GUIDE.md](/workspace/DEPLOYMENT_GUIDE.md)

## 📖 文档

- [项目总结](/workspace/PROJECT_SUMMARY.md) - 完整功能说明
- [部署指南](/workspace/DEPLOYMENT_GUIDE.md) - 部署步骤

## 🎯 使用场景

适合:
- 🕐 忙碌的上班族 - 碎片时间学习
- 📱 移动学习者 - 随时随地复习
- 🎮 游戏爱好者 - 寓教于乐
- 🎵 音乐爱好者 - 结合节奏学习

## 🔮 未来计划

- [ ] 语音识别和发音评估
- [ ] 视频学习课程
- [ ] 社交功能和排行榜
- [ ] 更多游戏模式
- [ ] AI对话练习
- [ ] PWA离线支持
- [ ] 详细数据分析
- [ ] 个性化推荐

## 📄 许可

MIT License

## 👨‍💻 开发者

MiniMax Agent

---

**开始你的英语学习之旅吧!** 🚀
