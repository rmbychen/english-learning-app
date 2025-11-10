-- 创建视频学习表
CREATE TABLE video_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration INTEGER, -- 视频时长（秒）
    difficulty_level INTEGER DEFAULT 1,
    category VARCHAR(50),
    vocabulary_ids UUID[], -- 关联的词汇ID数组
    subtitles_url TEXT, -- 字幕文件URL
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建视频学习记录表
CREATE TABLE user_video_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    video_id UUID NOT NULL REFERENCES video_lessons(id),
    progress_seconds INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    watch_count INTEGER DEFAULT 0,
    last_watched TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, video_id)
);

-- 为vocabulary表添加视频相关字段
ALTER TABLE vocabulary ADD COLUMN video_url TEXT;
ALTER TABLE vocabulary ADD COLUMN video_description TEXT;
ALTER TABLE vocabulary ADD COLUMN key_points TEXT[]; -- 重点词汇数组