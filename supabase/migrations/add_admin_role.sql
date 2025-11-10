-- 添加角色字段到user_profiles表
-- 执行此SQL脚本来添加管理员功能支持

-- 1. 添加role字段
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin'));

-- 2. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- 3. 为现有用户设置默认角色（如果还没有设置）
UPDATE user_profiles 
SET role = 'user' 
WHERE role IS NULL;

-- 4. 创建管理员账号的说明：
-- 
-- 方法1：通过应用注册（推荐）
-- 1. 在注册页面，邮箱输入：leilei@admin.com，用户名输入：leilei，密码：123456
-- 2. 系统会自动识别并设置为super_admin角色
-- 
-- 方法2：手动在Supabase Dashboard创建
-- 1. 进入 Supabase Dashboard -> Authentication -> Users
-- 2. 点击 "Add user"
-- 3. 邮箱：leilei@admin.com
-- 4. 密码：123456
-- 5. 取消勾选 "Auto Confirm User"（如果需要邮件确认）或勾选（如果不需要）
-- 6. 点击创建
-- 7. 复制用户ID
-- 8. 在SQL编辑器中执行以下SQL（替换<USER_ID>为实际用户ID）:
--
-- INSERT INTO user_profiles (id, username, role, level, experience_points, streak_days, total_words_learned)
-- VALUES (
--   '<USER_ID>',
--   'leilei',
--   'super_admin',
--   999,
--   999999,
--   999,
--   999999
-- )
-- ON CONFLICT (id) DO UPDATE 
-- SET 
--   role = 'super_admin',
--   username = 'leilei',
--   level = 999,
--   experience_points = 999999,
--   streak_days = 999,
--   total_words_learned = 999999;


