-- Complete quiz system setup
-- This script sets up the entire quiz system

-- 1. Create quiz tables
-- =====================================================
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer CHARACTER(1) NOT NULL,
  explanation TEXT,
  difficulty CHARACTER VARYING(20) DEFAULT 'medium',
  category CHARACTER VARYING(50) DEFAULT 'general',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT quiz_questions_pkey PRIMARY KEY (id),
  CONSTRAINT quiz_questions_correct_answer_check CHECK (
    correct_answer = ANY (ARRAY['A'::bpchar, 'B'::bpchar, 'C'::bpchar, 'D'::bpchar])
  ),
  CONSTRAINT quiz_questions_difficulty_check CHECK (
    (difficulty)::text = ANY (ARRAY['easy'::character varying, 'medium'::character varying, 'hard'::character varying]::text[])
  )
);

CREATE TABLE IF NOT EXISTS user_quiz_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  question_id UUID NOT NULL,
  user_answer CHARACTER(1) NOT NULL,
  is_correct BOOLEAN NOT NULL,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT user_quiz_answers_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS daily_quiz_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  quiz_date DATE NOT NULL,
  questions_answered INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  total_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT daily_quiz_sessions_pkey PRIMARY KEY (id)
);

-- 2. Create indexes
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_quiz_questions_active ON quiz_questions USING btree (is_active);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_difficulty ON quiz_questions USING btree (difficulty);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_category ON quiz_questions USING btree (category);
CREATE INDEX IF NOT EXISTS idx_user_quiz_answers_user_id ON user_quiz_answers USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_answers_question_id ON user_quiz_answers USING btree (question_id);
CREATE INDEX IF NOT EXISTS idx_daily_quiz_sessions_user_id ON daily_quiz_sessions USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_daily_quiz_sessions_quiz_date ON daily_quiz_sessions USING btree (quiz_date);

-- 3. Enable RLS
-- =====================================================
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_quiz_sessions ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
-- =====================================================
CREATE POLICY "Allow all users to read quiz questions"
ON quiz_questions FOR SELECT
USING (is_active = true);

CREATE POLICY "Allow all users to read quiz answers"
ON user_quiz_answers FOR SELECT
USING (true);

CREATE POLICY "Allow all users to insert quiz answers"
ON user_quiz_answers FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow all users to read quiz sessions"
ON daily_quiz_sessions FOR SELECT
USING (true);

CREATE POLICY "Allow all users to insert quiz sessions"
ON daily_quiz_sessions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow all users to update quiz sessions"
ON daily_quiz_sessions FOR UPDATE
USING (true);

-- 5. Add quiz questions
-- =====================================================
INSERT INTO quiz_questions (question, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, category) VALUES
('Яка столиця України?', 'Київ', 'Львів', 'Харків', 'Одеса', 'A', 'Київ - столиця та найбільше місто України', 'easy', 'географія'),
('Скільки днів у тижні?', '5', '6', '7', '8', 'C', 'У тижні 7 днів: понеділок, вівторок, середа, четвер, п''ятниця, субота, неділя', 'easy', 'загальні знання'),
('Який колір отримуємо при змішуванні червоного та синього?', 'Зелений', 'Жовтий', 'Фіолетовий', 'Помаранчевий', 'C', 'Червоний + синій = фіолетовий', 'easy', 'мистецтво'),
('Якого покоління у Максима Audi A4?', 'C6', 'E90', 'B7', 'F30', 'C', 'У Максима Audi A4 B7 покоління - це класичний седан з 2004-2008 років', 'medium', 'максим'),
('Який рекорд був у Максима зі стрибків у висоту?', '205 см', '189 см', '165 см', '175 см', 'A', 'Максим встановив особистий рекорд 205 см у стрибках у висоту!', 'hard', 'максим'),
('Наскільки сильно Максим любить Машу?', 'Дуже сильно', 'Ахуєть як сильно', 'Піздєц як сильно', 'Всі варіанти правильні', 'D', 'Максим любить Машу всіма способами - дуже сильно, ахуєть як сильно, піздєц як сильно!', 'easy', 'романтика'),
('Що означає "любов з першого погляду"?', 'Миттєве відчуття кохання', 'Повільне закохання', 'Дружба', 'Симпатія', 'A', 'Любов з першого погляду - це миттєве відчуття кохання при першій зустрічі', 'easy', 'романтика'),
('Який найромантичніший місяць року?', 'Січень', 'Лютий', 'Травень', 'Грудень', 'B', 'Лютий вважається найромантичнішим місяцем через День святого Валентина', 'easy', 'романтика'),
('Що краще для романтичного вечора?', 'Гучна музика', 'Тиха музика', 'Без музики', 'Радіо', 'B', 'Тиха музика створює романтичну атмосферу', 'easy', 'романтика'),
('Яка найпопулярніша соціальна мережа?', 'Facebook', 'Instagram', 'TikTok', 'Twitter', 'A', 'Facebook залишається найпопулярнішою соціальною мережею у світі', 'medium', 'технології'),
('Скільки кольорів у веселці?', '5', '6', '7', '8', 'C', 'У веселці 7 кольорів: червоний, помаранчевий, жовтий, зелений, блакитний, синій, фіолетовий', 'easy', 'природа'),
('Яка найвища гора у світі?', 'Кіліманджаро', 'Еверест', 'Канченджанга', 'Лхотце', 'B', 'Еверест (Джомолунгма) - найвища гора у світі (8848 м)', 'medium', 'географія')
ON CONFLICT DO NOTHING;

-- 6. Add quiz quest
-- =====================================================
INSERT INTO quests (id, title, description, quest_type, is_daily, requires_verification, sandik_reward) VALUES
('quiz-quest-id', 'Відвідати щоденну вікторину', 'Відповісти на 3 питання щоденної вікторини', 'quiz', true, false, 15)
ON CONFLICT (id) DO NOTHING;

-- 7. Verify setup
-- =====================================================
SELECT 'Quiz system setup complete!' as status;
SELECT COUNT(*) as total_questions FROM quiz_questions;
SELECT COUNT(*) as total_quests FROM quests WHERE quest_type = 'quiz';
