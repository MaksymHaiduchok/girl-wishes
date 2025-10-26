-- Add quiz quest to the quests table
INSERT INTO quests (id, title, description, quest_type, is_daily, requires_verification, sandik_reward) VALUES
('quiz-quest-id', 'Відвідати щоденну вікторину', 'Відповісти на 3 питання щоденної вікторини', 'quiz', true, false, 15)
ON CONFLICT (id) DO NOTHING;
