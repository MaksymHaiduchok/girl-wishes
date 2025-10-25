-- =====================================================
-- FINAL QUESTS SETUP - Остаточні квести
-- =====================================================

-- 1. Видаляємо всі старі квести
-- =====================================================
DELETE FROM user_quests;
DELETE FROM quests;

-- 2. Додаємо нові квести
-- =====================================================

-- Автоматичні квести (без верифікації)
INSERT INTO quests (title, description, quest_type, sandik_reward, is_daily, requires_verification) VALUES
('Відвідати магазин', 'Відкрий магазин Sandy Shop', 'shop', 1, false, false),
('5 бажань за день', 'Надішли 5 бажань Максиму за день', 'message', 3, true, false),
('3 поцілунки за день', 'Надішли 3 поцілунки Максиму за день', 'kiss', 5, true, false);

-- Квести з верифікацією (ручні)
INSERT INTO quests (title, description, quest_type, sandik_reward, is_daily, requires_verification) VALUES
('Надіслати Максиму цьом в кружечку', 'Надішли Максиму поцілунок в кружечку', 'kiss_circle', 10, false, true),
('Надіслати Максиму хтивку', 'Надішли Максиму хтивку', 'sexy', 15, false, true),
('Розказати про свій день', 'Розкажи Максиму про свій день', 'daily_story', 8, false, true),
('Почухати Сенді', 'Почухай Сенді', 'pet_sandy', 12, false, true),
('Сказати що BMW хуйня', 'Скажи що BMW хуйня', 'bmw_hate', 20, false, true),
('Показати лук оф зе дей', 'Покажи лук оф зе дей', 'look_of_the_day', 25, false, true),
('Поїсти три рази на день', 'Поїж три рази на день', 'eat_three_times', 18, true, true);

-- 3. Перевіряємо результат
-- =====================================================
SELECT 
  'Final quests setup:' as info,
  title,
  quest_type,
  sandik_reward,
  is_daily,
  requires_verification,
  CASE 
    WHEN requires_verification = true THEN '🔒 Manual verification required'
    WHEN requires_verification = false THEN '✅ Auto-complete allowed'
    ELSE '❓ Unknown'
  END as verification_status
FROM quests 
ORDER BY 
  requires_verification ASC,
  sandik_reward ASC;

-- =====================================================
-- FINAL QUESTS SETUP COMPLETE!
-- =====================================================
-- Тепер у нас є тільки потрібні квести з правильними налаштуваннями
-- =====================================================
