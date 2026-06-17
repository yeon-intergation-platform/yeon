# 작업 로그: support FAQ와 해결 단계 구조

## 목표

`docs/product/backlog/2026-06-17-public-content-network-500-step-plan.md`의 199번, 200번을 진행한다. FAQ는 색인 가능한 heading 구조를 우선하고, support 글 첫 화면에서는 기능 설명보다 실제 해결 단계가 먼저 보이게 한다.

## 범위

- 공개 콘텐츠 support article body 구조
- support 주요 확인 항목 파생 모델
- support article detail UI
- 공개 콘텐츠 품질 audit
- 단위 테스트

## 제외

- accordion UI 추가
- CMS 편집 기능
- news/blog 디자인 시스템 변경
- 상담 워크스페이스 콘텐츠

## 변경

- support FAQ heading 구조 검증 함수를 추가했다.
- support 글의 첫 `steps` 또는 `checklist`에서 주요 확인 항목을 최대 3개 파생한다.
- article detail에서 support 주요 확인 항목을 본문 위에 노출한다.
- heading이 없던 NEXA FAQ 글에 색인 가능한 heading block을 추가했다.
- audit에서 support FAQ heading 구조와 action block 존재를 검증한다.

## 검증

- `pnpm --filter @yeon/web exec vitest run src/features/public-content/public-content-support-action-summary.test.ts src/features/public-content/public-content-data.test.ts` 통과: 8 tests
- `pnpm --filter @yeon/web public-content:audit` 통과: 36개 공개 콘텐츠 글 검사
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과: 213 static pages
- `git diff --check` 통과
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only` 통과
- Playwright `/support/nexa/troubleshooting/bot-not-responding`, `/support/nexa/faq/updates-notices` desktop/mobile 확인
  - horizontal overflow 없음
  - `먼저 확인할 것`이 article body보다 먼저 렌더링됨
  - FAQ 글에 `채널별 확인 위치`, `확인 순서` heading 노출
