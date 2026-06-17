# 공개 콘텐츠 Release Readiness

이 문서는 `support.yeon.world`, `news.yeon.world`, `blog.yeon.world` 공개 콘텐츠 변경을 `main`에 반영하기 전 확인할 기준이다. 상담 워크스페이스는 유지보수 동결 대상이므로 이 절차의 기능 범위에 넣지 않는다.

## Branch And PR

1. 최신 `origin/main`에서 새 작업 브랜치를 만든다.
2. `develop`은 base, target, 배포 경로로 쓰지 않는다.
3. 직접 `main`에 push하지 않는다.
4. 커밋 전 `git status --short --branch`로 owned file만 확인한다.
5. `git add .` 대신 변경 파일만 stage한다.
6. 커밋 메시지는 변경 대상과 의도를 담아 한국어로 쓴다.
7. PR target은 `main`으로 둔다.
8. PR body에는 실행한 검증 명령과 결과를 적는다.
9. PR/check/run 상태 polling은 GitHub API 할당 보호를 위해 8분 이상 간격을 둔다.
10. merge 후 `origin/main` 반영 여부를 한 번 확인하고, 장시간 배포 완료 polling은 하지 않는다.

## Change Impact Gates

| 변경 범위                            | 필수 확인                                                                                                                    |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| DB migration                         | backend migration 규칙을 다시 읽고 drift/rollback 위험을 확인한다.                                                           |
| `packages/api-contract`              | web/mobile 타입 영향도를 확인하고 관련 package typecheck를 실행한다.                                                         |
| web route, metadata, sitemap, robots | `pnpm --filter @yeon/web lint`, `pnpm --filter @yeon/web typecheck`, 필요한 경우 `pnpm --filter @yeon/web build`를 실행한다. |
| backend code                         | backend test 또는 build를 실행한다.                                                                                          |
| docs only                            | `git diff --check`를 실행한다.                                                                                               |
| rules/skills                         | `/opt/homebrew/bin/bash bin/sync-skills.sh --check`를 실행한다.                                                              |
| project SSOT                         | `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only`를 base `yeon` worktree에서 실행한다.                              |
| Universal UI shared concept          | `pnpm verify:parity`를 실행한다.                                                                                             |

## Public Content Smoke

Playwright 확인 전에는 dev server 중복 기동을 피한다.

1. `lsof -nP -iTCP:3000 -iTCP:3001 -iTCP:3002 -iTCP:8000 -iTCP:8081 -iTCP:8082 -iTCP:8083 -iTCP:2567 -sTCP:LISTEN`으로 기존 프로세스를 확인한다.
2. 필요한 web dev server가 없을 때만 `pnpm --filter @yeon/web dev -- --hostname 127.0.0.1 --port 3000`을 실행한다.
3. `pnpm --filter @yeon/web exec playwright test e2e/public-content-smoke.spec.ts --project=chromium`을 실행한다.
4. smoke는 세 host 홈과 대표 글 3개, host rewrite, robots, sitemap, canonical, metadata, JSON-LD, mobile overflow, keyboard focus, color contrast, GA4 CTA event를 확인한다.
5. 실패하면 원인을 고치고 같은 smoke가 통과하기 전까지 완료 보고하지 않는다.

## Release Evidence

각 release 작업 로그에는 아래 항목을 남긴다.

- 시작 branch와 base commit.
- DB migration/API contract/backend/Universal UI 변경 여부와 해당 검증이 N/A인 이유.
- web lint/typecheck/build 또는 생략 이유.
- Playwright smoke 결과.
- docs/skills/SSOT 검사 결과.
- commit, PR 번호, merge commit.
- merge 후 main 반영 확인.
