import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://tfebjrfmdeibddmmwbii.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmZWJqcmZtZGVpYmRkbW13YmlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMTEzNDksImV4cCI6MjA3Nzc4NzM0OX0.WI2fkcvOmN0WOwn_h2b_Wdxt5cw0qBLRjO-jlvzePXg"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 数据库类型定义
export interface UserProfile {
  id: string
  username: string | null
  level: number
  experience_points: number
  streak_days: number
  total_words_learned: number
  role?: 'user' | 'admin' | 'super_admin'
  created_at: string
  updated_at: string
}

export interface Vocabulary {
  id: string
  word: string
  pronunciation: string | null
  definition_cn: string
  definition_en: string | null
  example_sentence: string | null
  translation: string | null
  audio_url: string | null
  image_url: string | null
  difficulty_level: number
  category: string | null
  created_at: string
}

export interface UserVocabulary {
  id: string
  user_id: string
  vocabulary_id: string
  stability: number
  difficulty: number
  due_date: string
  last_review: string | null
  review_count: number
  state: number
  created_at: string
}

export interface Achievement {
  id: string
  name: string
  description: string | null
  icon_url: string | null
  requirement_type: string | null
  requirement_value: number | null
  reward_xp: number
  created_at: string
}

export interface RhythmChallenge {
  id: string
  level_number: number
  title: string
  description: string | null
  difficulty: number
  bpm: number
  unlock_requirement: number
  reward_xp: number
  is_active: boolean
  created_at: string
}
