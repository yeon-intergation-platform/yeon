ALTER TABLE public.today_activity_slots
  ADD COLUMN IF NOT EXISTS entry_index smallint NOT NULL DEFAULT 0;

ALTER TABLE public.today_activity_slots
  DROP CONSTRAINT IF EXISTS today_activity_slots_owner_date_hour_unique;

DO $$
BEGIN
  ALTER TABLE public.today_activity_slots
    ADD CONSTRAINT today_activity_slots_entry_index_check
    CHECK (entry_index BETWEEN 0 AND 1);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS today_activity_slots_owner_date_hour_entry_uidx
  ON public.today_activity_slots(owner_user_id, record_date, hour, entry_index);
