-- Real sequential thread publishing (Thread Builder) stores each part as its
-- own posts row, same as before, but now tags which part of the thread it is
-- so Queue/Calendar can eventually group them -- previously there was no way
-- to tell a thread part apart from an unrelated post.
ALTER TABLE posts ADD COLUMN IF NOT EXISTS thread_index  INTEGER;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS thread_length INTEGER;
