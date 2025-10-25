-- =====================================================
-- FINAL RESET FOR PRODUCTION - Фінальне обнулення для продакшену
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

-- 5. Додаємо колонки updated_at якщо їх немає
-- =====================================================
ALTER TABLE user_quests 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE sandik_coins 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 6. Оновлюємо існуючі записи
-- =====================================================
UPDATE user_quests 
SET updated_at = NOW() 
WHERE updated_at IS NULL;

UPDATE sandik_coins 
SET updated_at = NOW() 
WHERE updated_at IS NULL;

-- 7. Перевіряємо результат
-- =====================================================
SELECT '🎉 Production reset completed successfully!' as status;

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

SELECT 
  'Updated_at columns added:' as info,
  'user_quests' as table_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_quests' AND column_name = 'updated_at'
  ) THEN 'YES' ELSE 'NO' END as has_updated_at
UNION ALL
SELECT 
  'Updated_at columns added:' as info,
  'sandik_coins' as table_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sandik_coins' AND column_name = 'updated_at'
  ) THEN 'YES' ELSE 'NO' END as has_updated_at;
