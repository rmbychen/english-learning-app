-- 为vocabulary表添加记忆辅助字段
ALTER TABLE vocabulary ADD COLUMN memory_tricks TEXT; -- 记忆技巧
ALTER TABLE vocabulary ADD COLUMN word_roots TEXT; -- 词根词缀
ALTER TABLE vocabulary ADD COLUMN associations TEXT[]; -- 联想词汇数组
ALTER TABLE vocabulary ADD COLUMN similar_words TEXT[]; -- 相似词汇数组
ALTER TABLE vocabulary ADD COLUMN etymology TEXT; -- 词源说明
ALTER TABLE vocabulary ADD COLUMN mnemonic_image_url TEXT; -- 助记图片URL

-- 创建记忆技巧表
CREATE TABLE memory_techniques (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    technique_type VARCHAR(50) NOT NULL, -- 'association', 'root', 'etymology', 'visual', 'phonetic'
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    example_vocabulary_id UUID REFERENCES vocabulary(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建词汇关联表
CREATE TABLE word_associations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    primary_vocabulary_id UUID NOT NULL REFERENCES vocabulary(id),
    associated_vocabulary_id UUID NOT NULL REFERENCES vocabulary(id),
    association_type VARCHAR(50) NOT NULL, -- 'synonym', 'antonym', 'root', 'family', 'thematic'
    strength INTEGER DEFAULT 1, -- 关联强度 1-5
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建个性化推荐表
CREATE TABLE personalized_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    vocabulary_id UUID NOT NULL REFERENCES vocabulary(id),
    recommendation_type VARCHAR(50) NOT NULL, -- 'memory_trick', 'association', 'practice'
    reason TEXT, -- 推荐理由
    priority INTEGER DEFAULT 1,
    shown BOOLEAN DEFAULT FALSE,
    clicked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);