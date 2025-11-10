-- 添加角色字段到user_profiles表
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin'));

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- 创建管理员账号的函数
-- 注意：这个函数需要在Supabase Dashboard的SQL编辑器中执行
-- 或者通过应用代码调用

-- 方法1: 直接在Supabase Dashboard中执行以下SQL来创建管理员账号
-- 首先需要手动在Supabase Auth中创建用户，然后执行：

-- 假设管理员邮箱是 leilei@admin.com (或者使用用户名作为邮箱)
-- 如果使用用户名登录，需要先通过Supabase Dashboard的Auth部分创建用户

-- 方法2: 使用以下SQL脚本（需要先通过Supabase Auth创建用户）
-- 替换 <USER_ID> 为实际创建的用户ID

/*
-- 步骤1: 在Supabase Dashboard -> Authentication -> Users 中手动创建用户
-- 邮箱: leilei@admin.com (或任意邮箱)
-- 密码: 123456
-- 然后复制用户ID

-- 步骤2: 执行以下SQL，将 <USER_ID> 替换为实际用户ID
UPDATE user_profiles 
SET role = 'super_admin', username = 'leilei'
WHERE id = '<USER_ID>';

-- 如果user_profiles中还没有记录，执行：
INSERT INTO user_profiles (id, username, role, level, experience_points, streak_days, total_words_learned)
VALUES (
  '<USER_ID>',
  'leilei',
  'super_admin',
  999,
  999999,
  999,
  999999
)
ON CONFLICT (id) DO UPDATE 
SET role = 'super_admin', username = 'leilei';
*/

-- 方法3: 创建一个存储过程来自动创建管理员（推荐）
CREATE OR REPLACE FUNCTION create_admin_user(
  p_email TEXT,
  p_username TEXT,
  p_password TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- 注意：这个函数需要Supabase的扩展权限
  -- 实际创建用户需要通过Supabase Auth API
  -- 这里只是示例，实际应该通过应用代码调用Supabase Auth API
  
  RETURN NULL;
END;
$$;

-- 实际创建管理员账号的说明：
-- 1. 在Supabase Dashboard -> Authentication -> Users 中点击 "Add user"
-- 2. 输入邮箱: leilei@admin.com (或任意邮箱)
-- 3. 输入密码: 123456
-- 4. 取消勾选 "Auto Confirm User" (如果需要邮件确认) 或勾选 (如果不需要)
-- 5. 点击创建
-- 6. 复制创建的用户ID
-- 7. 在SQL编辑器中执行以下SQL（替换USER_ID）:

-- 创建或更新管理员资料
INSERT INTO user_profiles (id, username, role, level, experience_points, streak_days, total_words_learned)
VALUES (
  '<USER_ID>',  -- 替换为实际用户ID
  'leilei',
  'super_admin',
  999,
  999999,
  999,
  999999
)
ON CONFLICT (id) DO UPDATE 
SET 
  role = 'super_admin',
  username = 'leilei',
  level = 999,
  experience_points = 999999,
  streak_days = 999,
  total_words_learned = 999999;


