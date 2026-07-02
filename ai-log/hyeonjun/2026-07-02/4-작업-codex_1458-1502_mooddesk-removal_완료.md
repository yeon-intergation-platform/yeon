# MoodDesk 제거 작업 로그

## 목표

- MoodDesk/Study Desk 런타임 표면을 전부 제거한다.
- 카드 서비스와 todo 서비스에는 기존 핵심 기능만 남긴다.

## 범위

- `apps/web/public/mooddesk/**`
- `apps/web/src/app/card-service/study-desk/**`
- `apps/web/src/features/focus-desk/**`
- `apps/web/src/lib/study-desk-links.ts`
- `apps/web/src/lib/platform-services.ts`
- `apps/web/src/features/card-service/components/deck-detail-header.tsx`
- `apps/web/src/features/todo-service/todo-service-screen.tsx`
- `packages/ui/src/runtime/ports/routes.ts`
- `packages/ui/src/runtime/ports/shared.ts`
- 관련 테스트와 공식 backlog 문서

## 검증 계획

- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/ui typecheck`
- `pnpm --filter @yeon/web exec vitest run src/lib/__tests__/platform-services.test.ts src/features/public-content/public-content-data.test.ts`
- `pnpm verify:parity`
- `git diff --check`
- 필요 시 `pnpm --filter @yeon/web build`

## 진행 상태

- 완료

## 변경 결과

- 플랫폼 서비스 목록에서 `mooddesk` descriptor를 제거했다.
- 정적 `/mooddesk` 자산과 `/card-service/study-desk` 라우트를 삭제했다.
- `focus-desk` feature와 Study Desk URL 헬퍼/테스트를 삭제했다.
- 카드 덱 상세의 `25분 집중 작업대` CTA를 제거하고 기존 카드 학습 CTA만 남겼다.
- todo 보드의 Study Desk 진입 버튼과 URL 생성 로직을 제거했다.
- route SSOT에서 `cardStudyDesk`를 제거했다.
- 공식 backlog의 MoodDesk 실행/리팩터링 문서를 제거하고 공개 콘텐츠 계획의 보류 항목을 정리했다.

## 검증 결과

- `pnpm --filter @yeon/web exec vitest run src/lib/__tests__/platform-services.test.ts src/features/public-content/public-content-data.test.ts` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm verify:parity` 통과
- `git diff --check` 통과
- `pnpm --filter @yeon/web build` 통과
- `apps/`, `packages/`, 기존 `docs/`에서 MoodDesk/Study Desk/FocusDesk 잔여 참조 0건 확인
