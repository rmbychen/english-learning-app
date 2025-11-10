import { useEffect, useState } from 'react'
import { supabase, UserProfile, Vocabulary } from './lib/supabase'
import { Music, Zap, Trophy, BookOpen, Target, Video, Gamepad2, Zap as Quick, Headphones } from 'lucide-react'
import './App.css'

// 组件
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import VocabularyLearning from './components/VocabularyLearning'
import RhythmChallenge from './components/RhythmChallenge'
import VideoLearning from './components/VideoLearning'
import GameMode from './components/GameMode'
import QuickLearning from './components/QuickLearning'
import MultimediaPractice from './components/MultimediaPractice'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentView, setCurrentView] = useState<'dashboard' | 'learning' | 'rhythm' | 'video' | 'game' | 'quick' | 'multimedia'>('dashboard')

  useEffect(() => {
    // 处理邮件确认回调（URL中的hash参数）
    const handleAuthCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const type = hashParams.get('type')
      const error = hashParams.get('error')
      const errorDescription = hashParams.get('error_description')

      if (error) {
        console.error('认证错误:', error, errorDescription)
        // 清除URL中的hash参数
        window.history.replaceState(null, '', window.location.pathname)
        alert(`认证失败: ${errorDescription || error}`)
        return
      }

      if (accessToken && type === 'signup') {
        // 如果有access_token且type是signup，说明是邮件确认回调
        // Supabase会自动处理，我们只需要等待会话建立
        // 清除URL中的hash参数
        window.history.replaceState(null, '', window.location.pathname)
        console.log('邮件确认成功，正在建立会话...')
      }
    }

    handleAuthCallback()

    // 检查用户会话
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // 监听认证状态变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('认证状态变化:', event, session?.user?.email)
      
      // 处理邮件确认事件
      if (event === 'SIGNED_IN' && session) {
        // 确保用户资料存在
        if (session.user) {
          const { data: existingProfile } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('id', session.user.id)
            .single()

          if (!existingProfile) {
            // 如果用户资料不存在，创建它
            await supabase
              .from('user_profiles')
              .insert({
                id: session.user.id,
                username: session.user.email?.split('@')[0] || '用户',
                level: 1,
                experience_points: 0,
                streak_days: 0,
                total_words_learned: 0,
              })
          }
        }
      }

      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!session) {
    return <Auth />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 顶部导航栏 */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <Music className="w-8 h-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">节奏英语学习</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'dashboard'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Target className="w-5 h-5 inline mr-2" />
                仪表盘
              </button>
              <button
                onClick={() => setCurrentView('learning')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'learning'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <BookOpen className="w-5 h-5 inline mr-2" />
                学习
              </button>
              <button
                onClick={() => setCurrentView('rhythm')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'rhythm'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Zap className="w-5 h-5 inline mr-2" />
                节奏挑战
              </button>
              <button
                onClick={() => setCurrentView('video')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'video'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Video className="w-5 h-5 inline mr-2" />
                视频学习
              </button>
              <button
                onClick={() => setCurrentView('game')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'game'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Gamepad2 className="w-5 h-5 inline mr-2" />
                游戏模式
              </button>
              <button
                onClick={() => setCurrentView('quick')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'quick'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Quick className="w-5 h-5 inline mr-2" />
                快速学习
              </button>
              <button
                onClick={() => setCurrentView('multimedia')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'multimedia'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Headphones className="w-5 h-5 inline mr-2" />
                综合练习
              </button>
              <button
                onClick={() => supabase.auth.signOut()}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                退出
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'learning' && <VocabularyLearning />}
        {currentView === 'rhythm' && <RhythmChallenge />}
        {currentView === 'video' && <VideoLearning />}
        {currentView === 'game' && <GameMode />}
        {currentView === 'quick' && <QuickLearning />}
        {currentView === 'multimedia' && <MultimediaPractice />}
      </main>
    </div>
  )
}

export default App
