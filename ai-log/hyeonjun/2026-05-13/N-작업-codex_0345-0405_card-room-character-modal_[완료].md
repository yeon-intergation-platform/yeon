# 카드방 캐릭터 상태 연결과 만들기 모달 전환 작업 로그

- 시작: 2026-05-13 03:45 KST
- 완료: 2026-05-13 04:05 KST
- 기준: `main` / `origin/main`
- 목표:
  - `/card-service`에서 선택한 캐릭터가 `/card-service/rooms` 오른쪽 상단에도 유지되게 한다.
  - 카드방 만들기를 별도 페이지 이동이 아닌 로비 overlay modal로 처리한다.
  - 카드방/타자방 공통 흐름은 실제 중복 확인 후 안전한 범위에서만 정리 또는 제안한다.

## 확인

- 카드 서비스 메인 프로필은 `useTypingProfile`의 `yeon:typing-profile`을 사용한다.
- 카드방 로비/생성/입장은 `useCardRoomProfile`의 `yeon-card-room-profile`을 사용해 캐릭터가 분리되어 있었다.
- 카드방 생성은 이미 `createCardRoom` → `/api/v1/card-rooms` POST body 방식이며 query string 생성 흐름은 없었다.

## 변경

- `useCardRoomProfile`이 기존 카드방 프로필을 유지하되 캐릭터는 `yeon:typing-profile`의 선택값을 우선 읽도록 연결했다.
- 로비 프로필 영역은 프로필 로드 전 임의 기본 캐릭터를 보여주지 않고 로드 후 표시한다.
- 카드방 생성 UI를 `CardRoomCreateForm`으로 재사용 가능하게 추출하고 로비 overlay modal에서 렌더링한다.
- `/card-service/rooms`의 모든 방 만들기 CTA는 페이지 이동 대신 모달을 연다.
- `/card-service/rooms/new` 페이지를 삭제해 중간 생성 페이지로 이동할 여지를 제거했다.
- 공통화는 카드방 내부 생성 폼 재사용까지만 수행했다. 타자방/카드방은 API, seed, 역할/게임 규칙이 달라 크로스 서비스 공통화는 이번 변경에서 제외했다.

## 검증

- `rg -n '/card-service/rooms/new|URLSearchParams\\(' apps/web/src/features/card-service apps/web/src/app/card-service -S || true`
  - `/card-service/rooms/new` 참조 없음. 남은 `URLSearchParams`는 덱 플레이 상태용 query 동기화뿐.
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
  - route 목록에서 `/card-service/rooms/new` 제거 확인.
