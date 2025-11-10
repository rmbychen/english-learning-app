-- 插入示例短语数据
INSERT INTO phrases (phrase, pronunciation, meaning_cn, meaning_en, example_sentence, translation, category, difficulty_level) VALUES
('by the way', '/baɪ ðə weɪ/', '顺便说一下', 'used to introduce a new topic', 'By the way, how was your weekend?', '顺便问一下，你周末过得怎么样？', '日常用语', 1),
('take it easy', '/teɪk ɪt ˈiːzi/', '别紧张，放轻松', 'remain calm and relaxed', 'Don''t worry, take it easy.', '别担心，放轻松。', '日常用语', 1),
('in the long run', '/ɪn ðə lɔːŋ rʌn/', '从长远来看', 'over a long period of time', 'This investment will be beneficial in the long run.', '从长远来看，这项投资是有益的。', '商务英语', 2),
('break the ice', '/breɪk ðə aɪs/', '打破僵局', 'make people feel more comfortable', 'Let''s play a game to break the ice.', '我们来玩个游戏打破僵局吧。', '社交英语', 2),
('hit the nail on the head', '/hɪt ðə neɪl ɑːn ðə hed/', '说到点子上', 'describe exactly what is causing a situation', 'You hit the nail on the head with your analysis.', '你的分析说到点子上了。', '习语表达', 3),
('cost an arm and a leg', '/kɔːst ən ɑːrm ənd ə leg/', '花费很多钱', 'be very expensive', 'That car costs an arm and a leg.', '那辆车价格昂贵。', '习语表达', 3),
('under the weather', '/ˈʌndər ðə ˈweðər/', '身体不舒服', 'feeling ill', 'I''m feeling a bit under the weather today.', '我今天感觉有点不舒服。', '习语表达', 3),
('spill the beans', '/spɪl ðə biːnz/', '泄露秘密', 'reveal a secret', 'Don''t spill the beans about the surprise party.', '别泄露惊喜派对的消息。', '习语表达', 4),
('once in a blue moon', '/wʌns ɪn ə bluː muːn/', '非常罕见', 'very rarely', 'I only see my cousin once in a blue moon.', '我很少见到我的表兄弟。', '习语表达', 4),
('piece of cake', '/piːs ʌv keɪk/', '小菜一碟', 'very easy', 'This math problem is a piece of cake.', '这道数学题是小菜一碟。', '习语表达', 2);

-- 插入示例句子练习数据
INSERT INTO sentence_exercises (exercise_type, sentence_en, sentence_cn, correct_answer, options, explanation, difficulty_level, category) VALUES
('fill_blank', 'I _____ to the store yesterday.', '我昨天_____去商店了。', 'went', '{"went", "go", "going", "goes"}', '过去时态用went', 1, '基础语法'),
('fill_blank', 'She _____ playing piano since she was 5.', '她从5岁起就_____弹钢琴。', 'has been', '{"has been", "is", "was", "will be"}', '现在完成进行时', 2, '时态语法'),
('fill_blank', 'If I _____ more money, I would travel the world.', '如果我有更多钱，我就会环游世界。', 'had', '{"had", "have", "will have", "would have"}', '虚拟语气条件句', 3, '虚拟语气'),
('translation', '我喜欢读书。', '', 'I like reading.', '{"I like reading", "I am reading", "I read", "I reading"}', '一般现在时表示习惯', 1, '翻译练习'),
('translation', '他正在做作业。', '', 'He is doing his homework.', '{"He is doing his homework", "He does his homework", "He did his homework", "He will do his homework"}', '现在进行时', 1, '翻译练习'),
('reorder', 'the / book / is / interesting / very', '', 'The book is very interesting.', NULL, '英语基本语序：主语+谓语+状语', 2, '句子重组');

-- 插入示例听力练习数据
INSERT INTO listening_exercises (title, audio_url, transcript, questions, difficulty_level, duration, category) VALUES
('日常对话', '/audio/daily_conversation.mp3', 'A: Hi, how are you today? B: I''m fine, thank you. And you? A: I''m great! What are your plans for the weekend?', '[{"question": "How is person B feeling?", "options": ["Tired", "Fine", "Sad", "Angry"], "correct": 1}, {"question": "What are they talking about?", "options": ["Work", "Weekend plans", "Weather", "Food"], "correct": 1}]', 1, 30, '日常对话'),
('商务会议', '/audio/business_meeting.mp3', 'Let''s discuss the quarterly results. Our sales have increased by 15% compared to last quarter.', '[{"question": "What are they discussing?", "options": ["Sales results", "Marketing plan", "Product launch", "Team meeting"], "correct": 0}, {"question": "How much did sales increase?", "options": ["10%", "15%", "20%", "25%"], "correct": 1}]', 3, 45, '商务英语');