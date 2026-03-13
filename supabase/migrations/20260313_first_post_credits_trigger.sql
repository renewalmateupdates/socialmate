CREATE OR REPLACE FUNCTION award_first_post_credits()
RETURNS TRIGGER AS $$
DECLARE
  v_prior_posts   INTEGER;
  v_referrer_id   UUID;
BEGIN
  IF NEW.published_at IS NOT NULL AND OLD.published_at IS NULL THEN

    SELECT COUNT(*) INTO v_prior_posts
    FROM posts
    WHERE user_id     = NEW.user_id
      AND published_at IS NOT NULL
      AND id          != NEW.id;

    IF v_prior_posts = 0 THEN

      UPDATE user_settings
      SET    ai_credits_remaining = ai_credits_remaining + 10
      WHERE  user_id = NEW.user_id;

      SELECT referrer_user_id INTO v_referrer_id
      FROM   referral_conversions
      WHERE  referred_user_id = NEW.user_id
      ORDER  BY created_at ASC
      LIMIT  1;

      IF v_referrer_id IS NOT NULL THEN
        UPDATE user_settings
        SET    ai_credits_remaining = ai_credits_remaining + 10
        WHERE  user_id = v_referrer_id;
      END IF;

    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_first_post_published ON posts;

CREATE TRIGGER on_first_post_published
  AFTER UPDATE OF published_at ON posts
  FOR EACH ROW
  EXECUTE FUNCTION award_first_post_credits();