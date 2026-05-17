# 음성통화 런타임 플래그 복구

## 목표

- 컨테이너 env에 `NEXT_PUBLIC_ENABLE_ROOM_VOICE_CALL=true`가 있어도 UI가 꺼짐으로 표시되는 문제 해결.

## 확인한 원인

- `use-room-voice-call.ts`가 client bundle에서 `process.env.NEXT_PUBLIC_ENABLE_ROOM_VOICE_CALL`를 직접 읽는다.
- `NEXT_PUBLIC_*` 값은 Next.js 빌드 시점에 클라이언트 번들로 인라인되므로 운영 컨테이너 런타임 env를 나중에 넣어도 기존 번들이 true로 바뀌지 않는다.
- Docker build workflow는 `NEXT_PUBLIC_RACE_SERVER_URL`만 build-arg로 넘기고 음성통화 플래그는 넘기지 않는다.

## 계획

1. web route handler에서 런타임 env 기반 음성통화 설정을 반환한다.
2. 클라이언트 hook이 해당 설정을 받아 feature flag를 결정한다.
3. compose/dev-all env 전달을 보강한다.
4. web/race-shared/race-server typecheck 또는 관련 검증을 수행한다.

## 변경 결과

- `/api/v1/room-voice-call-config` route handler를 추가해 서버 런타임 env의 음성통화 활성화 값을 반환한다.
- `useRoomVoiceCall`은 빌드타임 `NEXT_PUBLIC_*` 값만 보지 않고 TanStack Query로 런타임 설정을 조회한다.
- 설정 조회 중에는 꺼짐 문구 대신 확인 중 문구를 표시한다.
- `compose.dev.yml`, `compose.prod.yml`, `scripts/dev-all.mjs`, `.env.example`에 음성통화 플래그 전달을 보강했다.

## 검증

- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `node --check scripts/dev-all.mjs` 통과
- `git diff --check` 통과
- `pnpm --filter @yeon/web build` 통과
