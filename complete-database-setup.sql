-- =====================================================
-- COMPLETE DATABASE SETUP FOR MARIA WISHLIST SYSTEM
-- =====================================================
-- Цей скрипт створює всі необхідні таблиці та дані для роботи системи квестів

-- 1. USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. SANDIK COINS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS sandik_coins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 3. QUESTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS quests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  quest_type VARCHAR(50) NOT NULL, -- 'kiss', 'message', 'daily', 'shop', 'kiss_circle'
  sandik_reward INTEGER DEFAULT 1 NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_daily BOOLEAN DEFAULT false,
  requires_verification BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. USER QUESTS TABLE (Progress tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_quests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  quest_id UUID REFERENCES quests(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, quest_id)
);

-- 5. SHOP ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS shop_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL, -- price in Sandik coins
  item_type VARCHAR(50) NOT NULL, -- 'virtual', 'real', 'message'
  is_available BOOLEAN DEFAULT true,
  image_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. USER PURCHASES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES shop_items(id) ON DELETE CASCADE,
  sandik_spent INTEGER NOT NULL,
  purchase_data JSONB, -- for storing additional data like delivery address
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. MESSAGES TABLE (for storing wishes)
-- =====================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. CREATE INDEXES FOR BETTER PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_sandik_coins_user_id ON sandik_coins(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quests_user_id ON user_quests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quests_quest_id ON user_quests(quest_id);
CREATE INDEX IF NOT EXISTS idx_user_quests_completed ON user_quests(is_completed);
CREATE INDEX IF NOT EXISTS idx_user_purchases_user_id ON user_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_item_id ON user_purchases(item_id);
CREATE INDEX IF NOT EXISTS idx_quests_active ON quests(is_active);
CREATE INDEX IF NOT EXISTS idx_quests_type ON quests(quest_type);
CREATE INDEX IF NOT EXISTS idx_shop_items_available ON shop_items(is_available);

-- 9. INSERT MARIA USER
-- =====================================================
INSERT INTO users (id, name, email) 
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Maria', 'maria@example.com')
ON CONFLICT (id) DO NOTHING;

-- 10. INSERT INITIAL SANDIK COINS FOR MARIA
-- =====================================================
INSERT INTO sandik_coins (user_id, amount) 
VALUES ('550e8400-e29b-41d4-a716-446655440000', 0)
ON CONFLICT (user_id) DO NOTHING;

-- 11. INSERT DEFAULT QUESTS
-- =====================================================
INSERT INTO quests (title, description, quest_type, sandik_reward, is_daily, requires_verification) VALUES
('Перший квест', 'Відкрий магазин Sandy Shop', 'shop', 1, false, false),
('Поцілунок для Максима', 'Надішли поцілунок Максиму через кнопку цьомчика', 'kiss', 2, false, true),
('Щоденне бажання', 'Надішли одне бажання Максиму', 'message', 1, true, true),
('Серійний поцілунок', 'Надішли 3 поцілунки за день', 'kiss', 5, true, true),
('Серійне бажання', 'Надішли 5 бажань за день', 'message', 3, true, true),
('Поцілунок в кружечку', 'Надішли Максиму поцілунок в кружечку', 'kiss_circle', 3, false, true);

-- 12. INSERT DEFAULT SHOP ITEMS
-- =====================================================
INSERT INTO shop_items (name, description, price, item_type, image_url) VALUES
('Віртуальний поцілунок', 'Максим отримає особливий поцілунок від Маші', 5, 'virtual', '/sandik.png'),
('Смачний десерт', 'Максим приготує твій улюблений десерт', 10, 'real', '/sandik.png'),
('Романтичний вечір', 'Максим організує романтичний вечір для Маші', 20, 'real', '/sandik.png'),
('Подарунок-сюрприз', 'Максим подарує тобі сюрприз', 15, 'real', '/sandik.png'),
('Особливе повідомлення', 'Максим напише тобі особливе повідомлення', 3, 'message', '/sandik.png');

-- 13. CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to add Sandik coins safely
CREATE OR REPLACE FUNCTION add_sandik_coins(
  user_id_param UUID,
  amount_to_add INTEGER
) RETURNS INTEGER AS $$
DECLARE
  current_amount INTEGER;
  new_amount INTEGER;
BEGIN
  -- Get current amount or 0 if no record exists
  SELECT COALESCE(amount, 0) INTO current_amount
  FROM sandik_coins 
  WHERE user_id = user_id_param;
  
  -- Calculate new amount
  new_amount := current_amount + amount_to_add;
  
  -- Insert or update the record
  INSERT INTO sandik_coins (user_id, amount)
  VALUES (user_id_param, new_amount)
  ON CONFLICT (user_id) 
  DO UPDATE SET amount = new_amount, updated_at = NOW();
  
  RETURN new_amount;
END;
$$ LANGUAGE plpgsql;

-- Function to deduct Sandik coins safely
CREATE OR REPLACE FUNCTION deduct_sandik_coins(
  user_id_param UUID,
  amount_to_deduct INTEGER
) RETURNS INTEGER AS $$
DECLARE
  current_amount INTEGER;
  new_amount INTEGER;
BEGIN
  -- Get current amount
  SELECT COALESCE(amount, 0) INTO current_amount
  FROM sandik_coins 
  WHERE user_id = user_id_param;
  
  -- Calculate new amount (ensure it doesn't go below 0)
  new_amount := GREATEST(0, current_amount - amount_to_deduct);
  
  -- Update the record
  UPDATE sandik_coins 
  SET amount = new_amount, updated_at = NOW()
  WHERE user_id = user_id_param;
  
  RETURN new_amount;
END;
$$ LANGUAGE plpgsql;

-- 14. VERIFY SETUP
-- =====================================================
-- Перевіряємо, що все створилося правильно
SELECT 'Users count:' as info, COUNT(*) as count FROM users;
SELECT 'Sandik coins count:' as info, COUNT(*) as count FROM sandik_coins;
SELECT 'Quests count:' as info, COUNT(*) as count FROM quests;
SELECT 'Shop items count:' as info, COUNT(*) as count FROM shop_items;

-- Перевіряємо Марію та її монетки
SELECT 
  u.name, 
  sc.amount as sandik_coins,
  'Maria setup complete!' as status
FROM users u 
LEFT JOIN sandik_coins sc ON u.id = sc.user_id 
WHERE u.id = '550e8400-e29b-41d4-a716-446655440000';

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- Тепер система готова до роботи:
-- 1. Квести автоматично нараховують монетки при підтвердженні в Telegram
-- 2. Магазин працює з монетками
-- 3. Всі API ендпоінти готові до роботи
-- =====================================================
