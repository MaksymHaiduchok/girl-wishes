-- =====================================================
-- CREATE DAILY RESET LOG TABLE
-- =====================================================

-- Створюємо таблицю для логування скидання щоденних квестів
CREATE TABLE IF NOT EXISTS daily_reset_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  last_reset TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Додаємо індекс для швидкого пошуку
CREATE INDEX IF NOT EXISTS idx_daily_reset_log_last_reset 
ON daily_reset_log(last_reset DESC);

-- Перевіряємо створення таблиці
SELECT '✅ Daily reset log table created successfully!' as status;
