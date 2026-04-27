-- Studio Dentista: Supabase tables
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Users / profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  is_subscriber BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Clinic settings per user
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT UNIQUE NOT NULL,
  clinic_name TEXT NOT NULL DEFAULT '',
  specialty TEXT NOT NULL DEFAULT '',
  default_tone TEXT NOT NULL DEFAULT '',
  default_objective TEXT NOT NULL DEFAULT '',
  default_script_mode TEXT NOT NULL DEFAULT 'complete',
  dentist_name TEXT NOT NULL DEFAULT '',
  cro TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '',
  instagram TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Library items (scripts, captions, calendars)
CREATE TABLE IF NOT EXISTS library_items (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'roteiro',
  title TEXT NOT NULL DEFAULT '',
  specialty TEXT NOT NULL DEFAULT '',
  tone TEXT NOT NULL DEFAULT '',
  objective TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  preview TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_library_user ON library_items (user_email);

-- Calendar posts
CREATE TABLE IF NOT EXISTS calendar_posts (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  date INTEGER NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  theme TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'video',
  status TEXT NOT NULL DEFAULT 'rascunho',
  source TEXT NOT NULL DEFAULT 'manual',
  time TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_calendar_user ON calendar_posts (user_email);
CREATE INDEX IF NOT EXISTS idx_calendar_month ON calendar_posts (user_email, month, year);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_posts ENABLE ROW LEVEL SECURITY;

-- Permissive policies (using anon key without Supabase Auth)
-- In production, replace with proper Supabase Auth policies
CREATE POLICY "anon_profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_user_settings" ON user_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_library_items" ON library_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_calendar_posts" ON calendar_posts FOR ALL USING (true) WITH CHECK (true);
