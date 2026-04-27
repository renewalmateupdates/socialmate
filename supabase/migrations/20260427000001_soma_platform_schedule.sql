-- Per-platform schedule config for SOMA projects
-- Shape: { "bluesky": { "posts_per_day": 2, "days": [1,2,3,4,5] }, "twitter": { ... } }
-- days array: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
ALTER TABLE soma_projects
  ADD COLUMN IF NOT EXISTS platform_schedule JSONB DEFAULT NULL;
