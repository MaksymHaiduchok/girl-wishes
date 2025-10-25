-- =====================================================
-- UPDATE SHOP ITEMS - Оновлення товарів магазину
-- =====================================================

-- 1. Видаляємо всі старі товари
-- =====================================================
DELETE FROM shop_items;

-- 2. Додаємо нові товари з фото з Google
-- =====================================================
INSERT INTO shop_items (name, description, price, item_type, image_url) VALUES
('Кіндер', 'Смачний Кіндер сюрприз', 60, 'real', 'https://images.unsplash.com/photo-1609501676725-7186f3a0a3d3?w=300&h=300&fit=crop'),
('Максим миє тобі повністю машину', 'Повне миття машини від Максима', 80, 'real', 'https://images.unsplash.com/photo-1558618047-7c0b4a0b0b0b?w=300&h=300&fit=crop'),
('Бліизна Linkoyer', 'Стильна блізка Linkoyer', 300, 'real', 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=300&fit=crop'),
('Абонемент на Хачапурі', 'Абонемент на улюблені хачапурі', 32, 'real', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=300&fit=crop'),
('Чізбургер', 'Смачний чізбургер', 16, 'real', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=300&fit=crop'),
('Пачка фломастерів для розмальовки Максима', 'Кольорові фломастери для розмальовки', 24, 'real', 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=300&fit=crop'),
('Какао', 'Гаряче какао', 2, 'real', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop'),
('Телевізор', 'Новий телевізор', 580, 'real', 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300&h=300&fit=crop');

-- 3. Перевіряємо результат
-- =====================================================
SELECT 
  'Shop items updated:' as info,
  name,
  description,
  price,
  item_type,
  CASE 
    WHEN price <= 50 THEN '🟢 Дешево'
    WHEN price <= 100 THEN '🟡 Середньо'
    WHEN price <= 300 THEN '🟠 Дорого'
    ELSE '🔴 Дуже дорого'
  END as price_category
FROM shop_items 
ORDER BY price ASC;

-- =====================================================
-- SHOP ITEMS UPDATED!
-- =====================================================
-- Тепер в магазині є нові товари з правильними цінами
-- =====================================================
