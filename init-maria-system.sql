-- Initialize Maria's Quest System
-- Run this in Supabase SQL Editor

-- Create Maria user (if not exists)
INSERT INTO users (id, name, email) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Maria', 'maria@example.com')
ON CONFLICT (id) DO NOTHING;

-- Initialize Sandik coins for Maria (if not exists)
INSERT INTO sandik_coins (user_id, amount) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 0)
ON CONFLICT (user_id) DO NOTHING;

-- Insert quests (if not exist)
INSERT INTO quests (title, description, quest_type, sandik_reward, is_daily) VALUES
('Поцілунок для Максима', 'Надішли поцілунок Максиму через кнопку цьомчика', 'kiss', 2, false),
('Щоденне бажання', 'Надішли одне бажання Максиму', 'message', 1, true),
('Серійний поцілунок', 'Надішли 3 поцілунки за день', 'kiss', 5, true),
('Серійне бажання', 'Надішли 5 бажань за день', 'message', 3, true),
('Перший квест', 'Відкрий магазин Sandy Shop', 'shop', 1, false)
ON CONFLICT DO NOTHING;

-- Insert shop items (if not exist)
INSERT INTO shop_items (name, description, price, item_type, image_url) VALUES
('Віртуальний поцілунок', 'Максим отримає особливий поцілунок від Маші', 5, 'virtual', '/sandik.png'),
('Смачний десерт', 'Максим приготує твій улюблений десерт', 10, 'real', '/sandik.png'),
('Романтичний вечір', 'Максим організує романтичний вечір для Маші', 20, 'real', '/sandik.png'),
('Подарунок-сюрприз', 'Максим подарує тобі сюрприз', 15, 'real', '/sandik.png'),
('Особливе повідомлення', 'Максим напише тобі особливе повідомлення', 3, 'message', '/sandik.png')
ON CONFLICT DO NOTHING;

-- Check if everything was created
SELECT 'Users:' as table_name, count(*) as count FROM users
UNION ALL
SELECT 'Sandik Coins:', count(*) FROM sandik_coins
UNION ALL
SELECT 'Quests:', count(*) FROM quests
UNION ALL
SELECT 'Shop Items:', count(*) FROM shop_items;
