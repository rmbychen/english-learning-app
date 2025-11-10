import { useState, useEffect } from 'react'
import { supabase, Vocabulary } from '../lib/supabase'
import { Brain, Lightbulb, Link, Eye, BookOpen, Star, ArrowRight } from 'lucide-react'

interface MemoryTechnique {
  id: string
  technique_type: string
  title: string
  description: string
  example_vocabulary_id?: string
}

interface WordAssociation {
  id: string
  primary_vocabulary_id: string
  associated_vocabulary_id: string
  association_type: string
  strength: number
  associated_word?: Vocabulary
}

interface PersonalizedRecommendation {
  id: string
  vocabulary_id: string
  recommendation_type: string
  reason: string
  priority: number
  vocabulary?: Vocabulary
}

export default function MemoryAssistant() {
  const [currentWord, setCurrentWord] = useState<Vocabulary | null>(null)
  const [memoryTechniques, setMemoryTechniques] = useState<MemoryTechnique[]>([])
  const [wordAssociations, setWordAssociations] = useState<WordAssociation[]>([])
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([])
  const [activeTab, setActiveTab] = useState<'techniques' | 'associations' | 'recommendations'>('techniques')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadMemoryData()
  }, [currentWord])

  const loadMemoryData = async () => {
    if (!currentWord) return

    setLoading(true)
    try {
      // 加载记忆技巧
      const { data: techniques } = await supabase
        .from('memory_techniques')
        .select('*')
        .eq('example_vocabulary_id', currentWord.id)

      setMemoryTechniques(techniques || [])

      // 加载词汇关联
      const { data: associations } = await supabase
        .from('word_associations')
        .select(`
          *,
          associated_vocabulary:associated_vocabulary_id(*)
        `)
        .eq('primary_vocabulary_id', currentWord.id)

      setWordAssociations(associations || [])

      // 加载个性化推荐
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: recs } = await supabase
          .from('personalized_recommendations')
          .select(`
            *,
            vocabulary:vocabulary_id(*)
          `)
          .eq('user_id', user.id)
          .eq('vocabulary_id', currentWord.id)
          .eq('shown', false)
          .order('priority', { ascending: false })

        setRecommendations(recs || [])
      }
    } catch (error) {
      console.error('加载记忆数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTechniqueIcon = (type: string) => {
    switch (type) {
      case 'association': return <Link className="w-5 h-5" />
      case 'root': return <BookOpen className="w-5 h-5" />
      case 'visual': return <Eye className="w-5 h-5" />
      case 'phonetic': return <Star className="w-5 h-5" />
      default: return <Lightbulb className="w-5 h-5" />
    }
  }

  const getAssociationTypeLabel = (type: string) => {
    const labels = {
      'synonym': '同义词',
      'antonym': '反义词',
      'root': '同根词',
      'family': '词族',
      'thematic': '主题相关'
    }
    return labels[type as keyof typeof labels] || type
  }

  const getAssociationStrengthColor = (strength: number) => {
    const colors = {
      1: 'bg-gray-200',
      2: 'bg-blue-200',
      3: 'bg-green-200',
      4: 'bg-yellow-200',
      5: 'bg-red-200'
    }
    return colors[strength as keyof typeof colors] || 'bg-gray-200'
  }

  if (!currentWord) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">记忆助手</h3>
        <p className="text-gray-600">选择一个单词来查看记忆技巧和关联</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="w-8 h-8 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">记忆助手</h2>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-3xl font-bold text-indigo-600">{currentWord.word}</span>
          <span className="text-gray-600">{currentWord.pronunciation}</span>
        </div>
      </div>

      {/* 标签导航 */}
      <div className="border-b">
        <nav className="flex space-x-8 px-6">
          {[
            { key: 'techniques', label: '记忆技巧', count: memoryTechniques.length },
            { key: 'associations', label: '词汇关联', count: wordAssociations.length },
            { key: 'recommendations', label: '个性推荐', count: recommendations.length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.key
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 bg-indigo-100 text-indigo-600 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* 内容区域 */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            {/* 记忆技巧 */}
            {activeTab === 'techniques' && (
              <div className="space-y-4">
                {memoryTechniques.length > 0 ? (
                  memoryTechniques.map((technique) => (
                    <div key={technique.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 p-2 bg-indigo-100 rounded-lg">
                          {getTechniqueIcon(technique.technique_type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-2">{technique.title}</h4>
                          <p className="text-gray-600 text-sm leading-relaxed">{technique.description}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">暂无记忆技巧</p>
                    <p className="text-sm text-gray-400 mt-1">系统正在为这个单词生成记忆技巧</p>
                  </div>
                )}

                {/* 助记图片 */}
                {currentWord.mnemonic_image_url && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <Eye className="w-5 h-5 mr-2" />
                      视觉助记
                    </h4>
                    <div className="border rounded-lg overflow-hidden">
                      <img
                        src={currentWord.mnemonic_image_url}
                        alt={`${currentWord.word} 助记图`}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 词汇关联 */}
            {activeTab === 'associations' && (
              <div className="space-y-4">
                {wordAssociations.length > 0 ? (
                  wordAssociations.map((assoc) => (
                    <div key={assoc.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${getAssociationStrengthColor(assoc.strength)}`}></div>
                          <div>
                            <span className="font-medium text-gray-900">
                              {assoc.associated_word?.word}
                            </span>
                            <span className="text-sm text-gray-500 ml-2">
                              {getAssociationTypeLabel(assoc.association_type)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-400">强度: {assoc.strength}/5</span>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                      {assoc.associated_word?.definition_cn && (
                        <p className="text-sm text-gray-600 mt-2 ml-6">
                          {assoc.associated_word.definition_cn}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Link className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">暂无词汇关联</p>
                    <p className="text-sm text-gray-400 mt-1">系统正在分析相关词汇</p>
                  </div>
                )}
              </div>
            )}

            {/* 个性化推荐 */}
            {activeTab === 'recommendations' && (
              <div className="space-y-4">
                {recommendations.length > 0 ? (
                  recommendations.map((rec) => (
                    <div key={rec.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 p-2 bg-green-100 rounded-lg">
                          <Star className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">个性化推荐</h4>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              优先级: {rec.priority}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm">{rec.reason}</p>
                          <button className="mt-3 text-indigo-600 text-sm font-medium hover:text-indigo-700">
                            查看详情 →
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Star className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">暂无个性化推荐</p>
                    <p className="text-sm text-gray-400 mt-1">继续学习以获得更多推荐</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}