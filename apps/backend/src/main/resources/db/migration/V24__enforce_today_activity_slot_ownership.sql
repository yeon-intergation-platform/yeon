ALTER TABLE public.today_activity_types
  ADD CONSTRAINT today_activity_types_owner_id_unique
  UNIQUE (owner_user_id, id);

ALTER TABLE public.today_activity_slots
  ADD CONSTRAINT today_activity_slots_owner_activity_type_fkey
  FOREIGN KEY (owner_user_id, activity_type_id)
  REFERENCES public.today_activity_types(owner_user_id, id);
