# Search Console 공개 콘텐츠 대상 갱신

## 목표

- `support`, `news`, `blog`, `discord-ai` host를 Search Console 운영 대상에 포함한다.
- sitemap 제출 대상과 API 실행 절차를 문서와 스크립트에 남긴다.

## 범위

- Search Console 운영 문서
- web workspace 실행 스크립트
- dry-run 검증

## 제외

- 실제 Google API 제출 실행
- credential 출력
- discord-assitant 저장소 sitemap 구현

## 진행

- Search Console 운영 문서에 `support`, `news`, `blog`, `discord-ai` URL-prefix와 sitemap 제출 대상을 추가
- Google API 실행 기준과 credential 조건을 문서화
- `/admin/content` 1차 읽기 전용 정책을 공개 콘텐츠 정책 문서와 동기화
- `apps/web` dry-run 우선 sitemap 제출 스크립트 추가

## 검증

- `pnpm --filter @yeon/web search-console:sitemaps`
- `node --check apps/web/scripts/submit-search-console-sitemaps.mjs`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`
