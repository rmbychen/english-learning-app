CREATE TABLE user_rhythm_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES rhythm_challenges(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 0,
    accuracy FLOAT DEFAULT 0.0,
    perfect_count INTEGER DEFAULT 0,
    good_count INTEGER DEFAULT 0,
    miss_count INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);