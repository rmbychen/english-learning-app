-- 创建词组和短语表
CREATE TABLE phrases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phrase VARCHAR(200) NOT NULL,
    pronunciation VARCHAR(200),
    meaning_cn TEXT NOT NULL,
    meaning_en TEXT,
    example_sentence TEXT NOT NULL,
    translation TEXT,
    category VARCHAR(50),
    difficulty_level INTEGER DEFAULT 1,
    audio_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建句子练习表
CREATE TABLE sentence_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_type VARCHAR(50) NOT NULL, -- 'fill_blank', 'translation', 'reorder'
    sentence_en TEXT NOT NULL,
    sentence_cn TEXT,
    correct_answer TEXT NOT NULL,
    options TEXT[], -- 选择题选项
    explanation TEXT,
    difficulty_level INTEGER DEFAULT 1,
    category VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建听力训练表
CREATE TABLE listening_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    audio_url TEXT NOT NULL,
    transcript TEXT,
    questions JSONB, -- 题目数组
    difficulty_level INTEGER DEFAULT 1,
    duration INTEGER, -- 音频时长(秒)
    category VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建用户练习记录表
CREATE TABLE user_exercise_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    exercise_type VARCHAR(50) NOT NULL,
    exercise_id UUID NOT NULL, -- 关联到具体的练习ID
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    time_spent INTEGER, -- 用时(秒)
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建用户短语学习表
CREATE TABLE user_phrases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    phrase_id UUID NOT NULL REFERENCES phrases(id),
    mastery_level INTEGER DEFAULT 0, -- 0-5，熟练度等级
    last_reviewed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    review_count INTEGER DEFAULT 0,
    next_review TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, phrase_id)
);

-- 为vocabulary表添加短语相关字段
ALTER TABLE vocabulary ADD COLUMN related_phrases TEXT[]; -- 相关短语数组
ALTER TABLE vocabulary ADD COLUMN usage_examples TEXT[]; -- 用法示例数组