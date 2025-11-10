CREATE TABLE user_vocabulary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    vocabulary_id UUID NOT NULL REFERENCES vocabulary(id) ON DELETE CASCADE,
    stability FLOAT DEFAULT 1.0,
    difficulty FLOAT DEFAULT 5.0,
    due_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_review TIMESTAMP WITH TIME ZONE,
    review_count INTEGER DEFAULT 0,
    state INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);