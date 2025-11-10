-- 插入记忆技巧数据
INSERT INTO memory_techniques (technique_type, title, description, example_vocabulary_id) VALUES
('visual', '图像联想法', '将单词与具体的图像联系起来，通过视觉记忆加深印象。例如：apple联想到红苹果的图像。', (SELECT id FROM vocabulary WHERE word = 'apple' LIMIT 1)),
('phonetic', '音标记忆法', '通过单词的发音规律来记忆。computer的发音 /kəmˈpjuːtər/ 可以分解为"com-pu-ter"三个音节。', (SELECT id FROM vocabulary WHERE word = 'computer' LIMIT 1)),
('association', '联想记忆法', '将新单词与已知的单词或概念联系起来。beautiful可以联想到"beauty"(美丽)和"ful"(充满)，表示充满美丽。', (SELECT id FROM vocabulary WHERE word = 'beautiful' LIMIT 1)),
('root', '词根词缀法', '通过分析单词的词根、词缀来理解单词含义。success来自拉丁语"succedere"，"suc-"表示"下面"，"cedere"表示"走"，合起来表示"走过去"即成功。', (SELECT id FROM vocabulary WHERE word = 'success' LIMIT 1)),
('etymology', '词源记忆法', '了解单词的历史来源和演变过程。knowledge来自古英语"cnāwan"(知道)和"lagu"(法律)，表示通过学习获得的智慧。', (SELECT id FROM vocabulary WHERE word = 'knowledge' LIMIT 1));

-- 插入词汇关联数据
INSERT INTO word_associations (primary_vocabulary_id, associated_vocabulary_id, association_type, strength) 
SELECT 
    v1.id,
    v2.id,
    'synonym',
    4
FROM vocabulary v1, vocabulary v2 
WHERE v1.word = 'beautiful' AND v2.word = 'wonderful';

INSERT INTO word_associations (primary_vocabulary_id, associated_vocabulary_id, association_type, strength) 
SELECT 
    v1.id,
    v2.id,
    'root',
    5
FROM vocabulary v1, vocabulary v2 
WHERE v1.word = 'success' AND v2.word = 'achievement';

INSERT INTO word_associations (primary_vocabulary_id, associated_vocabulary_id, association_type, strength) 
SELECT 
    v1.id,
    v2.id,
    'thematic',
    3
FROM vocabulary v1, vocabulary v2 
WHERE v1.word = 'computer' AND v2.word = 'knowledge';

-- 更新词汇表，添加记忆辅助字段
UPDATE vocabulary SET 
    memory_tricks = '想象一个红色的苹果放在桌子上，咬一口甜甜的味道',
    word_roots = '来自拉丁语"malum"，表示"坏"，但在英语中演变为"苹果"的意思',
    associations = ARRAY['fruit', 'red', 'sweet', 'tree'],
    similar_words = ARRAY['apply', 'apple'],
    etymology = '古英语æppel，现代英语apple',
    mnemonic_image_url = '/imgs/memory/apple_memory.png'
WHERE word = 'apple';

UPDATE vocabulary SET 
    memory_tricks = 'com(共同) + put(思考) + er(表示人或物) = 共同思考的机器',
    word_roots = 'com(共同) + put(思考) + er(名词后缀)',
    associations = ARRAY['technology', 'work', 'office', 'digital'],
    similar_words = ARRAY['compute', 'computer'],
    etymology = '1945年由"compute"和"er"组合而成',
    mnemonic_image_url = '/imgs/memory/computer_memory.png'
WHERE word = 'computer';

UPDATE vocabulary SET 
    memory_tricks = 'beau(美丽) + tiful(充满) = 充满美丽的事物',
    word_roots = 'beau(美丽) + tiful(充满)',
    associations = ARRAY['pretty', 'gorgeous', 'lovely', 'stunning'],
    similar_words = ARRAY['beauty', 'beautiful'],
    etymology = '来自法语"beau"(美丽)，14世纪进入英语',
    mnemonic_image_url = '/imgs/memory/beautiful_memory.png'
WHERE word = 'beautiful';

UPDATE vocabulary SET 
    memory_tricks = 'suc(下面) + cess(走) = 从下面走过去，达到目标',
    word_roots = 'suc(下面) + cess(走)',
    associations = ARRAY['achievement', 'victory', 'triumph', 'win'],
    similar_words = ARRAY['succeed', 'success'],
    etymology = '来自拉丁语"succedere"，15世纪进入英语',
    mnemonic_image_url = '/imgs/memory/success_memory.png'
WHERE word = 'success';

UPDATE vocabulary SET 
    memory_tricks = 'know(知道) + ledge( ledge表示横木，知识像横木一样支撑我们)',
    word_roots = 'know(知道) + ledge( ledge)',
    associations = ARRAY['learning', 'wisdom', 'information', 'education'],
    similar_words = ARRAY['know', 'knowledge'],
    etymology = '古英语"cnāwlagu"，"cnāwan"(知道)+ "lagu"(法律)',
    mnemonic_image_url = '/imgs/memory/knowledge_memory.png'
WHERE word = 'knowledge';