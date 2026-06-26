# 코드 품질 원칙 위반 리팩터링 55개 - 8차 배치

## 범위

- 태스크 25: 모바일 카드 room role label mapping화.
- 태스크 26: 타자 room screen create/join mode 판정 helper화.
- 태스크 27: 타자 room screen host/guest role 판정 shared helper화.
- 태스크 28: 타자 room participant grouping 순수 함수 분리와 테스트.
- 태스크 29: 타자 room invite copy 실패 diagnostic helper화.

## 변경

- 모바일 카드 room role label과 선택 가능 role 목록을 mapping 상수로 정리했다.
- `@yeon/race-shared`에 `TYPING_ROOM_PARTICIPANT_ROLE`, host/guest role helper를 추가했다.
- `typing-room-screen-policy.ts`에 create/join mode helper, entry event name, participant ordering/slot padding, invite copy error helper를 추가했다.
- `typing-room-screen.tsx`의 raw mode/role 비교와 participant grouping 로직을 helper 재사용으로 교체했다.
- race-shared/web policy 테스트를 추가했다.

## 검증

- `pnpm --filter @yeon/race-shared test -- typing-race.test.ts`
- `pnpm --filter @yeon/web exec vitest run src/features/typing-service/typing-room-screen-policy.test.ts src/features/typing-service/typing-room-screen.test.ts`
- `pnpm --filter @yeon/race-shared typecheck`
- `pnpm --filter @yeon/race-shared lint`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/mobile typecheck`
- `pnpm --filter @yeon/mobile lint`
- `bash bin/verify-ssot.sh --project-only`
- `git diff --check`
