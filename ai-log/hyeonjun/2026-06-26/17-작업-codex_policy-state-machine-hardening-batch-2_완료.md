# 작업 로그: 운영 정책·상태머신 보강 batch 2

## 범위

- 타자방 로비 상태 정책을 `race-shared` 순수 함수로 구체화.
- web 타자방 화면이 같은 정책 함수로 host, ready, team, chat, start 액션 가능 여부를 판단하게 리팩터링.

## 진행

- `packages/race-shared/src/typing-race.ts`
  - 현재 참가자 탐색, waiting/terminal 판정, 설정 변경 가능 여부, ready 토글 가능 여부, territory 팀 전환 가능 여부, 시작 가능 여부, 로비 채팅 전송 가능 여부를 정책 함수로 추가.
- `packages/race-shared/src/typing-room-policy.test.ts`
  - fallback identity 금지, waiting/terminal 판정, host-only settings/start, ready/team/chat 경계를 테스트로 고정.
- `apps/web/src/features/typing-service/typing-room-screen.tsx`
  - 직접 status 비교와 host/start/chat 분기를 shared 정책 함수 호출로 교체.
- `apps/web/src/features/typing-service/typing-room-waiting-header.tsx`
  - 시작/준비 버튼 disabled 기준을 계산된 정책 값으로 교체.

## 검증

- `pnpm --filter @yeon/race-shared test -- typing-room-policy.test.ts`
- `pnpm --filter @yeon/race-shared typecheck`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/race-shared lint`
- `pnpm --filter @yeon/web lint`
- `git diff --check`
