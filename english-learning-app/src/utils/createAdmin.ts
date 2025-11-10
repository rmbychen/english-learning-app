/**
 * 创建超级管理员账号的工具函数
 * 这个文件用于在开发环境中快速创建管理员账号
 * 
 * 使用方法：
 * 1. 在浏览器控制台中执行：
 *    import('./utils/createAdmin').then(m => m.createAdminUser())
 * 2. 或者创建一个临时页面调用此函数
 */

import { supabase } from '../lib/supabase'

export async function createAdminUser() {
  const email = 'leilei@admin.com' // 或使用用户名作为邮箱
  const password = '123456'
  const username = 'leilei'

  try {
    console.log('开始创建管理员账号...')

    // 1. 注册用户
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      // 如果用户已存在，尝试登录
      if (signUpError.message.includes('already registered')) {
        console.log('用户已存在，尝试登录...')
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          throw new Error(`登录失败: ${signInError.message}`)
        }

        if (signInData.user) {
          // 更新用户资料为管理员
          const { error: updateError } = await supabase
            .from('user_profiles')
            .upsert({
              id: signInData.user.id,
              username,
              role: 'super_admin',
              level: 999,
              experience_points: 999999,
              streak_days: 999,
              total_words_learned: 999999,
            })

          if (updateError) {
            throw new Error(`更新管理员资料失败: ${updateError.message}`)
          }

          console.log('✅ 管理员账号创建成功！')
          console.log('用户ID:', signInData.user.id)
          console.log('用户名:', username)
          console.log('角色: super_admin')
          return { success: true, userId: signInData.user.id }
        }
      } else {
        throw signUpError
      }
    }

    if (signUpData.user) {
      // 2. 创建管理员资料
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: signUpData.user.id,
          username,
          role: 'super_admin',
          level: 999,
          experience_points: 999999,
          streak_days: 999,
          total_words_learned: 999999,
        })

      if (profileError) {
        throw new Error(`创建管理员资料失败: ${profileError.message}`)
      }

      console.log('✅ 管理员账号创建成功！')
      console.log('用户ID:', signUpData.user.id)
      console.log('用户名:', username)
      console.log('角色: super_admin')
      console.log('注意：如果启用了邮件确认，请检查邮箱并确认账户')
      
      return { success: true, userId: signUpData.user.id, needsConfirmation: !signUpData.session }
    }

    throw new Error('注册失败：未返回用户数据')
  } catch (error: any) {
    console.error('❌ 创建管理员账号失败:', error.message)
    return { success: false, error: error.message }
  }
}

// 如果直接运行此文件（开发环境）
if (import.meta.env.DEV) {
  // 可以通过浏览器控制台调用
  ;(window as any).createAdminUser = createAdminUser
  console.log('💡 提示：在控制台执行 createAdminUser() 来创建管理员账号')
}


