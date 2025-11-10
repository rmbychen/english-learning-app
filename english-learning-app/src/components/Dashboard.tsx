import { useEffect, useState } from 'react'
import { supabase, UserProfile, Achievement } from '../lib/supabase'
import { Trophy, Flame, Target, BookOpen, Zap, Award, Shield } from 'lucide-react'

export default function Dashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 加载用户资料
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (profileError) throw profileError
      setProfile(profileData)

      // 加载成就
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .order('requirement_value', { ascending: true })

      if (achievementsError) throw achievementsError
      setAchievements(achievementsData || [])

      // 加载已解锁成就
      const { data: unlockedData, error: unlockedError } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', user.id)

      if (unlockedError) throw unlockedError
      setUnlockedAchievements((unlockedData || []).map(a => a.achievement_id))

    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  const levelProgress = profile ? (profile.experience_points % 100) : 0

  return (
    <div className="space-y-8">
      {/* 用户信息卡片 */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-3xl font-bold text-gray-900">
                {profile?.username || '学习者'}
              </h2>
              {profile?.role === 'super_admin' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <Shield className="w-3 h-3 mr-1" />
                  超级管理员
                </span>
              )}
              {profile?.role === 'admin' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500 text-white">
                  <Shield className="w-3 h-3 mr-1" />
                  管理员
                </span>
              )}
            </div>
            <p className="text-gray-600">继续你的英语学习之旅</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-indigo-600">LV {profile?.level}</div>
            <p className="text-sm text-gray-600">等级</p>
          </div>
        </div>

        {/* 经验值进度条 */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>经验值</span>
            <span>{profile?.experience_points} XP</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${levelProgress}%` }}
            ></div>
          </div>
        </div>

        {/* 统计数据 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 bg-orange-50 rounded-lg p-4">
            <Flame className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{profile?.streak_days}</p>
              <p className="text-sm text-gray-600">连续天数</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 bg-blue-50 rounded-lg p-4">
            <BookOpen className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{profile?.total_words_learned}</p>
              <p className="text-sm text-gray-600">已学单词</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 bg-purple-50 rounded-lg p-4">
            <Zap className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{profile?.experience_points}</p>
              <p className="text-sm text-gray-600">总经验值</p>
            </div>
          </div>
        </div>
      </div>

      {/* 成就系统 */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <Trophy className="w-8 h-8 text-yellow-500" />
          <h3 className="text-2xl font-bold text-gray-900">成就系统</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => {
            const isUnlocked = unlockedAchievements.includes(achievement.id)
            return (
              <div
                key={achievement.id}
                className={`border-2 rounded-lg p-4 transition-all ${
                  isUnlocked
                    ? 'border-yellow-400 bg-yellow-50'
                    : 'border-gray-200 bg-gray-50 opacity-60'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isUnlocked ? 'bg-yellow-400' : 'bg-gray-300'
                  }`}>
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">{achievement.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                    <div className="flex items-center text-xs text-indigo-600 font-medium">
                      <Zap className="w-4 h-4 mr-1" />
                      {achievement.reward_xp} XP
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {achievements.length === 0 && (
          <p className="text-center text-gray-500 py-8">暂无成就数据</p>
        )}
      </div>

      {/* 今日目标 */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <Target className="w-8 h-8 text-green-500" />
          <h3 className="text-2xl font-bold text-gray-900">今日目标</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">学习20个新单词</p>
              <p className="text-sm text-gray-600">还需学习 {Math.max(0, 20 - (profile?.total_words_learned || 0))} 个</p>
            </div>
            <div className="text-green-600 font-bold">+100 XP</div>
          </div>
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">完成1次节奏挑战</p>
              <p className="text-sm text-gray-600">测试你的反应速度</p>
            </div>
            <div className="text-blue-600 font-bold">+50 XP</div>
          </div>
          <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">复习10个单词</p>
              <p className="text-sm text-gray-600">巩固记忆</p>
            </div>
            <div className="text-purple-600 font-bold">+30 XP</div>
          </div>
        </div>
      </div>
    </div>
  )
}
