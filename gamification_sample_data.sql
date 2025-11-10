-- 插入游戏关卡数据
INSERT INTO game_levels (level_number, level_name, description, difficulty_level, required_words, required_score, time_limit, special_requirements, rewards, boss_battle) VALUES
(1, '初学者之路', '学习基础英语单词，掌握基本发音', 1, 10, 100, 300, '完成10个单词的学习', '{"xp": 50, "coins": 100, "items": ["hint_token"]}', false),
(2, '词汇扩充', '学习更多日常用词，提高词汇量', 1, 15, 150, 420, '准确率达到80%', '{"xp": 75, "coins": 150, "items": ["power_boost"]}', false),
(3, '发音挑战', '专注练习单词发音，提高口语能力', 2, 20, 200, 480, '语音练习完成度100%', '{"xp": 100, "coins": 200, "items": ["pronunciation_master"]}', false),
(4, '记忆大师', '运用记忆技巧，快速掌握新单词', 2, 25, 250, 540, '使用至少3种记忆技巧', '{"xp": 125, "coins": 250, "items": ["memory_enhancer"]}', false),
(5, '速度之王', '在时间压力下快速学习，考验反应能力', 3, 30, 300, 360, '平均每个单词用时不超过12秒', '{"xp": 150, "coins": 300, "items": ["speed_boost"]}', false),
(6, '语法达人', '学习单词的同时掌握基本语法', 3, 35, 350, 600, '完成语法练习', '{"xp": 175, "coins": 350, "items": ["grammar_guide"]}', false),
(7, '流利表达', '从单词到句子的进阶学习', 4, 40, 400, 720, '完成句子翻译任务', '{"xp": 200, "coins": 400, "items": ["fluency_boost"]}', false),
(8, '文化探索', '通过英语了解西方文化', 4, 45, 450, 780, '学习文化相关词汇', '{"xp": 225, "coins": 450, "items": ["cultural_knowledge"]}', false),
(9, '商务英语', '学习职场和商务场景英语', 5, 50, 500, 840, '完成商务场景模拟', '{"xp": 250, "coins": 500, "items": ["business_english"]}', false),
(10, '英语大师', '综合运用所有技能，达到英语流利水平', 5, 60, 600, 900, '综合能力测试', '{"xp": 500, "coins": 1000, "items": ["master_badge", "legendary_boost"]}', true);

-- 插入特殊挑战数据
INSERT INTO special_challenges (challenge_name, description, challenge_type, difficulty_level, time_limit, target_score, rewards) VALUES
('闪电挑战', '在极短时间内学习尽可能多的单词', 'speed', 3, 60, 50, '{"xp": 100, "coins": 200, "items": ["lightning_boost"]}'),
('完美主义者', '追求100%准确率的挑战', 'accuracy', 4, 300, 100, '{"xp": 150, "coins": 300, "items": ["perfectionist_badge"]}'),
('马拉松学习', '长时间持续学习，考验耐力', 'endurance', 5, 1800, 200, '{"xp": 300, "coins": 500, "items": ["marathon_medal"]}'),
('Boss战：词汇之王', '最终挑战，测试所有技能', 'boss', 5, 600, 500, '{"xp": 1000, "coins": 2000, "items": ["king_crown", "ultimate_boost"]}');

-- 插入道具数据
INSERT INTO game_items (item_name, item_type, description, effect_description, cost, rarity, icon_url) VALUES
('提示令牌', 'hint', '获得单词学习的额外提示', '显示单词的详细解释和例句', 50, 'common', '/icons/hint_token.png'),
('力量加成', 'powerup', '临时提高学习效率和得分', '接下来5分钟内经验值和分数翻倍', 100, 'rare', '/icons/power_boost.png'),
('发音大师', 'boost', '提升语音识别准确度', '语音练习准确率提升20%', 150, 'rare', '/icons/pronunciation_master.png'),
('记忆增强器', 'boost', '帮助快速记忆新单词', '新单词记忆速度提升30%', 200, 'epic', '/icons/memory_enhancer.png'),
('速度爆发', 'powerup', '大幅提升学习速度', '单词显示时间减少50%', 300, 'epic', '/icons/speed_boost.png'),
('语法指南', 'hint', '提供语法学习帮助', '显示相关语法规则和用法', 250, 'rare', '/icons/grammar_guide.png'),
('流利加成', 'boost', '提升口语表达流畅度', '口语练习评分提升', 350, 'epic', '/icons/fluency_boost.png'),
('文化知识', 'hint', '提供文化背景知识', '显示单词的文化内涵和使用场景', 200, 'rare', '/icons/cultural_knowledge.png'),
('商务英语', 'boost', '专注商务场景学习', '商务词汇学习效率提升', 400, 'epic', '/icons/business_english.png'),
('大师徽章', 'powerup', '终极成就道具', '永久提升所有学习效果10%', 1000, 'legendary', '/icons/master_badge.png'),
('传奇加成', 'powerup', '传奇级力量道具', '接下来10分钟内所有效果翻倍', 2000, 'legendary', '/icons/legendary_boost.png'),
('国王皇冠', 'powerup', '胜利者的象征', '解锁所有高级功能和特权', 5000, 'legendary', '/icons/king_crown.png');

-- 插入示例排行榜数据
INSERT INTO leaderboards (leaderboard_type, category, user_id, username, score, additional_data) VALUES
('weekly', 'total_score', gen_random_uuid(), '学习达人', 2580, '{"accuracy": 92, "words_learned": 156, "streak": 7}'),
('weekly', 'total_score', gen_random_uuid(), '英语小王子', 2340, '{"accuracy": 89, "words_learned": 142, "streak": 5}'),
('weekly', 'total_score', gen_random_uuid(), '词汇女王', 2190, '{"accuracy": 94, "words_learned": 138, "streak": 12}'),
('weekly', 'total_score', gen_random_uuid(), '发音高手', 2050, '{"accuracy": 96, "words_learned": 125, "streak": 3}'),
('weekly', 'total_score', gen_random_uuid(), '记忆大师', 1980, '{"accuracy": 88, "words_learned": 134, "streak": 8}');