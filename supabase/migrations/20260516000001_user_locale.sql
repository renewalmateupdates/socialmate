-- Add locale preference to user_settings
-- Supports: en, es, de, fr, pt, ru, zh
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'en';
