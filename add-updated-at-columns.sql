-- =====================================================
-- ADD UPDATED_AT COLUMNS - Додати колонки updated_at
-- =====================================================

-- 1. Додаємо updated_at до user_quests
-- =====================================================
ALTER TABLE user_quests 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Додаємо updated_at до sandik_coins
-- =====================================================
ALTER TABLE sandik_coins 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. Оновлюємо існуючі записи
-- =====================================================
UPDATE user_quests 
SET updated_at = NOW() 
WHERE updated_at IS NULL;

UPDATE sandik_coins 
SET updated_at = NOW() 
WHERE updated_at IS NULL;

-- 4. Перевіряємо результат
-- =====================================================
SELECT 'Columns added successfully:' as info;

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_quests' 
AND column_name = 'updated_at';

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'sandik_coins' 
AND column_name = 'updated_at';
