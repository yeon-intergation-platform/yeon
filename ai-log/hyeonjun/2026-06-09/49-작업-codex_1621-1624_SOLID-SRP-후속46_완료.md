# SOLID SRP 후속 46 — 모바일 카드방 화면 큰 파일 책임 분리

## 목표

- 백로그 201번: `CardRoomScreen` 큰 파일에서 렌더링 섹션과 스타일 책임을 분리한다.
- 202번에서 상태/부수효과 hook 분리를 이어갈 수 있게 경계를 만든다.

## 진행

- 작업 워크트리 `yeon-4`를 `origin/main` 기준 `codex/solid-exception-followup-46`으로 초기화했다.
- 대상 파일 `apps/mobile/src/features/card-service/rooms/card-room-screen.tsx` 확인 완료.

## 변경

- `CardRoomScreen`의 헤더/참가자/대기 컨트롤/학습 카드/완료 패널/채팅 UI를 `card-room-screen-sections.tsx`로 분리했다.
- styles 객체를 `card-room-screen-styles.ts`로 분리했다.
- 채팅 표시 정규화 helper도 채팅 섹션 내부로 이동해 렌더링 책임 가까이에 배치했다.
- 백로그 201번을 완료 처리했다.

## 검증

- `CI=true pnpm --filter @yeon/mobile lint`
- `CI=true pnpm --filter @yeon/mobile typecheck`
- `CI=true pnpm verify:parity`
- `git diff --check`
- 진행률 스크립트: 300개 중 184개 완료.
- 라인 수: `card-room-screen.tsx` 254라인, `card-room-screen-sections.tsx` 317라인, `card-room-screen-styles.ts` 219라인.
