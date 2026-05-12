# 타자방 만들기 중간 라우트 제거 작업 로그

- 시작: 2026-05-13 03:15 KST
- 완료: 2026-05-13 03:35 KST
- 기준: `main` / `origin/main`
- 목표: 방 만들기 모달 제출 시 `/typing-service/rooms/new?...` 중간 이동 없이 생성 성공 후 `/typing-service/rooms/{roomId}`로 한 번만 이동.

## 변경

- `apps/web/src/features/typing-service/typing-room-lobby-screen.tsx`
  - 모달 submit에서 `URLSearchParams`와 `/typing-service/rooms/new?...` 이동을 제거.
  - 선택 덱의 race seed를 준비한 뒤 기존 `useRaceRoom` 생성 경로에 object payload로 전달.
  - 생성 성공으로 `roomId`가 생긴 시점에만 `/typing-service/rooms/{roomId}`로 이동.
  - 생성 중 submit/닫기 중복 입력을 막고 실패 메시지를 모달 내부에 표시.
- `apps/web/src/app/typing-service/rooms/new/page.tsx`
  - query 기반 중간 생성 라우트를 제거.

## 검증

- `rg -n "rooms/new|/typing-service/rooms/new|URLSearchParams\(|new\?" apps/web/src/features/typing-service apps/web/src/app/typing-service -S || true`
  - 타자방 생성 중간 라우트 참조 없음. 남은 `URLSearchParams`는 typing deck 목록 조회의 `scope` 파라미터뿐.
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
  - 빌드 route 목록에서 `/typing-service/rooms/new` 제거 확인.
