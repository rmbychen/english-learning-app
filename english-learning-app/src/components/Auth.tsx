import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Music, Mail, Lock, User } from 'lucide-react'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [showResendEmail, setShowResendEmail] = useState(false)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {

      if (isSignUp) {
        // 注册
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        })

        if (signUpError) throw signUpError

        // 创建用户资料
        if (data.user) {
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
              id: data.user.id,
              username: username || email.split('@')[0],
              role: 'user',
              level: 1,
              experience_points: 0,
              streak_days: 0,
              total_words_learned: 0,
            })
            .maybeSingle()

          if (profileError) throw profileError
        }

        if (data.user) {
          // 检查是否需要邮件确认
          if (data.session) {
            // 如果直接有session，说明不需要邮件确认（开发环境可能禁用）
            setSuccessMessage('注册成功！欢迎使用节奏英语学习！')
            setShowResendEmail(false)
          } else {
            setSuccessMessage('注册成功！请查收邮件并点击确认链接来激活您的账户。')
            setShowResendEmail(true)
          }
        } else {
          setSuccessMessage('注册成功！请查收邮件并点击确认链接来激活您的账户。')
          setShowResendEmail(true)
        }
      } else {
        // 登录
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          // 提供更详细的错误信息
          if (signInError.message.includes('Email not confirmed')) {
            throw new Error('邮箱未确认，请检查您的邮箱并点击确认链接')
          } else if (signInError.message.includes('Invalid login credentials')) {
            throw new Error('邮箱或密码错误，请检查后重试')
          } else {
            throw signInError
          }
        }

        // 登录成功后，确保用户资料存在
        if (signInData.user) {
          const { data: existingProfile } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('id', signInData.user.id)
            .single()

          if (!existingProfile) {
            // 如果用户资料不存在，创建它
            await supabase
              .from('user_profiles')
              .insert({
                id: signInData.user.id,
                username: signInData.user.email?.split('@')[0] || '用户',
                level: 1,
                experience_points: 0,
                streak_days: 0,
                total_words_learned: 0,
              })
          }
        }
      }
    } catch (error: any) {
      setError(error.message || '操作失败')
    } finally {
      setLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
    if (!email) {
      setError('请先输入邮箱地址')
      return
    }

    setLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })

      if (resendError) throw resendError

      setSuccessMessage('确认邮件已重新发送，请查收您的邮箱。')
    } catch (error: any) {
      setError(error.message || '重新发送失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Logo和标题 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
            <Music className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">节奏英语学习</h1>
          <p className="text-gray-600">通过音乐和游戏,让学习更有趣</p>
        </div>

        {/* 登录/注册表单 */}
        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                用户名
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  placeholder="输入用户名"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              邮箱
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                placeholder="输入邮箱地址"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              密码
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                placeholder="输入密码"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {successMessage}
              {showResendEmail && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={handleResendConfirmation}
                    disabled={loading}
                    className="text-sm text-green-700 hover:text-green-800 underline"
                  >
                    没有收到邮件？点击重新发送
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '处理中...' : isSignUp ? '注册' : '登录'}
          </button>
        </form>

        {/* 切换登录/注册 */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError('')
              setSuccessMessage('')
              setShowResendEmail(false)
            }}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            {isSignUp ? '已有账户?立即登录' : '没有账户?立即注册'}
          </button>
        </div>
      </div>
    </div>
  )
}
