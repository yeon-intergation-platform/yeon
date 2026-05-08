# typing speed metric fix 작업 로그

- 시작: 05:30
- 종료: 05:39
- 목표: 한국어/영어 타자속도 계산 기준을 분리하고 솔로/멀티/서버 결과를 같은 기준으로 맞춘 뒤 PR(main)까지 머지한다.
- 범위:
  - `apps/web/src/features/typing-service/**`
  - `packages/race-shared/**`
  - `packages/typing-race-engine/**`
  - `apps/race-server/**`
  - `docs/product/backlog/typing-race.md`
- 외부 근거:
  - 한컴타자 공지: 한글은 자소 단위 타수로 계산
  - English typing test 표준: WPM = (characters / 5) / minutes
- 수행 내용:
  1. `@yeon/race-shared`에 속도 기준 helper를 추가해 한국어는 자소 기반 CPM, 영어는 5글자 기준 WPM으로 분리했다.
  2. solo/multiplayer 클라이언트에서 `displaySpeed`, `displayUnit`, `typedUnitCount`를 공통 helper 기준으로 계산하도록 맞췄다.
  3. race-server에서 progress clamp를 prompt 글자수 추정이 아니라 `typedUnitCount` 우선 기준으로 바꾸고, ko/en에 맞는 `wpm`/`타수` 스냅샷을 내려주게 정리했다.
  4. typing-race-engine이 완주 레인 표시에서 `lane.wpm` 대신 `displaySpeed`를 우선 사용하도록 수정했다.
  5. 공용/shared 및 web 테스트를 추가해 자소 수 계산과 WPM 변환을 고정했다.
- 검증:
  - `git diff --check`
  - `pnpm --filter @yeon/race-shared test`
  - `pnpm --filter @yeon/web exec vitest run src/features/typing-service/race-metrics.test.ts`
  - `pnpm --filter @yeon/race-server typecheck`
  - `pnpm --filter @yeon/typing-race-engine typecheck`
  - `pnpm --filter @yeon/web lint`
  - `pnpm --filter @yeon/web typecheck`
  - `pnpm --filter @yeon/race-server lint`
  - `pnpm --filter @yeon/race-shared lint`
  - `pnpm --filter @yeon/typing-race-engine lint`
  - `pnpm --filter @yeon/web build`
- 메모:
  - web build가 `registry.generated.ts`를 다시 생성했지만 최종 diff에서는 원복해 작업 범위를 속도 계산 수정에만 맞췄다.
