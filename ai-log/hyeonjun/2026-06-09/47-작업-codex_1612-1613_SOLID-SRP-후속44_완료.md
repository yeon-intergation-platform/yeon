# SOLID SRP 후속 44 — 모바일 카드방 생성 sheet 책임 분리

## 목표

- 백로그 199번: `CardRoomCreateSheet`의 검증/변환/부수효과/선택 UI 책임을 작은 hook/section/style 파일로 분리한다.

## 진행

- 작업 워크트리 `yeon-4`를 `origin/main` 기준 `codex/solid-exception-followup-44`로 초기화했다.
- 대상 파일 `apps/mobile/src/features/card-service/rooms/card-room-create-sheet.tsx` 확인 완료.

## 변경

- `CardRoomCreateSheet`의 상태/검증/API 호출/참가자 토큰 저장/오류 표시를 `use-card-room-create-sheet-state.ts`로 이동했다.
- 덱 선택 UI와 공개범위 선택 UI를 `card-room-create-sheet-sections.tsx`로 분리했다.
- styles 객체를 `card-room-create-sheet-styles.ts`로 분리해 sheet 파일에서 스타일 책임을 제거했다.
- 백로그 199번을 완료 처리했다.

## 검증

- `CI=true pnpm --filter @yeon/mobile lint`
- `CI=true pnpm --filter @yeon/mobile typecheck`
- `CI=true pnpm verify:parity`
- `git diff --check`
- 진행률 스크립트: 300개 중 182개 완료, 다음 미완료 200번.
- 라인 수: `card-room-create-sheet.tsx` 71라인, state hook 198라인, sections 112라인, styles 69라인.
