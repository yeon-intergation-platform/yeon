-- 공개 콘텐츠 CMS 저장소 1차.
-- 기본 운영은 seed store를 유지하고, PUBLIC_CONTENT_STORE=jdbc 설정에서 이 테이블을 공개 조회 원천으로 사용한다.

CREATE TABLE IF NOT EXISTS public.public_content_articles (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  channel varchar(20) NOT NULL,
  service_key varchar(40) NOT NULL,
  category varchar(40) NOT NULL,
  slug varchar(240) NOT NULL,
  title varchar(160) NOT NULL,
  description varchar(240) NOT NULL,
  summary varchar(320) NOT NULL,
  canonical_url varchar(2048) NOT NULL,
  reading_minutes integer NOT NULL,
  body_format varchar(40) NOT NULL DEFAULT 'markdown',
  body_markdown text NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'draft',
  visibility varchar(20) NOT NULL DEFAULT 'public',
  noindex boolean NOT NULL DEFAULT false,
  meta_title varchar(180),
  meta_description varchar(260),
  og_image_url varchar(2048),
  cta_label varchar(80),
  cta_href varchar(2048),
  author_key varchar(80) NOT NULL DEFAULT 'yeon',
  source_repo varchar(160),
  source_paths jsonb NOT NULL DEFAULT '[]'::jsonb,
  redirect_to varchar(2048),
  published_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT public_content_articles_channel_check
    CHECK (channel IN ('support', 'news', 'blog')),
  CONSTRAINT public_content_articles_service_key_check
    CHECK (service_key IN ('nexa', 'typing', 'card', 'community', 'account', 'yeon')),
  CONSTRAINT public_content_articles_category_check
    CHECK (category IN (
      'getting-started',
      'guides',
      'tutorials',
      'troubleshooting',
      'faq',
      'policy',
      'notice',
      'updates',
      'news',
      'engineering',
      'product',
      'devlog',
      'essay'
    )),
  CONSTRAINT public_content_articles_slug_check
    CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*(\/[a-z0-9]+(-[a-z0-9]+)*)*$'),
  CONSTRAINT public_content_articles_body_format_check
    CHECK (body_format IN ('markdown', 'portable_text')),
  CONSTRAINT public_content_articles_reading_minutes_check
    CHECK (reading_minutes > 0),
  CONSTRAINT public_content_articles_status_check
    CHECK (status IN ('draft', 'review', 'published', 'archived')),
  CONSTRAINT public_content_articles_visibility_check
    CHECK (visibility IN ('public', 'unlisted', 'internal')),
  CONSTRAINT public_content_articles_source_paths_check
    CHECK (jsonb_typeof(source_paths) = 'array')
);

CREATE UNIQUE INDEX IF NOT EXISTS public_content_articles_channel_slug_uidx
  ON public.public_content_articles(channel, slug);

CREATE INDEX IF NOT EXISTS public_content_articles_public_read_idx
  ON public.public_content_articles(channel, service_key, category, published_at DESC, slug)
  WHERE status = 'published' AND visibility = 'public' AND noindex = false;

CREATE INDEX IF NOT EXISTS public_content_articles_admin_status_idx
  ON public.public_content_articles(status, visibility, updated_at DESC);
