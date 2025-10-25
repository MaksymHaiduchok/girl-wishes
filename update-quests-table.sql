-- Add requires_verification field to quests table
ALTER TABLE quests ADD COLUMN requires_verification BOOLEAN DEFAULT true;

-- Update existing quests
UPDATE quests SET requires_verification = false WHERE quest_type = 'shop';
UPDATE quests SET requires_verification = true WHERE quest_type IN ('kiss', 'message');

-- Add some new quests that don't require verification
INSERT INTO quests (title, description, quest_type, sandik_reward, is_daily, requires_verification) VALUES
('Відкрий магазин', 'Відкрий магазин Sandy Shop', 'shop', 1, false, false),
('Переглянь квести', 'Переглянь список квестів', 'view', 1, false, false),
('Налаштуй профіль', 'Налаштуй свій профіль', 'profile', 2, false, false);

-- Add new quest that requires verification
INSERT INTO quests (title, description, quest_type, sandik_reward, is_daily, requires_verification) VALUES
('Поцілунок в кружечку', 'Надішли Максиму поцілунок в кружечку через Telegram', 'kiss_circle', 3, false, true);
