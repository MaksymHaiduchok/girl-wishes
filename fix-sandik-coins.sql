-- Fix Sandik Coins Table
-- Перевіряємо та виправляємо таблицю sandik_coins

-- 1. Перевіряємо структуру таблиці
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'sandik_coins';

-- 2. Перевіряємо, чи є запис для користувача
SELECT * FROM sandik_coins WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';

-- 3. Якщо немає запису, створюємо його
INSERT INTO sandik_coins (user_id, amount) 
VALUES ('550e8400-e29b-41d4-a716-446655440000', 0)
ON CONFLICT (user_id) DO NOTHING;

-- 4. Перевіряємо, чи є індекс на user_id
CREATE INDEX IF NOT EXISTS idx_sandik_coins_user_id ON sandik_coins(user_id);

-- 5. Перевіряємо, чи є унікальне обмеження на user_id
-- Якщо немає, додаємо його
ALTER TABLE sandik_coins ADD CONSTRAINT unique_user_id UNIQUE (user_id);

-- 6. Тестуємо оновлення монеток
UPDATE sandik_coins 
SET amount = amount + 2 
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';

-- 7. Перевіряємо результат
SELECT * FROM sandik_coins WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';
