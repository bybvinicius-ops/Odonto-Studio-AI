-- Add color_tag column to scripts table if it doesn't exist
ALTER TABLE scripts ADD COLUMN IF NOT EXISTS color_tag TEXT DEFAULT NULL;
