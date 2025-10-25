-- Quest System Tables for Maria Wishlist

-- Users table (extend existing users or create new)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sandik coins table
CREATE TABLE IF NOT EXISTS sandik_coins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quests table
CREATE TABLE IF NOT EXISTS quests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  quest_type VARCHAR(50) NOT NULL, -- 'kiss', 'message', 'daily', etc.
  sandik_reward INTEGER DEFAULT 1 NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_daily BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User quest progress table
CREATE TABLE IF NOT EXISTS user_quests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  quest_id UUID REFERENCES quests(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, quest_id)
);

-- Shop items table
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

-- User purchases table
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

-- Insert default quests
INSERT INTO quests (title, description, quest_type, sandik_reward, is_daily) VALUES
('Поцілунок для Максима', 'Надішли поцілунок Максиму через кнопку цьомчика', 'kiss', 2, false),
('Щоденне бажання', 'Надішли одне бажання Максиму', 'message', 1, true),
('Серійний поцілунок', 'Надішли 3 поцілунки за день', 'kiss', 5, true),
('Серійне бажання', 'Надішли 5 бажань за день', 'message', 3, true),
('Перший квест', 'Відкрий магазин Sandy Shop', 'shop', 1, false);

-- Insert default shop items
INSERT INTO shop_items (name, description, price, item_type, image_url) VALUES
('Віртуальний поцілунок', 'Максим отримає особливий поцілунок від Маші', 5, 'virtual', '/sandik.png'),
('Смачний десерт', 'Максим приготує твій улюблений десерт', 10, 'real', '/sandik.png'),
('Романтичний вечір', 'Максим організує романтичний вечір для Маші', 20, 'real', '/sandik.png'),
('Подарунок-сюрприз', 'Максим подарує тобі сюрприз', 15, 'real', '/sandik.png'),
('Особливе повідомлення', 'Максим напише тобі особливе повідомлення', 3, 'message', '/sandik.png');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sandik_coins_user_id ON sandik_coins(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quests_user_id ON user_quests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quests_quest_id ON user_quests(quest_id);
CREATE INDEX IF NOT EXISTS idx_user_quests_completed ON user_quests(is_completed);
CREATE INDEX IF NOT EXISTS idx_user_purchases_user_id ON user_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_item_id ON user_purchases(item_id);
