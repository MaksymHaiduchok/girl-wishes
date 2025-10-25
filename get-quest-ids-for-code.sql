-- =====================================================
-- GET QUEST IDs FOR CODE - Отримати ID квестів для коду
-- =====================================================

-- Показуємо всі квести з їх ID для оновлення коду
SELECT 
  'Quest IDs for code update:' as info,
  id,
  title,
  quest_type,
  is_daily,
  requires_verification
FROM quests 
ORDER BY title;

-- Показуємо тільки автоматичні квести (для auto-complete)
SELECT 
  'Auto-complete quests (requires_verification = false):' as info,
  id,
  title,
  quest_type
FROM quests 
WHERE requires_verification = false
ORDER BY title;
