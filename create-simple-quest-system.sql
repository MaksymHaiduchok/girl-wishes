-- Simplified Quest System for Maria Wishlist
-- Only Maria needs to be in the database

-- Create Maria user (fixed ID)
INSERT INTO users (id, name, email) VALUES 
('maria-user-001', 'Maria', 'maria@example.com')
ON CONFLICT (id) DO NOTHING;

-- Sandik coins for Maria
INSERT INTO sandik_coins (user_id, amount) VALUES 
('maria-user-001', 0)
ON CONFLICT (user_id) DO NOTHING;

-- Quests (same as before)
INSERT INTO quests (title, description, quest_type, sandik_reward, is_daily) VALUES
('Поцілунок для Максима', 'Надішли поцілунок Максиму через кнопку цьомчика', 'kiss', 2, false),
('Щоденне бажання', 'Надішли одне бажання Максиму', 'message', 1, true),
('Серійний поцілунок', 'Надішли 3 поцілунки за день', 'kiss', 5, true),
('Серійне бажання', 'Надішли 5 бажань за день', 'message', 3, true),
('Перший квест', 'Відкрий магазин Sandy Shop', 'shop', 1, false)
ON CONFLICT DO NOTHING;

-- Shop items (same as before)
INSERT INTO shop_items (name, description, price, item_type, image_url) VALUES
('Віртуальний поцілунок', 'Максим отримає особливий поцілунок від Маші', 5, 'virtual', '/sandik.png'),
('Смачний десерт', 'Максим приготує твій улюблений десерт', 10, 'real', '/sandik.png'),
('Романтичний вечір', 'Максим організує романтичний вечір для Маші', 20, 'real', '/sandik.png'),
('Подарунок-сюрприз', 'Максим подарує тобі сюрприз', 15, 'real', '/sandik.png'),
('Особливе повідомлення', 'Максим напише тобі особливе повідомлення', 3, 'message', '/sandik.png')
ON CONFLICT DO NOTHING;
