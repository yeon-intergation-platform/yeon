# 타자방 만들기 overlay 모달 전환

## 목표

- 타자방 로비의 방 만들기 폼이 페이지 흐름을 밀지 않고 fixed overlay modal로 뜨게 한다.

## 범위

- `apps/web/src/features/typing-service/typing-room-lobby-screen.tsx`
- `docs/product/backlog/typing-room-create-overlay-modal-20260513.md`

## 진행

- 시작: 현황 확인, typing-service 규칙 확인, 백로그 작성 완료.
- 구현: 빈 상태 영역의 모달 open 조건부 padding 분기 제거.
- 구현: fixed inset overlay + dim backdrop + viewport 중앙 카드 + z-index 보강.
- 구현: X 버튼, dim 배경 클릭, ESC 닫기, body 스크롤 잠금 추가.
- 검증: `pnpm --filter @yeon/web lint`, `pnpm --filter @yeon/web typecheck`, `pnpm --filter @yeon/web build`, `git diff --check` 통과.
- 참고: 워킹트리에 `packages/race-shared/src/typing-race.ts` 및 lifecycle 관련 문서가 별도 변경으로 존재해 본 작업 커밋에는 포함하지 않는다.
