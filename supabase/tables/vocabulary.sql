CREATE TABLE vocabulary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    word VARCHAR(100) NOT NULL,
    pronunciation VARCHAR(200),
    definition_cn TEXT NOT NULL,
    definition_en TEXT,
    example_sentence TEXT,
    translation TEXT,
    audio_url TEXT,
    image_url TEXT,
    difficulty_level INTEGER DEFAULT 1,
    category VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);