update public.public_content_articles
set meta_description = description
where meta_description is null
   or btrim(meta_description) = '';

update public.public_content_articles
set source_repo = coalesce(nullif(btrim(source_repo), ''), 'yeon'),
    source_paths = '["apps/backend/src/main/resources/public-content/articles.json"]'::jsonb
where source_paths is null
   or source_paths = '[]'::jsonb;
