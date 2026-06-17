# 공개 콘텐츠 출시 후 거버넌스

## 목표

- 500단계 계획 476~500을 완료한다.
- 출시 후 Search Console/GA4/404/sitemap/품질 개선 주기를 문서화한다.
- admin dashboard에 출시 후 품질 리뷰 상태를 노출한다.

## 제약

- 상담 워크스페이스는 동결 정책을 유지한다.
- 기존 품질 체크리스트, 제목 원칙, 템플릿을 중복하지 않고 연결한다.
- GitHub API 폴링은 8분 이상 간격 원칙을 지킨다.

## 진행

- `docs/seo/public-content-post-launch-governance.md`를 추가해 출시 후 Search Console, sitemap, 404, GA4 CTA, query 기반 개선 루프를 문서화했다.
- `docs/seo/README.md`에서 출시 후 거버넌스 문서를 연결했다.
- `/admin/content` 운영 체크리스트에 `Post-launch quality review` 항목을 추가했다.
- 500단계 원장의 1~500 전체 완료 표기를 정리했다.

## 검증

- `pnpm --filter @yeon/web exec vitest run src/features/public-content/public-content-admin-model.test.ts src/features/public-content/public-content-governance-report.test.ts`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web public-content:governance-report`
- `pnpm --filter @yeon/web public-content:audit`
- `pnpm --filter @yeon/web public-content:coverage-report`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only`
