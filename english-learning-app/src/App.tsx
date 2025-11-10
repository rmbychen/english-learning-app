import { useEffect, useState } from 'react'
import { supabase, UserProfile, Vocabulary } from './lib/supabase'
import { Music, Zap, Trophy, BookOpen, Target, Video, Gamepad2, Zap as Quick, Headphones, Menu, X } from 'lucide-react'
import './App.css'
import { useIsMobile } from './hooks/use-mobile'

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isMobile = useIsMobile()

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

  const menuItems = [
    { id: 'dashboard', label: '仪表盘', icon: Target, view: 'dashboard' as const },
    { id: 'learning', label: '学习', icon: BookOpen, view: 'learning' as const },
    { id: 'rhythm', label: '节奏挑战', icon: Zap, view: 'rhythm' as const },
    { id: 'video', label: '视频学习', icon: Video, view: 'video' as const },
    { id: 'game', label: '游戏模式', icon: Gamepad2, view: 'game' as const },
    { id: 'quick', label: '快速学习', icon: Quick, view: 'quick' as const },
    { id: 'multimedia', label: '综合练习', icon: Headphones, view: 'multimedia' as const },
  ]

  const handleViewChange = (view: typeof currentView) => {
    setCurrentView(view)
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 顶部导航栏 */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <Music className="w-8 h-8 text-indigo-600" />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">节奏英语学习</h1>
            </div>
            
            {/* 桌面端导航 */}
            {!isMobile && (
              <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleViewChange(item.view)}
                      className={`px-2 lg:px-4 py-2 rounded-lg transition-colors text-sm lg:text-base ${
                        currentView === item.view
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4 lg:w-5 lg:h-5 inline mr-1 lg:mr-2" />
                      <span className="hidden lg:inline">{item.label}</span>
                    </button>
                  )
                })}
                <button
                  onClick={() => supabase.auth.signOut()}
                  className="px-2 lg:px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm lg:text-base"
                >
                  退出
                </button>
              </div>
            )}

            {/* 移动端菜单按钮 */}
            {isMobile && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="菜单"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
          </div>

          {/* 移动端下拉菜单 */}
          {isMobile && mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleViewChange(item.view)}
                      className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                        currentView === item.view
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      <span>{item.label}</span>
                    </button>
                  )
                })}
                <button
                  onClick={() => {
                    supabase.auth.signOut()
                    setMobileMenuOpen(false)
                  }}
                  className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span>退出登录</span>
                </button>
              </div>
            </div>
          )}
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
