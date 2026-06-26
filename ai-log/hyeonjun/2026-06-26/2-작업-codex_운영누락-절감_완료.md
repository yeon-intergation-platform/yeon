# 운영 누락 절감 작업

## 목표

- 기능 변경 없이 장애/운영 누락 가능성을 줄인다.
- Search Console 제출 대상과 운영 문서의 host 목록 불일치를 자동 검증한다.

## 근거

- `apps/web/scripts/submit-search-console-sitemaps.mjs` 제출 대상은 `game.yeon.world` 포함 9개 host다.
- `docs/seo/google-search-console.md` 하단 운영 체크리스트와 월간 점검에는 여전히 8개 host 또는 `support/news/blog/discord-ai`만 언급된 잔여 불일치가 있었다.

## 작업 계획

- Search Console 제출 대상 dry-run 출력과 운영 문서를 대조하는 검증 스크립트를 추가한다.
- 운영 문서의 잔여 숫자/host 목록을 `game.yeon.world` 포함 기준으로 맞춘다.
- 문서/스크립트 검증과 web lint/typecheck를 실행한다.

## 작업

- `bin/verify-search-console-targets.mjs`를 추가해 `apps/web/scripts/submit-search-console-sitemaps.mjs` dry-run 출력의 property/sitemap 목록이 `docs/seo/google-search-console.md`에 모두 반영됐는지 확인하게 했다.
- `bin/verify-ssot.sh`에 Search Console 운영 대상 검증을 연결해 pre-commit SSOT 게이트에서 누락을 차단하게 했다.
- `docs/seo/google-search-console.md`의 월간 점검과 운영 체크리스트를 `game.yeon.world` 포함 9개 host 기준으로 정리했다.

## 검증

- `pnpm verify:search-console-targets`
- `bash bin/verify-ssot.sh --project-only`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `pnpm lint`
- `pnpm typecheck`
