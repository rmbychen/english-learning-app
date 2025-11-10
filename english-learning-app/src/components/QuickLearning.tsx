import { useState, useEffect } from 'react'
import { supabase, Vocabulary } from '../lib/supabase'
import { 
  Clock, 
  Zap, 
  Target, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Play,
  Pause,
  Smartphone,
  Wifi,
  WifiOff,
  Bell,
  Download
} from 'lucide-react'

interface QuickSession {
  id: string
  words: Vocabulary[]
  startTime: Date
  endTime?: Date
  completed: boolean
  score: number
  correctAnswers: number
}

export default function QuickLearning() {
  const [currentSession, setCurrentSession] = useState<QuickSession | null>(null)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [userAnswer, setUserAnswer] = useState('')
  const [sessionStats, setSessionStats] = useState({
    timeElapsed: 0,
    wordsCompleted: 0,
    correctAnswers: 0,
    streak: 0
  })
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [offlineWords, setOfflineWords] = useState<Vocabulary[]>([])
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // 监听网络状态
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // 检查离线数据
    loadOfflineData()
    
    // 检查通知权限
    checkNotificationPermission()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const loadOfflineData = () => {
    try {
      const cached = localStorage.getItem('offline_words')
      if (cached) {
        setOfflineWords(JSON.parse(cached))
      }
    } catch (error) {
      console.error('加载离线数据失败:', error)
    }
  }

  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted')
    }
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      setNotificationsEnabled(permission === 'granted')
    }
  }

  const scheduleReminder = () => {
    if (notificationsEnabled) {
      // 设置学习提醒
      const now = new Date()
      const reminderTime = new Date(now.getTime() + 2 * 60 * 60 * 1000) // 2小时后
      
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        // 这里可以注册Service Worker和Push通知
        console.log('设置学习提醒:', reminderTime)
      }
    }
  }

  const startQuickSession = async (duration: number = 5) => {
    setLoading(true)
    try {
      // 获取适合快速学习的单词
      const wordsToLearn = isOnline ? await fetchQuickWords(duration) : offlineWords.slice(0, duration * 2)
      
      const session: QuickSession = {
        id: Date.now().toString(),
        words: wordsToLearn,
        startTime: new Date(),
        completed: false,
        score: 0,
        correctAnswers: 0
      }
      
      setCurrentSession(session)
      setCurrentWordIndex(0)
      setShowAnswer(false)
      setUserAnswer('')
      setSessionStats({
        timeElapsed: 0,
        wordsCompleted: 0,
        correctAnswers: 0,
        streak: 0
      })
      
      // 开始计时
      const timer = setInterval(() => {
        setSessionStats(prev => ({
          ...prev,
          timeElapsed: Math.floor((Date.now() - session.startTime.getTime()) / 1000)
        }))
      }, 1000)
      
      // 5分钟后自动结束
      setTimeout(() => {
        clearInterval(timer)
        endSession()
      }, duration * 60 * 1000)
      
    } catch (error) {
      console.error('开始快速学习失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchQuickWords = async (count: number) => {
    const { data, error } = await supabase
      .from('vocabulary')
      .select('*')
      .limit(count)
      .order('difficulty_level', { ascending: true })

    if (error) throw error
    return data || []
  }

  const handleAnswer = (isCorrect: boolean) => {
    if (!currentSession) return

    const newStats = {
      ...sessionStats,
      wordsCompleted: sessionStats.wordsCompleted + 1,
      correctAnswers: sessionStats.correctAnswers + (isCorrect ? 1 : 0),
      streak: isCorrect ? sessionStats.streak + 1 : 0
    }
    
    setSessionStats(newStats)
    
    if (isCorrect) {
      setCurrentSession(prev => prev ? {
        ...prev,
        score: prev.score + 10,
        correctAnswers: prev.correctAnswers + 1
      } : null)
    }

    // 移动到下一个单词
    setTimeout(() => {
      nextWord()
    }, 1000)
  }

  const nextWord = () => {
    if (!currentSession) return
    
    if (currentWordIndex < currentSession.words.length - 1) {
      setCurrentWordIndex(prev => prev + 1)
      setShowAnswer(false)
      setUserAnswer('')
    } else {
      endSession()
    }
  }

  const endSession = () => {
    if (!currentSession) return
    
    const endedSession = {
      ...currentSession,
      endTime: new Date(),
      completed: true
    }
    
    setCurrentSession(endedSession)
    
    // 保存学习记录
    saveSessionRecord(endedSession)
    
    // 显示成就通知
    if (sessionStats.correctAnswers >= sessionStats.wordsCompleted * 0.8) {
      showAchievementNotification()
    }
  }

  const saveSessionRecord = async (session: QuickSession) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 保存到学习会话表
      await supabase.from('study_sessions').insert({
        user_id: user.id,
        session_date: new Date().toISOString(),
        words_reviewed: sessionStats.wordsCompleted,
        accuracy_rate: (sessionStats.correctAnswers / sessionStats.wordsCompleted) * 100,
        session_duration: sessionStats.timeElapsed,
        session_type: 'quick'
      })

      // 更新用户统计
      await supabase.rpc('increment', {
        table_name: 'user_profiles',
        row_id: user.id,
        column_name: 'experience_points',
        increment_by: sessionStats.correctAnswers * 5
      })

    } catch (error) {
      console.error('保存学习记录失败:', error)
    }
  }

  const showAchievementNotification = () => {
    if (notificationsEnabled) {
      new Notification('🎉 学习成就！', {
        body: `太棒了！你在快速学习中答对了 ${sessionStats.correctAnswers} 个单词！`,
        icon: '/icon-192x192.png'
      })
    }
  }

  const downloadOfflineData = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('vocabulary')
        .select('*')
        .limit(100) // 限制离线数据量

      if (error) throw error

      localStorage.setItem('offline_words', JSON.stringify(data))
      setOfflineWords(data || [])
      
      if (notificationsEnabled) {
        new Notification('📱 离线数据已下载', {
          body: '已下载100个单词用于离线学习',
          icon: '/icon-192x192.png'
        })
      }
    } catch (error) {
      console.error('下载离线数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getStreakEmoji = (streak: number) => {
    if (streak >= 10) return '🔥'
    if (streak >= 5) return '⚡'
    if (streak >= 3) return '💪'
    return '👍'
  }

  // 如果正在学习中，显示学习界面
  if (currentSession && !currentSession.completed) {
    const currentWord = currentSession.words[currentWordIndex]
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto">
          {/* 顶部状态栏 */}
          <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="font-bold text-lg">{formatTime(sessionStats.timeElapsed)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-green-600" />
                  <span>{sessionStats.wordsCompleted}/{currentSession.words.length}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getStreakEmoji(sessionStats.streak)}</span>
                  <span>{sessionStats.streak}</span>
                </div>
              </div>
              <button
                onClick={endSession}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                结束
              </button>
            </div>
            
            {/* 进度条 */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${(sessionStats.timeElapsed / (5 * 60)) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* 学习卡片 */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="inline-block px-4 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
                单词 {currentWordIndex + 1} / {currentSession.words.length}
              </div>
              
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{currentWord.word}</h2>
              
              {currentWord.pronunciation && (
                <p className="text-xl text-gray-600 mb-6">{currentWord.pronunciation}</p>
              )}

              {!showAnswer ? (
                <button
                  onClick={() => setShowAnswer(true)}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  显示释义
                </button>
              ) : (
                <div className="space-y-6">
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">释义</h3>
                    <p className="text-2xl text-gray-900">{currentWord.definition_cn}</p>
                  </div>

                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => handleAnswer(false)}
                      className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                      <span>不认识</span>
                    </button>
                    <button
                      onClick={() => handleAnswer(true)}
                      className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>认识</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 学习完成界面
  if (currentSession?.completed) {
    const accuracy = (sessionStats.correctAnswers / sessionStats.wordsCompleted) * 100
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">
            {accuracy >= 80 ? '🎉' : accuracy >= 60 ? '👏' : '💪'}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {accuracy >= 80 ? '太棒了！' : accuracy >= 60 ? '不错哦！' : '继续努力！'}
          </h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between">
              <span>学习时间:</span>
              <span className="font-bold">{formatTime(sessionStats.timeElapsed)}</span>
            </div>
            <div className="flex justify-between">
              <span>完成单词:</span>
              <span className="font-bold">{sessionStats.wordsCompleted}</span>
            </div>
            <div className="flex justify-between">
              <span>正确率:</span>
              <span className="font-bold">{accuracy.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span>获得分数:</span>
              <span className="font-bold text-indigo-600">{currentSession.score}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                setCurrentSession(null)
                setCurrentWordIndex(0)
              }}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              继续学习
            </button>
            <button
              onClick={() => startQuickSession(5)}
              className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              再来一轮
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 主界面
  return (
    <div className="space-y-6">
      {/* 快速学习统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">在线状态</p>
              <div className="flex items-center space-x-2">
                {isOnline ? (
                  <>
                    <Wifi className="w-5 h-5 text-green-600" />
                    <span className="text-green-600 font-medium">在线</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-5 h-5 text-red-600" />
                    <span className="text-red-600 font-medium">离线</span>
                  </>
                )}
              </div>
            </div>
            <Smartphone className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">离线单词</p>
              <p className="text-3xl font-bold text-green-600">{offlineWords.length}</p>
            </div>
            <Download className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">通知提醒</p>
              <p className="text-sm font-medium text-purple-600">
                {notificationsEnabled ? '已开启' : '未开启'}
              </p>
            </div>
            <Bell className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* 快速学习选项 */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">⚡ 快速学习</h2>
          <p className="text-gray-600">利用碎片时间，快速提升英语水平</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[3, 5, 10].map((minutes) => (
            <button
              key={minutes}
              onClick={() => startQuickSession(minutes)}
              disabled={loading || (!isOnline && offlineWords.length === 0)}
              className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-center">
                <Clock className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">{minutes} 分钟</h3>
                <p className="text-gray-600">
                  学习 {minutes * 2} 个单词
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  适合 {minutes <= 3 ? '快速复习' : minutes <= 5 ? '日常学习' : '深度学习'}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* 功能按钮 */}
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={downloadOfflineData}
            disabled={loading || !isOnline}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            <span>下载离线数据</span>
          </button>
          
          <button
            onClick={requestNotificationPermission}
            className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span>开启学习提醒</span>
          </button>
          
          <button
            onClick={scheduleReminder}
            className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Clock className="w-5 h-5" />
            <span>2小时后提醒</span>
          </button>
        </div>

        {/* 学习提示 */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-2">💡 学习小贴士</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• 建议在安静的环境中进行快速学习</li>
            <li>• 可以配合语音播放功能提高记忆效果</li>
            <li>• 每天坚持5分钟，胜过偶尔学习1小时</li>
            <li>• 开启通知提醒，培养学习习惯</li>
          </ul>
        </div>
      </div>
    </div>
  )
}