-- =====================================================
-- DETAILED QUEST RESET - Детальне скидання завдань
-- =====================================================

-- 1. Показуємо поточний стан ПЕРЕД скиданням
-- =====================================================
SELECT 'BEFORE RESET - Current state:' as status;

SELECT 
  'User quests completed:' as info,
  COUNT(*) as count,
  STRING_AGG(q.title, ', ') as completed_quests
FROM user_quests uq
JOIN quests q ON uq.quest_id = q.id
WHERE uq.user_id = '550e8400-e29b-41d4-a716-446655440000'
AND uq.is_completed = true;

SELECT 
  'Current Sandik coins:' as info,
  amount as coins
FROM sandik_coins 
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';

-- 2. Скидаємо всі виконані квести
-- =====================================================
DELETE FROM user_quests 
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';

-- 3. Скидаємо Sandik монетки до 0
-- =====================================================
UPDATE sandik_coins 
SET amount = 0, updated_at = NOW()
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';

-- 4. Показуємо стан ПІСЛЯ скидання
-- =====================================================
SELECT 'AFTER RESET - New state:' as status;

SELECT 
  'User quests completed:' as info,
  COUNT(*) as count
FROM user_quests 
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'
AND is_completed = true;

SELECT 
  'Current Sandik coins:' as info,
  amount as coins
FROM sandik_coins 
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';

SELECT 
  'Available quests:' as info,
  COUNT(*) as count,
  STRING_AGG(title, ', ') as quest_titles
FROM quests 
WHERE is_active = true;

-- 5. Показуємо всі доступні квести
-- =====================================================
SELECT 
  'Available quests for Maria:' as info,
  title,
  description,
  sandik_reward,
  quest_type,
  requires_verification,
  is_daily
FROM quests 
WHERE is_active = true
ORDER BY created_at;

-- =====================================================
-- RESET COMPLETE! Всі квести скинуті!
-- =====================================================
