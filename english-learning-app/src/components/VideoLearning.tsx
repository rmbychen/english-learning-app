import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, BookOpen, Clock, Star } from 'lucide-react'

interface VideoLesson {
  id: string
  title: string
  description: string
  video_url: string
  thumbnail_url?: string
  duration: number
  difficulty_level: number
  category: string
  vocabulary_ids?: string[]
  subtitles_url?: string
}

interface UserVideoProgress {
  id: string
  video_id: string
  progress_seconds: number
  completed: boolean
  watch_count: number
  last_watched: string
}

export default function VideoLearning() {
  const [videos, setVideos] = useState<VideoLesson[]>([])
  const [currentVideo, setCurrentVideo] = useState<VideoLesson | null>(null)
  const [userProgress, setUserProgress] = useState<UserVideoProgress[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [showSubtitles, setShowSubtitles] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadVideoLessons()
    loadUserProgress()
  }, [])

  const loadVideoLessons = async () => {
    try {
      const { data, error } = await supabase
        .from('video_lessons')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setVideos(data || [])
      if (data && data.length > 0) {
        setCurrentVideo(data[0])
      }
    } catch (error) {
      console.error('加载视频课程失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('user_video_progress')
        .select('*')
        .eq('user_id', user.id)

      if (error) throw error

      setUserProgress(data || [])
    } catch (error) {
      console.error('加载学习进度失败:', error)
    }
  }

  const updateProgress = async (videoId: string, progressSeconds: number, completed: boolean = false) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const existingProgress = userProgress.find(p => p.video_id === videoId)
      
      if (existingProgress) {
        // 更新现有进度
        await supabase
          .from('user_video_progress')
          .update({
            progress_seconds: progressSeconds,
            completed,
            watch_count: existingProgress.watch_count + 1,
            last_watched: new Date().toISOString()
          })
          .eq('id', existingProgress.id)
      } else {
        // 创建新进度记录
        await supabase
          .from('user_video_progress')
          .insert({
            user_id: user.id,
            video_id: videoId,
            progress_seconds: progressSeconds,
            completed,
            watch_count: 1
          })
      }

      // 重新加载进度
      loadUserProgress()
    } catch (error) {
      console.error('更新学习进度失败:', error)
    }
  }

  const getProgress = (videoId: string) => {
    return userProgress.find(p => p.video_id === videoId)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const togglePlay = () => {
    const video = document.getElementById('main-video') as HTMLVideoElement
    if (video) {
      if (isPlaying) {
        video.pause()
      } else {
        video.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    const video = document.getElementById('main-video') as HTMLVideoElement
    if (video) {
      setCurrentTime(video.currentTime)
      
      // 更新学习进度
      if (currentVideo) {
        const completed = video.currentTime >= video.duration * 0.9
        updateProgress(currentVideo.id, Math.floor(video.currentTime), completed)
      }
    }
  }

  const handleLoadedMetadata = () => {
    const video = document.getElementById('main-video') as HTMLVideoElement
    if (video) {
      setDuration(video.duration)
      
      // 恢复上次观看位置
      if (currentVideo) {
        const progress = getProgress(currentVideo.id)
        if (progress && progress.progress_seconds > 0) {
          video.currentTime = progress.progress_seconds
        }
      }
    }
  }

  const seekTo = (time: number) => {
    const video = document.getElementById('main-video') as HTMLVideoElement
    if (video) {
      video.currentTime = time
      setCurrentTime(time)
    }
  }

  const toggleMute = () => {
    const video = document.getElementById('main-video') as HTMLVideoElement
    if (video) {
      video.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    const video = document.getElementById('main-video') as HTMLVideoElement
    if (video) {
      video.volume = newVolume
      setVolume(newVolume)
      setIsMuted(newVolume === 0)
    }
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
      {/* 视频学习统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">总课程数</p>
          <p className="text-3xl font-bold text-blue-600">{videos.length}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">已完成</p>
          <p className="text-3xl font-bold text-green-600">
            {userProgress.filter(p => p.completed).length}
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">总观看时长</p>
          <p className="text-3xl font-bold text-purple-600">
            {formatTime(userProgress.reduce((sum, p) => sum + p.progress_seconds, 0))}
          </p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">连续观看天数</p>
          <p className="text-3xl font-bold text-orange-600">7</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 视频列表 */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-bold mb-4">课程列表</h3>
          <div className="space-y-3">
            {videos.map((video) => {
              const progress = getProgress(video.id)
              const progressPercent = progress ? (progress.progress_seconds / video.duration) * 100 : 0
              
              return (
                <div
                  key={video.id}
                  onClick={() => setCurrentVideo(video)}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    currentVideo?.id === video.id 
                      ? 'bg-indigo-100 border-2 border-indigo-500' 
                      : 'bg-white border hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                        <Play className="w-6 h-6 text-gray-500" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{video.title}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTime(video.duration)}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center">
                          <Star className="w-3 h-3 mr-1" />
                          难度 {video.difficulty_level}
                        </span>
                      </div>
                      {progress && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>学习进度</span>
                            <span>{Math.round(progressPercent)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-indigo-600 h-1.5 rounded-full transition-all"
                              style={{ width: `${progressPercent}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 视频播放器 */}
        <div className="lg:col-span-2">
          {currentVideo ? (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* 视频播放器 */}
              <div className="relative bg-black">
                <video
                  id="main-video"
                  className="w-full aspect-video"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  poster={currentVideo.thumbnail_url}
                >
                  <source src={currentVideo.video_url} type="video/mp4" />
                  您的浏览器不支持视频播放。
                </video>

                {/* 视频控制栏 */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  {/* 进度条 */}
                  <div className="mb-3">
                    <input
                      type="range"
                      min="0"
                      max={duration}
                      value={currentTime}
                      onChange={(e) => seekTo(Number(e.target.value))}
                      className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>

                  {/* 控制按钮 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={togglePlay}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                      >
                        {isPlaying ? (
                          <Pause className="w-6 h-6 text-white" />
                        ) : (
                          <Play className="w-6 h-6 text-white" />
                        )}
                      </button>
                      
                      <button
                        onClick={toggleMute}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                      >
                        {isMuted ? (
                          <VolumeX className="w-5 h-5 text-white" />
                        ) : (
                          <Volume2 className="w-5 h-5 text-white" />
                        )}
                      </button>
                      
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => handleVolumeChange(Number(e.target.value))}
                        className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                      />
                      
                      <span className="text-white text-sm">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowSubtitles(!showSubtitles)}
                        className={`p-2 rounded-full transition-colors ${
                          showSubtitles ? 'bg-white/20' : 'hover:bg-white/20'
                        }`}
                      >
                        <BookOpen className="w-5 h-5 text-white" />
                      </button>
                      
                      <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
                        <Maximize className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 视频信息 */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentVideo.title}</h2>
                    <p className="text-gray-600">{currentVideo.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                      难度 {currentVideo.difficulty_level}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                      {currentVideo.category}
                    </span>
                  </div>
                </div>

                {/* 学习重点 */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">🎯 学习重点</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• 注意单词的发音和语调</li>
                    <li>• 观察单词在语境中的使用</li>
                    <li>• 记录不熟悉的表达方式</li>
                    <li>• 跟读练习提高口语</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">选择课程</h3>
              <p className="text-gray-600">从左侧列表中选择一个课程开始学习</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}