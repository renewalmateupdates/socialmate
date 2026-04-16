alter table enki_profiles
  add column if not exists stripe_customer_id     text,
  add column if not exists stripe_subscription_id text,
  add column if not exists cloud_runner_sub_id    text;
