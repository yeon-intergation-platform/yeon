# SOLID SRP 후속 58 — 카드방 화면 상태 훅 분리

## 목표

- 백로그 213번: `CardRoomScreen`의 데이터/폼/이벤트 hook 책임을 분리한다.

## 진행

- card-service SSOT 확인 완료.
- nextjs-patterns wrapper 확인: `.claude/commands/nextjs-patterns.md`는 현재 worktree에 없어 적용 가능한 범위에서 클라이언트 컴포넌트 기준을 유지했다.
- 카드방 화면의 프로필/참가자 세션/입장 join/연결/voice call/채팅 draft/파생 상태를 `use-card-room-screen-state.ts`로 분리했다.

## 검증 예정

- `CI=true pnpm --filter @yeon/web lint`
- `CI=true pnpm --filter @yeon/web typecheck`
- `git diff --check`

## 변경

- `CardRoomScreen`에서 프로필/세션/자동 입장/connection/voice call/chat draft hook 책임을 제거하고 `useCardRoomScreenState`로 모았다.
- 참가자 session key 생성/정리와 join 오류 메시지 변환을 훅 내부 helper로 분리했다.
- 시작 가능 여부, 현재 카드, 역할, 뒷면 표시 여부, 다음 이동 가능 여부를 화면 상태 훅에서 파생하도록 이동했다.
- SOLID/예외 백로그 213번을 완료 처리했다.

## 검증

- `CI=true pnpm --filter @yeon/web lint`
- `CI=true pnpm --filter @yeon/web typecheck`
- `git diff --check`
- 진행도 확인: 196/300 완료, 다음 순차 항목 214
