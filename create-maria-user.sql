-- Create Maria user and initial Sandik coins
-- Створюємо користувача Марію та початкові Sandik монетки

-- 1. Створюємо користувача Марію (якщо не існує)
INSERT INTO users (id, name, email) 
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Maria', 'maria@example.com')
ON CONFLICT (id) DO NOTHING;

-- 2. Створюємо початковий запис Sandik монеток для Марії
INSERT INTO sandik_coins (user_id, amount) 
VALUES ('550e8400-e29b-41d4-a716-446655440000', 0)
ON CONFLICT (user_id) DO NOTHING;

-- 3. Перевіряємо результат
SELECT u.name, sc.amount 
FROM users u 
LEFT JOIN sandik_coins sc ON u.id = sc.user_id 
WHERE u.id = '550e8400-e29b-41d4-a716-446655440000';
