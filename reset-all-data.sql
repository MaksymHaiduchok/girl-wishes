-- =====================================================
-- RESET ALL DATA - Обнулення всіх даних
-- =====================================================

-- 1. Обнуляємо всі квести користувача
-- =====================================================
DELETE FROM user_quests WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';

-- 2. Обнуляємо Sandik монетки
-- =====================================================
UPDATE sandik_coins 
SET amount = 0 
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';

-- 3. Видаляємо всі покупки
-- =====================================================
DELETE FROM user_purchases WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';

-- 4. Видаляємо всі повідомлення
-- =====================================================
DELETE FROM messages;

-- 5. Перевіряємо результат
-- =====================================================
SELECT 'Reset completed:' as info;

SELECT 
  'User quests:' as table_name,
  COUNT(*) as count
FROM user_quests 
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';

SELECT 
  'Sandik coins:' as table_name,
  amount
FROM sandik_coins 
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';

SELECT 
  'User purchases:' as table_name,
  COUNT(*) as count
FROM user_purchases 
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';

SELECT 
  'Messages:' as table_name,
  COUNT(*) as count
FROM messages;
