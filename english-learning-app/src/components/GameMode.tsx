import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { 
  Trophy, 
  Star, 
  Clock, 
  Target, 
  Zap, 
  Shield, 
  Gift, 
  Crown,
  Play,
  Pause,
  RotateCcw,
  Award,
  Users,
  TrendingUp
} from 'lucide-react'

interface GameLevel {
  id: string
  level_number: number
  level_name: string
  description: string
  difficulty_level: number
  required_words: number
  required_score: number
  time_limit?: number
  special_requirements?: string
  rewards: any
  boss_battle: boolean
}

interface UserLevelProgress {
  id: string
  level_id: string
  status: string
  best_score: number
  best_time?: number
  attempts: number
  completed_at?: string
}

interface GameItem {
  id: string
  item_name: string
  item_type: string
  description: string
  effect_description: string
  cost: number
  rarity: string
  icon_url?: string
}

interface UserInventory {
  id: string
  item_id: string
  quantity: number
  item: GameItem
}

interface LeaderboardEntry {
  id: string
  username: string
  score: number
  additional_data: any
}

export default function GameMode() {
  const [levels, setLevels] = useState<GameLevel[]>([])
  const [userProgress, setUserProgress] = useState<UserLevelProgress[]>([])
  const [inventory, setInventory] = useState<UserInventory[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [currentLevel, setCurrentLevel] = useState<GameLevel | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [gameStats, setGameStats] = useState({
    score: 0,
    timeLeft: 0,
    wordsLearned: 0,
    accuracy: 0
  })
  const [activeTab, setActiveTab] = useState<'levels' | 'challenges' | 'leaderboard' | 'shop'>('levels')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGameData()
  }, [])

  const loadGameData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 加载关卡数据
      const { data: levelsData } = await supabase
        .from('game_levels')
        .select('*')
        .order('level_number')

      setLevels(levelsData || [])

      // 加载用户进度
      const { data: progressData } = await supabase
        .from('user_level_progress')
        .select('*')
        .eq('user_id', user.id)

      setUserProgress(progressData || [])

      // 加载用户道具
      const { data: inventoryData } = await supabase
        .from('user_inventory')
        .select(`
          *,
          item:item_id(*)
        `)
        .eq('user_id', user.id)

      setInventory(inventoryData || [])

      // 加载排行榜
      const { data: leaderboardData } = await supabase
        .from('leaderboards')
        .select('*')
        .eq('leaderboard_type', 'weekly')
        .order('score', { ascending: false })
        .limit(10)

      setLeaderboard(leaderboardData || [])
    } catch (error) {
      console.error('加载游戏数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const getLevelStatus = (level: GameLevel) => {
    const progress = userProgress.find(p => p.level_id === level.id)
    if (!progress) return 'locked'
    return progress.status
  }

  const getLevelProgress = (level: GameLevel) => {
    const progress = userProgress.find(p => p.level_id === level.id)
    if (!progress || progress.status !== 'completed') return 0
    return Math.min(100, (progress.best_score / level.required_score) * 100)
  }

  const getDifficultyColor = (level: number) => {
    const colors = {
      1: 'bg-green-100 text-green-800',
      2: 'bg-blue-100 text-blue-800',
      3: 'bg-yellow-100 text-yellow-800',
      4: 'bg-orange-100 text-orange-800',
      5: 'bg-red-100 text-red-800'
    }
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getRarityColor = (rarity: string) => {
    const colors = {
      'common': 'bg-gray-100 text-gray-800',
      'rare': 'bg-blue-100 text-blue-800',
      'epic': 'bg-purple-100 text-purple-800',
      'legendary': 'bg-yellow-100 text-yellow-800'
    }
    return colors[rarity as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const startLevel = (level: GameLevel) => {
    setCurrentLevel(level)
    setIsPlaying(true)
    setGameStats({
      score: 0,
      timeLeft: level.time_limit || 300,
      wordsLearned: 0,
      accuracy: 0
    })
  }

  const endLevel = () => {
    setIsPlaying(false)
    setCurrentLevel(null)
    // 这里应该保存游戏结果到数据库
    loadGameData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 游戏统计面板 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">当前等级</p>
              <p className="text-3xl font-bold text-orange-600">
                {Math.max(...userProgress.filter(p => p.status === 'completed').map(p => {
                  const level = levels.find(l => l.id === p.level_id)
                  return level?.level_number || 0
                }), 0)}
              </p>
            </div>
            <Crown className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">总分数</p>
              <p className="text-3xl font-bold text-purple-600">
                {userProgress.reduce((sum, p) => sum + p.best_score, 0)}
              </p>
            </div>
            <Trophy className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">完成关卡</p>
              <p className="text-3xl font-bold text-teal-600">
                {userProgress.filter(p => p.status === 'completed').length}
              </p>
            </div>
            <Star className="w-8 h-8 text-teal-500" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-pink-50 to-red-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">道具数量</p>
              <p className="text-3xl font-bold text-red-600">
                {inventory.reduce((sum, item) => sum + item.quantity, 0)}
              </p>
            </div>
            <Gift className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* 标签导航 */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {[
            { key: 'levels', label: '关卡模式', icon: Target },
            { key: 'challenges', label: '特殊挑战', icon: Zap },
            { key: 'leaderboard', label: '排行榜', icon: TrendingUp },
            { key: 'shop', label: '道具商店', icon: Gift }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.key
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* 内容区域 */}
      <div className="min-h-96">
        {/* 关卡模式 */}
        {activeTab === 'levels' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {levels.map((level) => {
              const status = getLevelStatus(level)
              const progress = getLevelProgress(level)
              const progressData = userProgress.find(p => p.level_id === level.id)
              
              return (
                <div
                  key={level.id}
                  className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all ${
                    status === 'locked' ? 'opacity-60' : 'hover:shadow-xl'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {level.boss_battle && <Crown className="w-6 h-6 text-yellow-500" />}
                        <span className="text-2xl font-bold text-gray-900">
                          {level.level_number}
                        </span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(level.difficulty_level)}`}>
                        难度 {level.difficulty_level}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{level.level_name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{level.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">要求单词:</span>
                        <span className="font-medium">{level.required_words}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">目标分数:</span>
                        <span className="font-medium">{level.required_score}</span>
                      </div>
                      {level.time_limit && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">时间限制:</span>
                          <span className="font-medium">{Math.floor(level.time_limit / 60)}:{(level.time_limit % 60).toString().padStart(2, '0')}</span>
                        </div>
                      )}
                    </div>
                    
                    {status !== 'locked' && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>最佳成绩</span>
                          <span>{progressData?.best_score || 0} / {level.required_score}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      {status === 'locked' ? (
                        <button
                          disabled
                          className="flex-1 px-4 py-2 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed"
                        >
                          🔒 未解锁
                        </button>
                      ) : (
                        <button
                          onClick={() => startLevel(level)}
                          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
                        >
                          <Play className="w-4 h-4" />
                          <span>开始游戏</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* 特殊挑战 */}
        {activeTab === 'challenges' && (
          <div className="text-center py-12">
            <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">特殊挑战</h3>
            <p className="text-gray-600">更多挑战模式即将推出...</p>
          </div>
        )}

        {/* 排行榜 */}
        {activeTab === 'leaderboard' && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <TrendingUp className="w-6 h-6 mr-2" />
                本周排行榜
              </h3>
            </div>
            <div className="divide-y">
              {leaderboard.length > 0 ? (
                leaderboard.map((entry, index) => (
                  <div key={entry.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{entry.username}</p>
                        <p className="text-sm text-gray-500">
                          准确率: {entry.additional_data?.accuracy || 0}%
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{entry.score.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">分数</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">暂无排行榜数据</p>
                  <p className="text-sm text-gray-400 mt-1">开始学习来上榜吧！</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 道具商店 */}
        {activeTab === 'shop' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inventory.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      item.item.rarity === 'legendary' ? 'bg-yellow-100' :
                      item.item.rarity === 'epic' ? 'bg-purple-100' :
                      item.item.rarity === 'rare' ? 'bg-blue-100' :
                      'bg-gray-100'
                    }`}>
                      <Gift className={`w-6 h-6 ${
                        item.item.rarity === 'legendary' ? 'text-yellow-600' :
                        item.item.rarity === 'epic' ? 'text-purple-600' :
                        item.item.rarity === 'rare' ? 'text-blue-600' :
                        'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{item.item.item_name}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${getRarityColor(item.item.rarity)}`}>
                        {item.item.rarity}
                      </span>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">×{item.quantity}</span>
                </div>
                <p className="text-gray-600 text-sm mb-4">{item.item.description}</p>
                <p className="text-indigo-600 text-sm font-medium">{item.item.effect_description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 游戏进行中模态框 */}
      {isPlaying && currentLevel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">正在游戏: {currentLevel.level_name}</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>分数:</span>
                <span className="font-bold">{gameStats.score}</span>
              </div>
              <div className="flex justify-between">
                <span>时间:</span>
                <span className="font-bold text-red-600">
                  {Math.floor(gameStats.timeLeft / 60)}:{(gameStats.timeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>已学单词:</span>
                <span className="font-bold">{gameStats.wordsLearned}</span>
              </div>
            </div>
            <div className="flex space-x-4 mt-6">
              <button
                onClick={endLevel}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                结束游戏
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}