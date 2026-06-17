# 63. public content release ops

- 시작: 2026-06-17 20:27 KST
- 범위: 500단계 계획 19차 451~475
- 목표: 공개 콘텐츠 배포 전/후 검증과 PR/main 운영 반영 절차를 공식 runbook과 작업 증거로 고정한다.
- 제약: 장시간 GitHub Actions/배포 완료 polling은 하지 않고, main merge와 base 동기화까지만 확인한다.
- 종료: 2026-06-17 20:32 KST

## 변경

- `docs/deployment/public-content-release-readiness.md`를 추가해 공개 콘텐츠 main 반영 전 branch/PR, change impact gate, Playwright smoke, release evidence 기준을 공식화했다.
- `docs/deployment/README.md`에 release readiness 문서 링크를 추가했다.
- Playwright smoke 중 발견한 content subdomain rewrite 재진입 문제를 `apps/web/src/proxy.ts`에서 내부 rewrite marker header로 차단했다.
- proxy 단위 테스트를 추가해 내부 rewrite pass가 legacy redirect를 다시 만들지 않는지 고정했다.
- 500단계 계획 451~475를 완료 처리했다.

## 검증

- `pnpm --filter @yeon/web exec vitest run src/__tests__/proxy-subdomain-routing.test.ts src/lib/__tests__/subdomain-routing.test.ts` 통과: 2 files, 13 tests.
- `pnpm --filter @yeon/web exec playwright test e2e/public-content-smoke.spec.ts --project=chromium` 1차 실패: content subdomain rewrite 재진입으로 support/blog root 308, news root가 `/news/news`로 잘못 rewrite됨.
- proxy marker 수정 후 같은 Playwright smoke 재실행 통과: 23 tests.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/web public-content:audit` 통과: 61개 공개 콘텐츠 글 OK.
- `pnpm --filter @yeon/web build` 통과: 249 pages.
- `git diff --check` 통과.
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과.
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only` 통과.

## N/A

- DB migration 변경 없음.
- API contract 변경 없음.
- backend 변경 없음.
- Universal UI 공유 개념 변경 없음.
