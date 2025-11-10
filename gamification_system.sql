-- 创建关卡系统表
CREATE TABLE game_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level_number INTEGER NOT NULL,
    level_name VARCHAR(100) NOT NULL,
    description TEXT,
    difficulty_level INTEGER NOT NULL,
    required_words INTEGER NOT NULL, -- 需要掌握的单词数
    required_score INTEGER NOT NULL, -- 需要达到的分数
    time_limit INTEGER, -- 时间限制(秒)
    special_requirements TEXT, -- 特殊要求
    rewards JSONB, -- 奖励内容
    boss_battle BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建用户关卡进度表
CREATE TABLE user_level_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    level_id UUID NOT NULL REFERENCES game_levels(id),
    status VARCHAR(20) DEFAULT 'locked', -- 'locked', 'unlocked', 'completed', 'failed'
    best_score INTEGER DEFAULT 0,
    best_time INTEGER, -- 最佳用时(秒)
    attempts INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, level_id)
);

-- 创建特殊挑战表
CREATE TABLE special_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_name VARCHAR(100) NOT NULL,
    description TEXT,
    challenge_type VARCHAR(50) NOT NULL, -- 'speed', 'accuracy', 'endurance', 'boss'
    difficulty_level INTEGER NOT NULL,
    time_limit INTEGER,
    target_score INTEGER,
    rewards JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建用户挑战记录表
CREATE TABLE user_challenge_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    challenge_id UUID NOT NULL REFERENCES special_challenges(id),
    score INTEGER NOT NULL,
    completion_time INTEGER, -- 完成时间(秒)
    accuracy_rate DECIMAL(5,2), -- 准确率
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建排行榜表
CREATE TABLE leaderboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    leaderboard_type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly', 'all_time'
    category VARCHAR(50) NOT NULL, -- 'total_score', 'accuracy', 'speed', 'streak'
    user_id UUID NOT NULL,
    username VARCHAR(50),
    score INTEGER NOT NULL,
    additional_data JSONB, -- 额外数据(准确率、用时等)
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建道具系统表
CREATE TABLE game_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_name VARCHAR(100) NOT NULL,
    item_type VARCHAR(50) NOT NULL, -- 'powerup', 'hint', 'shield', 'boost'
    description TEXT,
    effect_description TEXT,
    cost INTEGER, -- 道具价格
    rarity VARCHAR(20) DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
    icon_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建用户道具库存表
CREATE TABLE user_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    item_id UUID NOT NULL REFERENCES game_items(id),
    quantity INTEGER DEFAULT 1,
    acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, item_id)
);

-- 创建用户道具使用记录表
CREATE TABLE item_usage_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    item_id UUID NOT NULL REFERENCES game_items(id),
    level_id UUID REFERENCES game_levels(id),
    challenge_id UUID REFERENCES special_challenges(id),
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);