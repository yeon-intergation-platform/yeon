# MoodDesk Study Desk 구현 작업 로그

## 목표

- MoodDesk를 마음 저널 정적 프로토타입에서 카드 학습 뽀모도로 작업대로 전환한다.
- `/card-service/study-desk`에서 덱 직접 선택, 25분 세션, 기존 card review 저장, 세션 요약까지 동작하게 한다.
- todo는 1차에서 관리 원천으로만 두고 Study Desk 진입 링크와 돌아가기 링크만 제공한다.

## 범위

- `docs/product/backlog/2026-06-30-mooddesk-study-desk.md`
- `apps/web/src/app/card-service/study-desk/page.tsx`
- `apps/web/src/features/focus-desk/**`
- `apps/web/src/features/card-service/index.ts`
- `apps/web/src/features/card-service/components/deck-detail-header.tsx`
- `apps/web/src/features/card-service/hooks/card-deck-detail-cache.ts`
- `apps/web/src/features/card-service/hooks/use-card-mutations.ts`
- `apps/web/src/features/card-service/hooks/use-card-mutations.test.ts`
- `apps/web/src/features/todo-service/todo-service-screen.tsx`
- `apps/web/src/lib/study-desk-links.ts`
- `apps/web/src/lib/__tests__/study-desk-links.test.ts`
- `apps/web/src/lib/platform-services.ts`
- `packages/ui/src/runtime/ports/routes.ts`

## 설계 판단

- Study Desk는 card-service 안에 둔다. card의 게스트/인증 repository와 review 저장 흐름을 재사용하기 위해서다.
- MoodDesk는 덱/카드의 원천을 소유하지 않는다. 덱 선택 후 세션 실행만 담당한다.
- 세션 복구가 필요한 선택 상태는 URL query에 둔다. 카드 뒤집힘, 타이머 running 상태, 요약 패널은 memory/local UI 상태로 둔다.
- todo 연동은 1차에서 `todoTaskId`/`todoTitle` query 표시, todo 화면의 Study Desk 진입 버튼, host-aware Today 돌아가기 CTA까지만 한다.
- 카드 큐 완료는 세션 종료와 분리한다. 마지막 카드를 봐도 남은 타이머가 끝나거나 사용자가 명시적으로 종료할 때 요약으로 간다.
- 실행 중 큐는 세션 시작 시점의 스냅샷으로 고정한다. review 저장으로 deck detail cache가 갱신되어도 현재 세션에는 새 카드가 끼어들지 않고, 다음 재시작 때 최신 cache로 새 큐를 만든다.
- Study Desk review 저장은 기존 card repository를 쓰되, 성공 결과 item을 deck detail query cache에 부분 치환해 다음 큐 계산의 원천을 최신화한다. 기존 일반 카드 play 화면의 no-invalidate 정책은 유지한다.

## 검증 계획

- `pnpm --filter @yeon/web exec vitest run src/features/focus-desk/focus-desk-session.test.ts`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `pnpm verify:parity`
- `git diff --check`
- Playwright: todo 작업대 버튼 → `/card-service/study-desk` 이동 → 덱 선택 → 25분 세션 시작 → 정답 보기 → 어려움 저장 → 큐 완료 상태 → 요약 화면 → Today 복귀 링크 확인

## 진행

- 작업 시작: 2026-06-30 20:04 KST
- `/card-service/study-desk` route shell과 `focus-desk` feature를 추가했다.
- 플랫폼 서비스 registry의 `mooddesk`를 `/card-service/study-desk` / `https://card.yeon.world/study-desk`로 전환했다.
- 카드 덱 상세에서 25분 집중 작업대 CTA와 기존 일반 학습 CTA를 분리했다.
- todo task 카드와 지금 할 일 패널에서 Study Desk 진입 버튼을 추가했다. todo 상태는 자동 변경하지 않는다.
- route SSOT에 `cardStudyDesk`를 추가했다.
- todo/card 운영 subdomain 왕복 URL을 공용 Study Desk 링크 헬퍼로 통일했다.
- running 중에는 설정 패널 대신 덱/타이머/큐 진행률 중심 패널을 보여주도록 바꿨다.
- 큐 완료 패널에 남은 집중 시간을 쓰는 3단계 정리 루틴을 추가했다.
- 요약 상태의 상단 카드가 `0:00`/재시작 CTA로 요약과 경쟁하지 않도록 `세션 상태 / 완료` 요약 카드로 바꿨다.
- 긴 todo 제목과 덱 제목이 모바일에서 화면을 밀지 않도록 truncate/break-words를 추가했다.
- 모바일 grid를 `minmax(0,1fr)`로 고정해 390px viewport에서 horizontal overflow가 생기지 않게 했다.

## 검증 결과

- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm verify:parity` 통과.
- `pnpm vitest run apps/web/src/features/focus-desk/focus-desk-session.test.ts apps/web/src/lib/__tests__/platform-services.test.ts apps/web/src/lib/__tests__/study-desk-links.test.ts apps/web/src/features/card-service/hooks/use-card-mutations.test.ts` 통과. 4개 파일, 14개 테스트.
- `git diff --check` 통과.
- Playwright smoke 통과: todo task의 작업대 버튼 → `todoTaskId`/`todoTitle`/`minutes=25`/`mode=review` 포함 Study Desk 이동 → 덱 선택 → 25분 타이머 시작 → 정답 보기 → 쉬움 저장 → 큐 완료 상태에서 타이머 25:00 유지 → 요약 → Today 복귀 href `/todo-service?todoTaskId=pw-task-1` 확인.
- Playwright cache 회귀 확인: 2장 덱에서 시작 큐는 hard 1장, review 저장 뒤 현재 세션 큐는 완료 상태로 유지되고, 요약/다음 시작 기준 큐는 updated cache로 `2/2` 재계산됨.
- Playwright IndexedDB 확인: `pw-card-1.reviewDifficulty === "easy"` 및 `lastReviewedAt` 저장 확인.
- Playwright 모바일 390px 확인: `innerWidth=390`, `documentElement.scrollWidth=390`, `body.scrollWidth=390`.

## 멀티에이전트 재평가

- 구현 검증: 92/100, PASS. 남은 지적은 작업 로그 파일명이 `작업중`인 메타데이터 문제뿐이어서 본 파일을 `완료`로 전환했다.
- UX/디자인: 92/100. queue 완료, summary focus, 모바일 overflow, 긴 todo 제목 처리가 통과했다.
- 코드 리뷰: 94/100, APPROVE. review cache 갱신과 session queue snapshot 보강 뒤 추가 blocking finding 없음.

## ship 절차 확인

- `.codex/skills/SHARED/git-pr-workflow/SKILL.md`와 `.codex/skills/SHARED/ship/SKILL.md`는 각각 `.claude/commands/git-pr-workflow.md`, `.claude/commands/ship.md`를 SSOT로 지정한다.
- 현재 체크아웃에서 두 `.claude/commands/*` 경로는 symlink이지만 대상 `.claude/skills/git-pr-workflow.md`, `.claude/skills/ship.md`가 없어 직접 읽을 수 없었다.
- 따라서 ship은 `AGENTS.md`의 main-only 정책과 `docs/agent-rules/deployment-versioning.md`의 `feat:` 기반 MINOR 판정 규칙을 기준으로 진행한다.

## 스크린샷

- `ai-log/hyeonjun/2026-06-30/study-desk-screenshots/after-study-desk-queue-complete-desktop.png`
- `ai-log/hyeonjun/2026-06-30/study-desk-screenshots/after-study-desk-summary-desktop.png`
- `ai-log/hyeonjun/2026-06-30/study-desk-screenshots/after-study-desk-setup-mobile.png`

## 남은 리스크

- 웹 dev 서버만 띄운 Playwright 환경에서는 기존 community chat widget의 backend 미기동 503이 dev console에 남는다. Study Desk 기능 assertion은 통과했으며, 운영/전체 dev 환경에서는 backend 기동 상태에 따른다.
