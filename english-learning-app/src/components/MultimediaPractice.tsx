import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { 
  MessageSquare, 
  Headphones, 
  Mic, 
  FileText, 
  Play, 
  Pause, 
  Volume2,
  CheckCircle,
  XCircle,
  RotateCcw,
  Award,
  Target,
  Clock,
  TrendingUp
} from 'lucide-react'

interface Phrase {
  id: string
  phrase: string
  pronunciation?: string
  meaning_cn: string
  meaning_en?: string
  example_sentence: string
  translation?: string
  category: string
  difficulty_level: number
  audio_url?: string
}

interface SentenceExercise {
  id: string
  exercise_type: string
  sentence_en: string
  sentence_cn?: string
  correct_answer: string
  options?: string[]
  explanation?: string
  difficulty_level: number
  category: string
}

interface ListeningExercise {
  id: string
  title: string
  audio_url: string
  transcript?: string
  questions: any[]
  difficulty_level: number
  duration?: number
  category: string
}

export default function MultimediaPractice() {
  const [activeModule, setActiveModule] = useState<'phrases' | 'sentences' | 'listening' | 'speaking'>('phrases')
  const [phrases, setPhrases] = useState<Phrase[]>([])
  const [sentences, setSentences] = useState<SentenceExercise[]>([])
  const [listeningExercises, setListeningExercises] = useState<ListeningExercise[]>([])
  const [currentPhrase, setCurrentPhrase] = useState<Phrase | null>(null)
  const [currentSentence, setCurrentSentence] = useState<SentenceExercise | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [showAnswer, setShowAnswer] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [practiceStats, setPracticeStats] = useState({
    completed: 0,
    correct: 0,
    totalScore: 0,
    timeSpent: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPracticeData()
  }, [])

  const loadPracticeData = async () => {
    try {
      // 加载短语数据
      const { data: phrasesData } = await supabase
        .from('phrases')
        .select('*')
        .order('difficulty_level')

      setPhrases(phrasesData || [])
      if (phrasesData && phrasesData.length > 0) {
        setCurrentPhrase(phrasesData[0])
      }

      // 加载句子练习数据
      const { data: sentencesData } = await supabase
        .from('sentence_exercises')
        .select('*')
        .order('difficulty_level')

      setSentences(sentencesData || [])
      if (sentencesData && sentencesData.length > 0) {
        setCurrentSentence(sentencesData[0])
      }

      // 加载听力练习数据
      const { data: listeningData } = await supabase
        .from('listening_exercises')
        .select('*')
        .order('difficulty_level')

      setListeningExercises(listeningData || [])
    } catch (error) {
      console.error('加载练习数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const playAudio = async (audioUrl: string) => {
    try {
      setIsPlaying(true)
      const audio = new Audio(audioUrl)
      await audio.play()
      audio.onended = () => setIsPlaying(false)
    } catch (error) {
      console.error('播放音频失败:', error)
      setIsPlaying(false)
    }
  }

  const handlePhraseAnswer = (isCorrect: boolean) => {
    setPracticeStats(prev => ({
      ...prev,
      completed: prev.completed + 1,
      correct: prev.correct + (isCorrect ? 1 : 0),
      totalScore: prev.totalScore + (isCorrect ? 10 : 0)
    }))
    
    // 移动到下一个短语
    nextPhrase()
  }

  const nextPhrase = () => {
    const currentIndex = phrases.findIndex(p => p.id === currentPhrase?.id)
    if (currentIndex < phrases.length - 1) {
      setCurrentPhrase(phrases[currentIndex + 1])
      setShowAnswer(false)
      setUserAnswer('')
    }
  }

  const handleSentenceAnswer = () => {
    if (!currentSentence) return
    
    const isCorrect = userAnswer.toLowerCase().trim() === currentSentence.correct_answer.toLowerCase().trim()
    
    setPracticeStats(prev => ({
      ...prev,
      completed: prev.completed + 1,
      correct: prev.correct + (isCorrect ? 1 : 0),
      totalScore: prev.totalScore + (isCorrect ? 15 : 0)
    }))
    
    setShowAnswer(true)
  }

  const nextSentence = () => {
    const currentIndex = sentences.findIndex(s => s.id === currentSentence?.id)
    if (currentIndex < sentences.length - 1) {
      setCurrentSentence(sentences[currentIndex + 1])
      setShowAnswer(false)
      setUserAnswer('')
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 练习统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">已完成</p>
              <p className="text-3xl font-bold text-blue-600">{practiceStats.completed}</p>
            </div>
            <Target className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">正确率</p>
              <p className="text-3xl font-bold text-green-600">
                {practiceStats.completed > 0 ? Math.round((practiceStats.correct / practiceStats.completed) * 100) : 0}%
              </p>
            </div>
            <Award className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">总分数</p>
              <p className="text-3xl font-bold text-purple-600">{practiceStats.totalScore}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">学习时长</p>
              <p className="text-3xl font-bold text-orange-600">
                {Math.floor(practiceStats.timeSpent / 60)}:{(practiceStats.timeSpent % 60).toString().padStart(2, '0')}
              </p>
            </div>
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* 模块导航 */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {[
            { key: 'phrases', label: '词组学习', icon: MessageSquare },
            { key: 'sentences', label: '句子练习', icon: FileText },
            { key: 'listening', label: '听力训练', icon: Headphones },
            { key: 'speaking', label: '口语练习', icon: Mic }
          ].map((module) => (
            <button
              key={module.key}
              onClick={() => setActiveModule(module.key as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeModule === module.key
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <module.icon className="w-5 h-5" />
              <span>{module.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* 内容区域 */}
      <div className="min-h-96">
        {/* 词组学习 */}
        {activeModule === 'phrases' && currentPhrase && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="inline-block px-4 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
                  {currentPhrase.category} · 难度 {currentPhrase.difficulty_level}
                </div>
                
                <h2 className="text-4xl font-bold text-gray-900 mb-4">{currentPhrase.phrase}</h2>
                
                {currentPhrase.pronunciation && (
                  <div className="flex items-center justify-center space-x-2 mb-6">
                    <p className="text-xl text-gray-600">{currentPhrase.pronunciation}</p>
                    {currentPhrase.audio_url && (
                      <button
                        onClick={() => playAudio(currentPhrase.audio_url!)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <Volume2 className="w-6 h-6 text-indigo-600" />
                      </button>
                    )}
                  </div>
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
                      <p className="text-2xl text-gray-900 mb-2">{currentPhrase.meaning_cn}</p>
                      {currentPhrase.meaning_en && (
                        <p className="text-gray-600">{currentPhrase.meaning_en}</p>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">例句</h3>
                      <p className="text-xl text-gray-900 mb-2">{currentPhrase.example_sentence}</p>
                      {currentPhrase.translation && (
                        <p className="text-gray-600">{currentPhrase.translation}</p>
                      )}
                    </div>

                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={() => handlePhraseAnswer(false)}
                        className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <XCircle className="w-5 h-5" />
                        <span>不认识</span>
                      </button>
                      <button
                        onClick={() => handlePhraseAnswer(true)}
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
        )}

        {/* 句子练习 */}
        {activeModule === 'sentences' && currentSentence && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="inline-block px-4 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
                  {currentSentence.category} · 难度 {currentSentence.difficulty_level}
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {currentSentence.exercise_type === 'fill_blank' ? '句子填空' : 
                   currentSentence.exercise_type === 'translation' ? '翻译练习' : '句子重组'}
                </h2>

                {currentSentence.sentence_cn && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <p className="text-lg text-gray-900">{currentSentence.sentence_cn}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="请输入你的答案..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={showAnswer}
                  />
                  
                  {!showAnswer ? (
                    <button
                      onClick={handleSentenceAnswer}
                      disabled={!userAnswer.trim()}
                      className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
                    >
                      提交答案
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className={`p-4 rounded-lg ${
                        userAnswer.toLowerCase().trim() === currentSentence.correct_answer.toLowerCase().trim()
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-red-50 border border-red-200'
                      }`}>
                        <div className="flex items-center space-x-2 mb-2">
                          {userAnswer.toLowerCase().trim() === currentSentence.correct_answer.toLowerCase().trim() ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                          <span className={`font-medium ${
                            userAnswer.toLowerCase().trim() === currentSentence.correct_answer.toLowerCase().trim()
                              ? 'text-green-800'
                              : 'text-red-800'
                          }`}>
                            {userAnswer.toLowerCase().trim() === currentSentence.correct_answer.toLowerCase().trim() ? '正确！' : '错误'}
                          </span>
                        </div>
                        <p className="text-gray-900">
                          正确答案：<span className="font-bold">{currentSentence.correct_answer}</span>
                        </p>
                        {currentSentence.explanation && (
                          <p className="text-sm text-gray-600 mt-2">{currentSentence.explanation}</p>
                        )}
                      </div>
                      
                      <button
                        onClick={nextSentence}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        下一题
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 听力训练 */}
        {activeModule === 'listening' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center py-12">
              <Headphones className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">听力训练</h3>
              <p className="text-gray-600">听力练习功能即将推出...</p>
              <p className="text-sm text-gray-400 mt-2">包括音频理解、听力选择题等练习</p>
            </div>
          </div>
        )}

        {/* 口语练习 */}
        {activeModule === 'speaking' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center py-12">
              <Mic className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">口语练习</h3>
              <p className="text-gray-600">口语练习功能即将推出...</p>
              <p className="text-sm text-gray-400 mt-2">包括语音识别、发音评分、对话练习等</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}