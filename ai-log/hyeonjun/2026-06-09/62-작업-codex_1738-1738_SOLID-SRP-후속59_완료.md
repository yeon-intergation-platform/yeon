# SOLID SRP 후속 59 — 카드방 화면 렌더 섹션 분리

## 목표

- 백로그 214번: `CardRoomScreen` 긴 함수의 렌더링 책임을 작은 섹션 컴포넌트로 분리한다.

## 진행

- card-service SSOT 확인 완료.
- nextjs-patterns wrapper 확인: `.claude/commands/nextjs-patterns.md`는 현재 worktree에 없어 적용 가능한 범위에서 클라이언트 컴포넌트 기준을 유지했다.
- 카드방 화면의 오류 표시, 모바일 탭, 좌측 패널, workspace 레이아웃을 `card-room-screen-parts.tsx`로 분리했다.

## 검증 예정

- `CI=true pnpm --filter @yeon/web lint`
- `CI=true pnpm --filter @yeon/web typecheck`
- `git diff --check`

## 변경

- `CardRoomScreen`의 오류 메시지, 모바일 탭, 좌측 패널, workspace 렌더링을 `card-room-screen-parts.tsx`로 이동했다.
- 화면 본체는 `CardRoomHeader`, `CardRoomScreenError`, `CardRoomScreenWorkspace` 조립만 담당하게 축소했다.
- 모바일 tab 옵션을 `CARD_ROOM_SCREEN_MOBILE_TABS` 상수로 분리했다.
- SOLID/예외 백로그 214번을 완료 처리했다.

## 검증

- `CI=true pnpm --filter @yeon/web lint`
- `CI=true pnpm --filter @yeon/web typecheck`
- `git diff --check`
- 진행도 확인: 197/300 완료, 다음 순차 항목 215
