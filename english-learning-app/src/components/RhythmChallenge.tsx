import { useEffect, useState } from 'react'
import { supabase, RhythmChallenge } from '../lib/supabase'
import { Music, Play, Trophy, Star, Target } from 'lucide-react'

interface GameState {
  isPlaying: boolean
  score: number
  perfectCount: number
  goodCount: number
  missCount: number
  currentBeat: number
  totalBeats: number
}

export default function RhythmChallengeComponent() {
  const [challenges, setChallenges] = useState<RhythmChallenge[]>([])
  const [selectedChallenge, setSelectedChallenge] = useState<RhythmChallenge | null>(null)
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    score: 0,
    perfectCount: 0,
    goodCount: 0,
    missCount: 0,
    currentBeat: 0,
    totalBeats: 40,
  })
  const [loading, setLoading] = useState(true)
  const [words, setWords] = useState<string[]>([])
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [beatInterval, setBeatInterval] = useState<number | null>(null)
  const [showJudgment, setShowJudgment] = useState<string | null>(null)

  useEffect(() => {
    loadChallenges()
  }, [])

  useEffect(() => {
    if (selectedChallenge) {
      loadWordsForChallenge()
    }
  }, [selectedChallenge])

  const loadChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from('rhythm_challenges')
        .select('*')
        .eq('is_active', true)
        .order('level_number', { ascending: true })

      if (error) throw error
      setChallenges(data || [])
    } catch (error) {
      console.error('加载关卡失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadWordsForChallenge = async () => {
    try {
      const { data, error } = await supabase
        .from('vocabulary')
        .select('word')
        .limit(50)
        .order('created_at', { ascending: false })

      if (error) throw error
      setWords((data || []).map(v => v.word))
    } catch (error) {
      console.error('加载单词失败:', error)
    }
  }

  const startGame = () => {
    if (!selectedChallenge) return

    setGameState({
      isPlaying: true,
      score: 0,
      perfectCount: 0,
      goodCount: 0,
      missCount: 0,
      currentBeat: 0,
      totalBeats: 40,
    })
    setCurrentWordIndex(0)

    // 计算节拍间隔（毫秒）
    const interval = 60000 / selectedChallenge.bpm

    // 启动节拍定时器
    const timer = window.setInterval(() => {
      setGameState(prev => {
        if (prev.currentBeat >= prev.totalBeats - 1) {
          stopGame()
          return prev
        }
        return { ...prev, currentBeat: prev.currentBeat + 1 }
      })
      setCurrentWordIndex(prev => (prev + 1) % words.length)
    }, interval)

    setBeatInterval(timer)
  }

  const stopGame = async () => {
    if (beatInterval) {
      clearInterval(beatInterval)
      setBeatInterval(null)
    }

    setGameState(prev => ({ ...prev, isPlaying: false }))

    // 保存游戏记录
    if (selectedChallenge) {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const accuracy = gameState.totalBeats > 0
          ? ((gameState.perfectCount + gameState.goodCount) / gameState.totalBeats) * 100
          : 0

        await supabase.from('user_rhythm_scores').insert({
          user_id: user.id,
          challenge_id: selectedChallenge.id,
          score: gameState.score,
          accuracy,
          perfect_count: gameState.perfectCount,
          good_count: gameState.goodCount,
          miss_count: gameState.missCount,
        })

        // 增加经验值
        const xpEarned = Math.floor(gameState.score / 10)
        await supabase.rpc('increment', {
          table_name: 'user_profiles',
          row_id: user.id,
          column_name: 'experience_points',
          increment_by: xpEarned,
        })
      } catch (error) {
        console.error('保存记录失败:', error)
      }
    }
  }

  const handleBeatPress = (timing: 'perfect' | 'good' | 'miss') => {
    let points = 0
    let judgment = ''

    switch (timing) {
      case 'perfect':
        points = 100
        judgment = 'PERFECT!'
        setGameState(prev => ({
          ...prev,
          score: prev.score + points,
          perfectCount: prev.perfectCount + 1,
        }))
        break
      case 'good':
        points = 50
        judgment = 'GOOD'
        setGameState(prev => ({
          ...prev,
          score: prev.score + points,
          goodCount: prev.goodCount + 1,
        }))
        break
      case 'miss':
        points = 0
        judgment = 'MISS'
        setGameState(prev => ({
          ...prev,
          missCount: prev.missCount + 1,
        }))
        break
    }

    setShowJudgment(judgment)
    setTimeout(() => setShowJudgment(null), 500)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!selectedChallenge) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Music className="w-8 h-8 text-indigo-600" />
            <h2 className="text-3xl font-bold text-gray-900">节奏挑战</h2>
          </div>
          <p className="text-gray-600 mb-8">
            跟随节拍,快速识别单词,挑战你的反应速度和记忆力!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className="border-2 border-gray-200 hover:border-indigo-500 rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg"
                onClick={() => setSelectedChallenge(challenge)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {challenge.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      第 {challenge.level_number} 关
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: challenge.difficulty }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>

                <p className="text-gray-600 mb-4 text-sm">
                  {challenge.description}
                </p>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1 text-indigo-600">
                    <Music className="w-4 h-4" />
                    <span>{challenge.bpm} BPM</span>
                  </div>
                  <div className="flex items-center space-x-1 text-green-600 font-medium">
                    <Trophy className="w-4 h-4" />
                    <span>{challenge.reward_xp} XP</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!gameState.isPlaying && gameState.currentBeat === 0) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedChallenge(null)}
          className="text-indigo-600 hover:text-indigo-700 font-medium"
        >
          ← 返回关卡选择
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {selectedChallenge.title}
          </h2>
          <p className="text-gray-600 mb-8">{selectedChallenge.description}</p>

          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
            <div className="bg-indigo-50 rounded-lg p-4">
              <Music className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">节拍速度</p>
              <p className="text-2xl font-bold text-gray-900">{selectedChallenge.bpm}</p>
              <p className="text-xs text-gray-500">BPM</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <Trophy className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">经验奖励</p>
              <p className="text-2xl font-bold text-gray-900">{selectedChallenge.reward_xp}</p>
              <p className="text-xs text-gray-500">XP</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <h3 className="font-bold text-gray-900 mb-2">游戏规则</h3>
            <ul className="text-sm text-gray-700 text-left space-y-1">
              <li>• 跟随节拍,在单词出现时按下空格键</li>
              <li>• 在节拍中心按下获得 PERFECT (100分)</li>
              <li>• 稍有偏差获得 GOOD (50分)</li>
              <li>• 完全错过为 MISS (0分)</li>
              <li>• 完成40个节拍后结束游戏</li>
            </ul>
          </div>

          <button
            onClick={startGame}
            className="px-8 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-lg"
          >
            <Play className="w-6 h-6 inline mr-2" />
            开始挑战
          </button>
        </div>
      </div>
    )
  }

  if (gameState.isPlaying) {
    return (
      <div className="space-y-6">
        {/* 游戏状态栏 */}
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600">分数</p>
              <p className="text-2xl font-bold text-indigo-600">{gameState.score}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">进度</p>
              <p className="text-2xl font-bold text-gray-900">
                {gameState.currentBeat}/{gameState.totalBeats}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">完美</p>
              <p className="text-2xl font-bold text-green-600">{gameState.perfectCount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">失误</p>
              <p className="text-2xl font-bold text-red-600">{gameState.missCount}</p>
            </div>
          </div>
        </div>

        {/* 游戏区域 */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-2xl p-12 text-center relative overflow-hidden">
          {/* 判定文字 */}
          {showJudgment && (
            <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl font-bold text-white animate-bounce z-10">
              {showJudgment}
            </div>
          )}

          {/* 当前单词 */}
          <div className="mb-8">
            <h3 className="text-8xl font-bold text-white mb-4 animate-pulse">
              {words[currentWordIndex] || 'Ready'}
            </h3>
            <p className="text-xl text-white/80">跟随节拍按空格</p>
          </div>

          {/* 节拍可视化 */}
          <div className="flex justify-center space-x-2 mb-8">
            {Array.from({ length: 8 }).map((_, i) => {
              const beatPosition = gameState.currentBeat % 8
              return (
                <div
                  key={i}
                  className={`w-4 h-20 rounded-full transition-all duration-100 ${
                    i === beatPosition
                      ? 'bg-yellow-400 scale-125'
                      : 'bg-white/30'
                  }`}
                />
              )
            })}
          </div>

          {/* 按钮区域 */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => handleBeatPress('perfect')}
              className="px-12 py-6 bg-white text-indigo-600 rounded-xl font-bold text-xl hover:bg-gray-100 transition-colors shadow-lg"
            >
              按这里 (空格)
            </button>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={stopGame}
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            结束游戏
          </button>
        </div>
      </div>
    )
  }

  // 游戏结束画面
  const accuracy = gameState.totalBeats > 0
    ? ((gameState.perfectCount + gameState.goodCount) / gameState.totalBeats) * 100
    : 0

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 mb-2">挑战完成!</h2>
        <p className="text-gray-600 mb-8">恭喜你完成了这次节奏挑战</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-indigo-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">总分</p>
            <p className="text-3xl font-bold text-indigo-600">{gameState.score}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">准确率</p>
            <p className="text-3xl font-bold text-green-600">{accuracy.toFixed(1)}%</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">完美</p>
            <p className="text-3xl font-bold text-yellow-600">{gameState.perfectCount}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">良好</p>
            <p className="text-3xl font-bold text-purple-600">{gameState.goodCount}</p>
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={() => {
              setGameState({
                isPlaying: false,
                score: 0,
                perfectCount: 0,
                goodCount: 0,
                missCount: 0,
                currentBeat: 0,
                totalBeats: 40,
              })
            }}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            再玩一次
          </button>
          <button
            onClick={() => setSelectedChallenge(null)}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            返回关卡选择
          </button>
        </div>
      </div>
    </div>
  )
}
