-- Atomic AI credit deduction (Jul 26, 2026)
-- ----------------------------------------------------------------------------
-- The 7 AI routes each did a read-modify-write on user_settings credits
-- (SELECT balances -> compute split -> UPDATE). Two concurrent requests from the
-- same user could both read the same balance and both deduct, i.e. double-spend.
-- These functions move the check-and-deduct into a single row-locked transaction.
--
-- SECURITY INVOKER (default): the routes call this with the user's own token, so
-- RLS on user_settings scopes every read/write to the caller's own row. Passing
-- another user's id returns { ok:false } because RLS hides the row.
--
-- deduct_ai_credits mirrors the exact TS pool logic it replaces:
--   monthly pool = COALESCE(monthly_credits_remaining, ai_credits_remaining, 0)
--   preference order: monthly_first (default) | earned_first | paid_first
--   legacy ai_credits_remaining is decremented by cost (kept for old accounts
--   whose monthly_credits_remaining is still NULL and falls back to it).
-- Returns jsonb: { ok, monthly_deduct, earned_deduct, paid_deduct, new_total }
--          or   { ok:false, reason:'insufficient'|'no_settings', total }
-- Idempotent to install: safe to re-run.

CREATE OR REPLACE FUNCTION public.deduct_ai_credits(
  p_user_id uuid,
  p_cost    integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_monthly_raw integer;
  v_monthly     integer;
  v_earned      integer;
  v_paid        integer;
  v_legacy      integer;
  v_pref        text;
  v_total       integer;
  v_remaining   integer;
  v_m_take      integer := 0;
  v_e_take      integer := 0;
  v_p_take      integer := 0;
BEGIN
  -- Lock the row so concurrent deductions serialize (kills the double-spend race).
  SELECT monthly_credits_remaining,
         COALESCE(monthly_credits_remaining, ai_credits_remaining, 0),
         COALESCE(earned_credits, 0),
         COALESCE(paid_credits, 0),
         COALESCE(ai_credits_remaining, 0),
         COALESCE(credit_source_preference, 'monthly_first')
    INTO v_monthly_raw, v_monthly, v_earned, v_paid, v_legacy, v_pref
    FROM user_settings
   WHERE user_id = p_user_id
   FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'no_settings', 'total', 0);
  END IF;

  v_total := v_monthly + v_earned + v_paid;
  IF v_total < p_cost THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'insufficient', 'total', v_total);
  END IF;

  v_remaining := p_cost;
  IF v_pref = 'earned_first' THEN
    v_e_take := LEAST(v_remaining, v_earned);  v_remaining := v_remaining - v_e_take;
    v_m_take := LEAST(v_remaining, v_monthly); v_remaining := v_remaining - v_m_take;
    v_p_take := LEAST(v_remaining, v_paid);    v_remaining := v_remaining - v_p_take;
  ELSIF v_pref = 'paid_first' THEN
    v_p_take := LEAST(v_remaining, v_paid);    v_remaining := v_remaining - v_p_take;
    v_m_take := LEAST(v_remaining, v_monthly); v_remaining := v_remaining - v_m_take;
    v_e_take := LEAST(v_remaining, v_earned);  v_remaining := v_remaining - v_e_take;
  ELSE -- monthly_first (default)
    v_m_take := LEAST(v_remaining, v_monthly); v_remaining := v_remaining - v_m_take;
    v_e_take := LEAST(v_remaining, v_earned);  v_remaining := v_remaining - v_e_take;
    v_p_take := LEAST(v_remaining, v_paid);    v_remaining := v_remaining - v_p_take;
  END IF;

  UPDATE user_settings
     SET ai_credits_remaining      = GREATEST(0, v_legacy - p_cost),
         monthly_credits_remaining = CASE WHEN v_monthly_raw IS NOT NULL
                                          THEN v_monthly - v_m_take
                                          ELSE monthly_credits_remaining END,
         earned_credits            = v_earned - v_e_take,
         paid_credits              = v_paid - v_p_take
   WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'ok', true,
    'monthly_deduct', v_m_take,
    'earned_deduct',  v_e_take,
    'paid_deduct',    v_p_take,
    'new_monthly',    v_monthly - v_m_take,
    'new_earned',     v_earned - v_e_take,
    'new_paid',       v_paid - v_p_take,
    'new_total',      v_total - p_cost
  );
END;
$$;

-- Add credits back (used when the AI call fails after a successful deduction).
CREATE OR REPLACE FUNCTION public.refund_ai_credits(
  p_user_id uuid,
  p_monthly integer,
  p_earned  integer,
  p_paid    integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  UPDATE user_settings
     SET ai_credits_remaining      = COALESCE(ai_credits_remaining, 0) + p_monthly + p_earned + p_paid,
         monthly_credits_remaining = CASE WHEN monthly_credits_remaining IS NOT NULL
                                          THEN monthly_credits_remaining + p_monthly
                                          ELSE monthly_credits_remaining END,
         earned_credits            = COALESCE(earned_credits, 0) + p_earned,
         paid_credits              = COALESCE(paid_credits, 0) + p_paid
   WHERE user_id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.deduct_ai_credits(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.refund_ai_credits(uuid, integer, integer, integer) TO authenticated;
