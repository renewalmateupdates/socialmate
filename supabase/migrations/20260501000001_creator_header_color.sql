-- Creator page header color customization
ALTER TABLE creator_monetization
  ADD COLUMN IF NOT EXISTS header_color text DEFAULT '#F59E0B';
