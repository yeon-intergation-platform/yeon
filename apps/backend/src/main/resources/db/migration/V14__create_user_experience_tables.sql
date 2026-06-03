-- 전역 단일 경험치/레벨 도메인 1차.
-- user_experience: 유저별 누적 경험치(total_xp) SSOT.
-- experience_log: 활동별 적립 이벤트 기록 + 멱등성 가드(같은 활동/참조는 1회만 적립).

CREATE TABLE IF NOT EXISTS public.user_experience (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  total_xp bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.experience_log (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  activity_type varchar(40) NOT NULL,
  xp_amount integer NOT NULL,
  reference_id text NOT NULL,
  total_xp_after bigint NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 멱등성: 같은 (user, 활동유형, 참조) 이벤트는 1회만 적립.
CREATE UNIQUE INDEX IF NOT EXISTS experience_log_user_activity_ref_uidx
  ON public.experience_log(user_id, activity_type, reference_id);

-- 이력 조회: 유저별 최신순.
CREATE INDEX IF NOT EXISTS experience_log_user_created_idx
  ON public.experience_log(user_id, created_at DESC);
