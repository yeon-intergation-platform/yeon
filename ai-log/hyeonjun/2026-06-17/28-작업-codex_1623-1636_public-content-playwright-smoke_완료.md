# 28-작업-codex_1623-public-content-playwright-smoke

## 목표

- 공개 콘텐츠 500단계 계획 중 17차 QA 항목을 Playwright smoke로 보강한다.
- 공개 URL, host canonical, sitemap URL, metadata, JSON-LD, admin toolbar 미노출, viewport overflow를 자동검증한다.

## 범위

- `apps/web/e2e/public-content-smoke.spec.ts`
- `docs/product/backlog/2026-06-17-public-content-playwright-smoke.md`

## 제외

- 상담 워크스페이스
- admin 본문 수정/삭제/발행 기능
- Search Console 실제 제출

## 검증 예정

- `pnpm --filter @yeon/web exec playwright test e2e/public-content-smoke.spec.ts --project=chromium`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `git diff --check`
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only`

## 결과

- 기존 공개 콘텐츠 smoke에 host rewrite HTML metadata 검증을 보강했다.
- 세 host sitemap의 모든 `<loc>` URL을 host header로 요청해 200과 로그인 redirect 없음까지 확인한다.
- sitemap에 `/admin/`, `/api/`, `/auth/`, `draft`가 섞이지 않는지 확인한다.
- 공개 HTML에 admin 전용 링크와 toolbar 흔적이 없는지 확인한다.
- 모바일 viewport horizontal overflow와 단일 H1 구조를 확인한다.
- 데스크톱 article 폭이 960px 이하인지 확인한다.

## 검증 결과

- `pnpm --filter @yeon/web exec eslint e2e/public-content-smoke.spec.ts` 통과
- `pnpm --filter @yeon/web exec playwright test e2e/public-content-smoke.spec.ts --project=chromium` 통과, 19개 테스트
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web public-content:audit` 통과
- `git diff --check` 통과
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only`는 linked worktree에서 프로젝트 검사를 건너뛰어 기본 `yeon` 워크트리에서 재실행했고 통과
