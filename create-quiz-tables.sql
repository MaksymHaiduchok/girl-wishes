-- Create quiz system tables
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_quiz_questions_active ON quiz_questions USING btree (is_active);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_difficulty ON quiz_questions USING btree (difficulty);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_category ON quiz_questions USING btree (category);
CREATE INDEX IF NOT EXISTS idx_user_quiz_answers_user_id ON user_quiz_answers USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_answers_question_id ON user_quiz_answers USING btree (question_id);
CREATE INDEX IF NOT EXISTS idx_daily_quiz_sessions_user_id ON daily_quiz_sessions USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_daily_quiz_sessions_quiz_date ON daily_quiz_sessions USING btree (quiz_date);

-- Enable RLS
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_quiz_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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
