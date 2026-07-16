-- 관리자 작업 원고와 실제 공개 발행본을 분리한다.

ALTER TABLE public.public_content_articles
  ADD COLUMN IF NOT EXISTS version bigint NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS published_revision_id bigint,
  ADD COLUMN IF NOT EXISTS created_by uuid,
  ADD COLUMN IF NOT EXISTS updated_by uuid;

CREATE TABLE IF NOT EXISTS public.public_content_article_revisions (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  article_id bigint NOT NULL REFERENCES public.public_content_articles(id) ON DELETE CASCADE,
  revision_number integer NOT NULL,
  channel varchar(20) NOT NULL,
  service_key varchar(40) NOT NULL,
  category varchar(40) NOT NULL,
  slug varchar(240) NOT NULL,
  title varchar(160) NOT NULL,
  description varchar(240) NOT NULL,
  summary varchar(320) NOT NULL,
  canonical_url varchar(2048) NOT NULL,
  reading_minutes integer NOT NULL,
  body_format varchar(40) NOT NULL,
  body_markdown text NOT NULL,
  visibility varchar(20) NOT NULL,
  noindex boolean NOT NULL,
  meta_title varchar(180),
  meta_description varchar(260),
  og_image_url varchar(2048),
  cta_label varchar(80),
  cta_href varchar(2048),
  author_key varchar(80) NOT NULL,
  source_repo varchar(160),
  source_paths jsonb NOT NULL DEFAULT '[]'::jsonb,
  redirect_to varchar(2048),
  published_at timestamptz NOT NULL,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT public_content_article_revisions_number_check
    CHECK (revision_number > 0),
  CONSTRAINT public_content_article_revisions_body_format_check
    CHECK (body_format = 'markdown'),
  CONSTRAINT public_content_article_revisions_visibility_check
    CHECK (visibility IN ('public', 'unlisted', 'internal')),
  CONSTRAINT public_content_article_revisions_source_paths_check
    CHECK (jsonb_typeof(source_paths) = 'array'),
  CONSTRAINT public_content_article_revisions_article_number_uidx
    UNIQUE (article_id, revision_number)
);

-- V15에서 허용했던 portable_text 원고는 들여쓰기 코드 블록으로 보존해
-- Markdown 전용 관리자/공개 렌더러에서도 데이터 손실 없이 읽을 수 있게 한다.
UPDATE public.public_content_articles
SET body_format = 'markdown',
    body_markdown = '## 이전 Portable Text 원문' || E'\n\n    ' ||
      replace(body_markdown, E'\n', E'\n    ')
WHERE body_format = 'portable_text';

INSERT INTO public.public_content_article_revisions (
  article_id,
  revision_number,
  channel,
  service_key,
  category,
  slug,
  title,
  description,
  summary,
  canonical_url,
  reading_minutes,
  body_format,
  body_markdown,
  visibility,
  noindex,
  meta_title,
  meta_description,
  og_image_url,
  cta_label,
  cta_href,
  author_key,
  source_repo,
  source_paths,
  redirect_to,
  published_at,
  created_by,
  created_at
)
SELECT
  article.id,
  1,
  article.channel,
  article.service_key,
  article.category,
  article.slug,
  article.title,
  article.description,
  article.summary,
  article.canonical_url,
  article.reading_minutes,
  article.body_format,
  article.body_markdown,
  article.visibility,
  article.noindex,
  article.meta_title,
  article.meta_description,
  article.og_image_url,
  article.cta_label,
  article.cta_href,
  article.author_key,
  article.source_repo,
  article.source_paths,
  article.redirect_to,
  article.published_at,
  article.updated_by,
  article.updated_at
FROM public.public_content_articles article
WHERE article.status = 'published'
  AND article.published_at IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM public.public_content_article_revisions revision
    WHERE revision.article_id = article.id
  );

UPDATE public.public_content_articles article
SET published_revision_id = revision.id
FROM public.public_content_article_revisions revision
WHERE revision.article_id = article.id
  AND revision.revision_number = 1
  AND article.published_revision_id IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'public_content_articles_published_revision_fk'
  ) THEN
    ALTER TABLE public.public_content_articles
      ADD CONSTRAINT public_content_articles_published_revision_fk
      FOREIGN KEY (published_revision_id)
      REFERENCES public.public_content_article_revisions(id)
      ON DELETE SET NULL;
  END IF;
END
$$;

DROP INDEX IF EXISTS public.public_content_articles_public_read_idx;

CREATE INDEX IF NOT EXISTS public_content_articles_published_revision_idx
  ON public.public_content_articles(published_revision_id, status)
  WHERE published_revision_id IS NOT NULL AND status <> 'archived';

CREATE INDEX IF NOT EXISTS public_content_article_revisions_article_idx
  ON public.public_content_article_revisions(article_id, revision_number DESC);
