# 타자 레이스 랜덤 문장 보장 작업

## 목표

타자방 생성/시작, 바로 레이스 진입 모두 매 게임 선택 덱에서 랜덤 문장을 사용하게 한다.

## 원인 후보

- `/typing-service/race` quick joinOrCreate는 raceSeed 없이 room을 만들며 race-server fallback 고정 문장을 사용한다.
- `/typing-service/rooms/new`는 `selectedDeckId` query가 없으면 seed를 만들지 않고 fallback에 의존한다.

## 진행

- 백로그 작성 완료.
- quick race seed 주입 및 room create seed 생성 조건 수정 예정.

## 변경

- 바로 레이스 quick room 생성에도 선택 덱 race seed를 포함하도록 web 연결 옵션을 확장했다.
- 타자방 생성 시 `selectedDeckId` query가 없어도 현재 선택 덱 기준으로 race seed를 만든다.
- race-server가 로컬 기본 덱의 unsigned default seed를 fallback으로 버리지 않도록 허용했다.
- 그래도 seed가 없거나 무효한 최후 fallback은 고정 1문장이 아니라 언어별 fallback 목록에서 room 생성 시 무작위 선택한다.

## 검증

- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/race-server typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/race-server lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
