CREATE TABLE IF NOT EXISTS public.today_tasks (
  id uuid PRIMARY KEY,
  owner_user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title varchar(200) NOT NULL,
  priority varchar(16) NOT NULL,
  estimated_minutes integer NOT NULL,
  category_label varchar(40),
  status varchar(16) NOT NULL,
  planned_date date,
  completed_at timestamptz,
  version bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT today_tasks_priority_check CHECK (priority IN ('high', 'normal', 'low')),
  CONSTRAINT today_tasks_estimated_minutes_check CHECK (estimated_minutes BETWEEN 1 AND 1440),
  CONSTRAINT today_tasks_status_check CHECK (status IN ('inbox', 'planned', 'done')),
  CONSTRAINT today_tasks_state_check CHECK (
    (status = 'inbox' AND planned_date IS NULL AND completed_at IS NULL)
    OR (status = 'planned' AND planned_date IS NOT NULL AND completed_at IS NULL)
    OR (status = 'done' AND planned_date IS NOT NULL AND completed_at IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS today_tasks_owner_date_status_idx
  ON public.today_tasks(owner_user_id, planned_date, status, created_at);
CREATE INDEX IF NOT EXISTS today_tasks_owner_status_idx
  ON public.today_tasks(owner_user_id, status, created_at);
CREATE INDEX IF NOT EXISTS today_tasks_owner_updated_idx
  ON public.today_tasks(owner_user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.today_activity_types (
  id uuid PRIMARY KEY,
  owner_user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name varchar(40) NOT NULL,
  color_token varchar(64) NOT NULL,
  icon_key varchar(40) NOT NULL,
  sort_order integer NOT NULL,
  active boolean NOT NULL DEFAULT true,
  version bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT today_activity_types_color_check CHECK (
    color_token IN ('blue', 'green', 'orange', 'purple', 'yellow', 'red', 'gray')
  ),
  CONSTRAINT today_activity_types_icon_check CHECK (
    icon_key IN ('book', 'gamepad', 'utensils', 'car', 'coffee', 'moon', 'dumbbell', 'circle')
  ),
  CONSTRAINT today_activity_types_sort_order_check CHECK (sort_order >= 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS today_activity_types_owner_name_uidx
  ON public.today_activity_types(owner_user_id, lower(btrim(name)));
CREATE INDEX IF NOT EXISTS today_activity_types_owner_order_idx
  ON public.today_activity_types(owner_user_id, active DESC, sort_order, created_at);

CREATE TABLE IF NOT EXISTS public.today_activity_slots (
  id uuid PRIMARY KEY,
  owner_user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  record_date date NOT NULL,
  hour smallint NOT NULL,
  activity_type_id uuid NOT NULL REFERENCES public.today_activity_types(id),
  note varchar(200),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT today_activity_slots_hour_check CHECK (hour BETWEEN 0 AND 23),
  CONSTRAINT today_activity_slots_owner_date_hour_unique UNIQUE (owner_user_id, record_date, hour)
);

CREATE INDEX IF NOT EXISTS today_activity_slots_owner_date_idx
  ON public.today_activity_slots(owner_user_id, record_date, hour);
CREATE INDEX IF NOT EXISTS today_activity_slots_activity_type_idx
  ON public.today_activity_slots(owner_user_id, activity_type_id, record_date DESC);
