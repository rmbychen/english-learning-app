import { useState, useEffect } from 'react'
import { supabase, UserProfile } from '../lib/supabase'

/**
 * 检查当前用户是否是管理员
 */
export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAdminStatus()
  }, [])

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setIsAdmin(false)
        setIsSuperAdmin(false)
        setUserProfile(null)
        setLoading(false)
        return
      }

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('获取用户资料失败:', error)
        setIsAdmin(false)
        setIsSuperAdmin(false)
        setUserProfile(null)
      } else {
        setUserProfile(profile)
        setIsAdmin(profile?.role === 'admin' || profile?.role === 'super_admin')
        setIsSuperAdmin(profile?.role === 'super_admin')
      }
    } catch (error) {
      console.error('检查管理员状态失败:', error)
      setIsAdmin(false)
      setIsSuperAdmin(false)
    } finally {
      setLoading(false)
    }
  }

  return {
    isAdmin,
    isSuperAdmin,
    userProfile,
    loading,
    refresh: checkAdminStatus,
  }
}


