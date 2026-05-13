# 프론트 3축 구조 리팩토링

## 목표

- 학생관리, typing-service, card-service/card-room 각각에서 남은 대형 프론트 파일을 프론트 구조 규칙에 따라 작은 feature 단위로 분리한다.
- 이미 완료된 분해를 반복하지 않는다.
- app route에는 새 product logic을 추가하지 않는다.

## 검증 예정

- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`

## 구현 결과

- 학생관리 `student-check-board-panel.tsx`의 빠른 상태 수정 UI를 `student-check-board-status-editor.tsx`로 분리했다.
- typing-service `typing-race-solo-screen.tsx`의 연습 입력/결과 UI를 `typing-race-solo-practice-panel.tsx`로 분리했다.
- card-service `deck-play-screen.tsx`의 복습 모드 카드를 `deck-play-review-mode-card.tsx`로 분리했다.
- app route에는 product logic을 추가하지 않고 각 feature 디렉터리 내부에서만 책임을 나눴다.

## 검증

- `pnpm --filter @yeon/web typecheck` 성공
- `pnpm --filter @yeon/web lint` 성공
- `pnpm --filter @yeon/web build` 성공
- `git diff --check` 성공
- `bash bin/sync-skills.sh --check` 성공
- `bash bin/verify-ssot.sh --project-only` 성공
- 구조 검색: 새 컴포넌트는 `apps/web/src/features/**`에만 존재하고 app route 중복 없음
- raw query key 검색: touched feature dirs에 신규 raw `queryKey: [` 없음

## 상태

- 완료
