# 온라인 타자방 2브라우저 검증 슬라이스

- 시작: 2026-05-01 11:33 KST
- 예상 종료: 2026-05-01 11:45 KST
- 담당: codex
- 상태: 완료
- 실제 종료: 2026-05-01 11:38 KST

## 목적

로컬에서 실제 `apps/web` + `apps/race-server`를 띄운 뒤 Playwright 2개 브라우저 컨텍스트로 다음 Slice를 재현한다.

1. 방장 브라우저가 공개 타자방 생성
2. 두 번째 브라우저가 초대 URL로 입장
3. 게스트 준비 → 방장 시작
4. 두 브라우저가 같은 제시문/seed를 받는지 비교
5. 진행률 브로드캐스트 확인
6. 두 브라우저 완주 후 결과 화면 확인
7. 운영 배포 후 웹/race-server health 확인

## 로컬 선행 조건

터미널 A:

```bash
pnpm --filter @yeon/race-server dev
# 기대: http://localhost:2567/health => {"ok":true,"room":"typing_race_public"}
```

터미널 B:

```bash
NEXT_PUBLIC_RACE_SERVER_URL=ws://localhost:2567 pnpm --filter @yeon/web dev
# 기대: http://localhost:3000/typing-service/rooms 접근 가능
```

> `@yeon/web dev`는 현재 Drizzle migration을 먼저 실행하므로 로컬 DB 환경이 필요하다. DB가 없는 환경에서는 실행 전 `.env.local`/Postgres를 준비한다.

## 자동화 실행

Dry syntax/gating check:

```bash
pnpm --filter @yeon/web e2e:typing-room:check
```

실제 2브라우저 온라인 검증:

```bash
RUN_TYPING_ROOM_ONLINE_E2E=1 \
RACE_SERVER_HTTP_URL=http://localhost:2567 \
NEXT_PUBLIC_RACE_SERVER_URL=ws://localhost:2567 \
pnpm --filter @yeon/web e2e:typing-room
```

성공 기준:

- race-server `/health`와 web `/typing-service/rooms`가 2브라우저 플로우 전에 2xx로 응답한다.
- 방장 화면에 `Players 1 / 2` → 게스트 입장 후 `Players 2 / 2`가 보인다.
- 게스트 `준비하기` 후 두 참여자가 `준비완료`가 된다.
- 방장 `시작하기` 후 두 브라우저의 prompt text가 동일하다.
- 방장이 절반 입력하면 방장 local progress와 게스트 화면의 방장 progress가 0%보다 커진다.
- 방장/게스트 모두 전체 prompt를 입력하면 양쪽에 `타자 대결 결과`가 보인다.

## 운영 health check

운영 배포 후 최소 smoke:

```bash
curl -fsS https://yeon.world/api/health
curl -fsS https://yeon.world/typing-service/rooms -o /tmp/yeon-typing-rooms.html
curl -fsS https://race.yeon.world/health
curl -fsS https://race.yeon.world/rooms/typing_race_public
```

운영 브라우저 smoke(실제 유저 플로우, 방 생성 포함):

```bash
RUN_TYPING_ROOM_ONLINE_E2E=1 \
RACE_SERVER_HTTP_URL=https://race.yeon.world \
NEXT_PUBLIC_RACE_SERVER_URL=wss://race.yeon.world \
pnpm --filter @yeon/web exec playwright test e2e/typing-room-online.spec.ts \
  --project=chromium --config=playwright.config.ts --base-url=https://yeon.world
```

운영 주의:

- 이 테스트는 실제 public room을 만들고 두 익명 플레이어를 접속시킨다.
- 운영 smoke는 배포 직후 짧게 실행하고, 실패 시 trace/screenshot을 보존한다.
- `https://race.yeon.world/rooms/typing_race_public`는 대기방 목록이 빈 배열이어도 정상이다.

## 변경 파일

- `apps/web/e2e/typing-room-online.spec.ts`
- `apps/web/package.json`
- 이 문서

## 검증 기록

- `pnpm --filter @yeon/web e2e:typing-room:check` → PASS, 1 skipped. Skip은 의도된 기본 게이트이며 `RUN_TYPING_ROOM_ONLINE_E2E=1` 없이는 실제 방 생성 플로우를 실행하지 않는다.
- `pnpm --filter @yeon/web exec prettier --check e2e/typing-room-online.spec.ts package.json "../../ai-log/hyeonjun/2026-05-01/8-작업-codex_1133-1138_typing-room-online-verification_[완료].md"` → PASS.
- `pnpm --filter @yeon/web exec eslint e2e/typing-room-online.spec.ts` → PASS.
- 운영 health check:
  - `curl -fsS https://yeon.world/api/health` → `{"status":"ok","service":"web",...}`
  - `curl -fsSI https://yeon.world/typing-service/rooms` → HTTP 200.
  - `curl -fsS https://race.yeon.world/health` → `{"ok":true,"room":"typing_race_public"}`
  - `curl -fsS https://race.yeon.world/rooms/typing_race_public` → `[]` (정상: 대기방 없음).
