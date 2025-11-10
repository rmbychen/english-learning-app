CREATE TABLE rhythm_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level_number INTEGER NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    difficulty INTEGER DEFAULT 1,
    bpm INTEGER DEFAULT 90,
    unlock_requirement INTEGER DEFAULT 0,
    reward_xp INTEGER DEFAULT 50,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);