import { useEffect, useState } from 'react'
import { supabase, Vocabulary, UserVocabulary } from '../lib/supabase'
import { Volume2, Check, X, BookOpen, ArrowRight, RotateCcw, Play, Pause, RotateCcw as Repeat, Brain } from 'lucide-react'
import MemoryAssistant from './MemoryAssistant'

// FSRS算法简化实现
const calculateNextReview = (stability: number, difficulty: number, rating: number) => {
  let newStability = stability
  let newDifficulty = difficulty

  // 根据评分调整参数
  switch (rating) {
    case 1: // Again - 完全忘记
      newStability = Math.max(1, stability * 0.5)
      newDifficulty = Math.min(10, difficulty + 1)
      break
    case 2: // Hard - 困难
      newStability = stability * 1.2
      newDifficulty = Math.min(10, difficulty + 0.5)
      break
    case 3: // Good - 正常
      newStability = stability * 2.5
      newDifficulty = Math.max(1, difficulty - 0.1)
      break
    case 4: // Easy - 简单
      newStability = stability * 4
      newDifficulty = Math.max(1, difficulty - 0.3)
      break
  }

  // 计算下次复习时间（单位：天）
  const interval = newStability
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + Math.round(interval))

  return { newStability, newDifficulty, dueDate }
}

export default function VocabularyLearning() {
  const [currentWord, setCurrentWord] = useState<Vocabulary | null>(null)
  const [userVocab, setUserVocab] = useState<UserVocabulary | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [loading, setLoading] = useState(true)
  const [todayStats, setTodayStats] = useState({ learned: 0, reviewed: 0 })
  const [isPlaying, setIsPlaying] = useState(false)
  const [voiceType, setVoiceType] = useState<'native' | 'tts'>('native')
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [showMemoryAssistant, setShowMemoryAssistant] = useState(false)

  useEffect(() => {
    loadNextWord()
    loadTodayStats()
  }, [])

  const loadTodayStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const { data, error } = await supabase
        .from('study_sessions')
        .select('words_reviewed')
        .eq('user_id', user.id)
        .gte('session_date', today.toISOString())

      if (error) throw error

      const reviewed = data?.reduce((sum, session) => sum + session.words_reviewed, 0) || 0
      setTodayStats({ learned: 0, reviewed })
    } catch (error) {
      console.error('加载统计失败:', error)
    }
  }

  const loadNextWord = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 先查找需要复习的单词
      const { data: reviewWords, error: reviewError } = await supabase
        .from('user_vocabulary')
        .select('*, vocabulary(*)')
        .eq('user_id', user.id)
        .lte('due_date', new Date().toISOString())
        .limit(1)

      if (reviewError) throw reviewError

      if (reviewWords && reviewWords.length > 0) {
        // 有需要复习的单词
        const vocabData = reviewWords[0].vocabulary as unknown as Vocabulary[]
        setCurrentWord(vocabData[0])
        setUserVocab(reviewWords[0])
      } else {
        // 没有需要复习的,学习新单词
        const { data: newWord, error: newError } = await supabase
          .from('vocabulary')
          .select('*')
          .limit(1)
          .order('created_at', { ascending: true })

        if (newError) throw newError

        if (newWord && newWord.length > 0) {
          setCurrentWord(newWord[0])
          setUserVocab(null)
        }
      }

      setShowAnswer(false)
    } catch (error) {
      console.error('加载单词失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRating = async (rating: number) => {
    if (!currentWord) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const isNewWord = !userVocab

      if (isNewWord) {
        // 新单词,创建学习记录
        const { newStability, newDifficulty, dueDate } = calculateNextReview(1, 5, rating)

        await supabase.from('user_vocabulary').insert({
          user_id: user.id,
          vocabulary_id: currentWord.id,
          stability: newStability,
          difficulty: newDifficulty,
          due_date: dueDate.toISOString(),
          last_review: new Date().toISOString(),
          review_count: 1,
          state: rating >= 3 ? 1 : 0,
        })

        // 更新用户统计
        await supabase.rpc('increment', {
          table_name: 'user_profiles',
          row_id: user.id,
          column_name: 'total_words_learned',
          increment_by: 1,
        })

        // 增加经验值
        await supabase.rpc('increment', {
          table_name: 'user_profiles',
          row_id: user.id,
          column_name: 'experience_points',
          increment_by: 10,
        })
      } else {
        // 复习单词,更新记录
        const { newStability, newDifficulty, dueDate } = calculateNextReview(
          userVocab.stability,
          userVocab.difficulty,
          rating
        )

        await supabase
          .from('user_vocabulary')
          .update({
            stability: newStability,
            difficulty: newDifficulty,
            due_date: dueDate.toISOString(),
            last_review: new Date().toISOString(),
            review_count: userVocab.review_count + 1,
            state: rating >= 3 ? 1 : 0,
          })
          .eq('id', userVocab.id)

        // 增加经验值
        await supabase.rpc('increment', {
          table_name: 'user_profiles',
          row_id: user.id,
          column_name: 'experience_points',
          increment_by: 5,
        })
      }

      // 加载下一个单词
      loadNextWord()
      loadTodayStats()
    } catch (error) {
      console.error('保存学习记录失败:', error)
    }
  }

  const playAudio = async (audioUrl?: string, speed: number = playbackSpeed) => {
    if (!currentWord) return

    try {
      setIsPlaying(true)
      
      // 优先使用原生音频文件
      if (voiceType === 'native' && (audioUrl || currentWord.audio_url)) {
        const audio = new Audio(audioUrl || currentWord.audio_url)
        audio.playbackRate = speed
        await audio.play()
        audio.onended = () => setIsPlaying(false)
      } else {
        // 使用Web Speech API
        if ('speechSynthesis' in window) {
          // 停止当前播放
          speechSynthesis.cancel()
          
          const utterance = new SpeechSynthesisUtterance(currentWord.word)
          utterance.lang = 'en-US'
          utterance.rate = speed
          utterance.pitch = 1
          
          utterance.onend = () => setIsPlaying(false)
          utterance.onerror = () => setIsPlaying(false)
          
          speechSynthesis.speak(utterance)
        } else {
          console.log('浏览器不支持语音合成')
          setIsPlaying(false)
        }
      }
    } catch (error) {
      console.error('播放音频失败:', error)
      setIsPlaying(false)
    }
  }

  const stopAudio = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel()
    }
    setIsPlaying(false)
  }

  const repeatAudio = () => {
    stopAudio()
    playAudio()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!currentWord) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">太棒了!</h3>
        <p className="text-gray-600 mb-4">你已经完成了今天的学习任务</p>
        <button
          onClick={loadNextWord}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          继续学习
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 今日统计 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">今日已学</p>
          <p className="text-3xl font-bold text-blue-600">{todayStats.learned}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">今日已复习</p>
          <p className="text-3xl font-bold text-green-600">{todayStats.reviewed}</p>
        </div>
      </div>

      {/* 学习卡片 */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="inline-block px-4 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
            {userVocab ? '复习' : '新单词'} · {currentWord.category || '通用'}
          </div>

          <h2 className="text-5xl font-bold text-gray-900 mb-4">{currentWord.word}</h2>

          {currentWord.pronunciation && (
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-center space-x-2">
                <p className="text-xl text-gray-600">{currentWord.pronunciation}</p>
                <button
                  onClick={() => isPlaying ? stopAudio() : playAudio()}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  disabled={!currentWord.audio_url && !('speechSynthesis' in window)}
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 text-red-600" />
                  ) : (
                    <Volume2 className="w-6 h-6 text-indigo-600" />
                  )}
                </button>
                <button
                  onClick={repeatAudio}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  disabled={!currentWord.audio_url && !('speechSynthesis' in window)}
                >
                  <Repeat className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              
              {/* 语音控制面板 */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">语音类型</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setVoiceType('native')}
                      className={`px-3 py-1 rounded text-sm ${
                        voiceType === 'native' 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-white text-gray-600 border'
                      }`}
                      disabled={!currentWord.audio_url}
                    >
                      原声
                    </button>
                    <button
                      onClick={() => setVoiceType('tts')}
                      className={`px-3 py-1 rounded text-sm ${
                        voiceType === 'tts' 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-white text-gray-600 border'
                      }`}
                    >
                      合成
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">播放速度</span>
                  <div className="flex space-x-1">
                    {[0.5, 0.75, 1, 1.25, 1.5].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => setPlaybackSpeed(speed)}
                        className={`px-2 py-1 rounded text-xs ${
                          playbackSpeed === speed 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-white text-gray-600 border'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {!showAnswer && (
            <button
              onClick={() => setShowAnswer(true)}
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              显示释义
            </button>
          )}
        </div>

        {showAnswer && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-t pt-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">释义</h3>
              <p className="text-2xl text-gray-900 mb-2">{currentWord.definition_cn}</p>
              {currentWord.definition_en && (
                <p className="text-gray-600">{currentWord.definition_en}</p>
              )}
            </div>

            {currentWord.example_sentence && (
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">例句</h3>
                <p className="text-lg text-gray-900 mb-1">{currentWord.example_sentence}</p>
                {currentWord.translation && (
                  <p className="text-gray-600">{currentWord.translation}</p>
                )}
              </div>
            )}

            <div className="border-t pt-6">
              <h3 className="text-sm font-medium text-gray-600 mb-4">你掌握得怎么样?</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => handleRating(1)}
                  className="py-4 px-4 border-2 border-red-200 hover:border-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-6 h-6 text-red-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">再来一次</p>
                  <p className="text-xs text-gray-500">完全忘记</p>
                </button>
                <button
                  onClick={() => handleRating(2)}
                  className="py-4 px-4 border-2 border-orange-200 hover:border-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">困难</p>
                  <p className="text-xs text-gray-500">回忆困难</p>
                </button>
                <button
                  onClick={() => handleRating(3)}
                  className="py-4 px-4 border-2 border-green-200 hover:border-green-500 hover:bg-green-50 rounded-lg transition-colors"
                >
                  <Check className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">良好</p>
                  <p className="text-xs text-gray-500">正常回忆</p>
                </button>
                <button
                  onClick={() => handleRating(4)}
                  className="py-4 px-4 border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <ArrowRight className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">简单</p>
                  <p className="text-xs text-gray-500">轻松回忆</p>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 语音练习入口 */}
      {showAnswer && currentWord && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">🎤 语音练习</h3>
              <p className="text-gray-600">练习发音，提高口语能力</p>
            </div>
            <button
              onClick={() => {
                // 这里可以打开语音练习模态框或导航到练习页面
                console.log('打开语音练习:', currentWord.word)
              }}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              开始练习
            </button>
          </div>
        </div>
      )}

      {/* 记忆助手入口 */}
      {showAnswer && currentWord && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <Brain className="w-6 h-6 mr-2 text-blue-600" />
                🧠 记忆助手
              </h3>
              <p className="text-gray-600">查看记忆技巧、词汇关联和助记方法</p>
            </div>
            <button
              onClick={() => setShowMemoryAssistant(!showMemoryAssistant)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {showMemoryAssistant ? '收起' : '查看技巧'}
            </button>
          </div>
        </div>
      )}

      {/* 记忆助手组件 */}
      {showMemoryAssistant && currentWord && (
        <MemoryAssistant />
      )}
    </div>
  )
}

// 语音练习组件
function VoicePractice({ word, onComplete }: { word: string; onComplete: () => void }) {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [feedback, setFeedback] = useState('')

  const startRecording = async () => {
    try {
      setIsRecording(true)
      setTranscript('')
      setFeedback('')
      
      // 这里应该集成语音识别API
      // 暂时模拟语音识别结果
      setTimeout(() => {
        setIsRecording(false)
        setTranscript(word) // 模拟识别结果
        setFeedback('发音很棒！') // 模拟反馈
        setTimeout(onComplete, 2000)
      }, 3000)
    } catch (error) {
      console.error('语音识别失败:', error)
      setIsRecording(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 text-center">
      <h3 className="text-xl font-bold mb-4">语音练习</h3>
      <p className="text-gray-600 mb-4">请跟读单词：<span className="font-bold text-indigo-600">{word}</span></p>
      
      <button
        onClick={startRecording}
        disabled={isRecording}
        className={`px-6 py-3 rounded-lg font-medium transition-colors ${
          isRecording 
            ? 'bg-red-600 text-white' 
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
        }`}
      >
        {isRecording ? '正在录音...' : '开始练习'}
      </button>
      
      {transcript && (
        <div className="mt-4 p-4 bg-gray-50 rounded">
          <p className="text-sm text-gray-600 mb-2">识别结果：</p>
          <p className="font-medium">{transcript}</p>
          {feedback && (
            <p className="text-green-600 mt-2">{feedback}</p>
          )}
        </div>
      )}
    </div>
  )
}
