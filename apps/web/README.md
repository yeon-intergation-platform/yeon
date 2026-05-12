# @yeon/web

Next.js application workspace.

## Responsibilities

- Web UI
- Thin route handlers for Spring API compatibility, auth cookie bridges, OAuth callbacks, and file/stream adapters
- Web-only server actions that do not own domain persistence or schema changes
- SEO metadata, sitemap, redirects, and browser-facing integration glue

## Internal Structure

- `src/app`: routes, layouts, `app/api`
- `src/components`: reusable web UI
- `src/features`: feature slices
- `src/server`: server-only implementation details
- `src/lib`: local helpers
- `src/types`: local types

## Backend Boundary

Spring (`apps/backend`) owns domain APIs, persistence, authorization source of truth, and DB schema changes. New DB migrations must be added as Spring Flyway migrations, not as web/Drizzle migrations. Next.js should call Spring or provide a thin browser-facing bridge only.
