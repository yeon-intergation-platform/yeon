# member-tabs reset cutover

- 작업 목표: reset lane의 Spring source of truth 구현과 Next thin BFF cutover를 완료한다.
- 작업 범위: `member_tabs.reset` repository/service/controller, reset route Spring fetch 전환, direct reset dead code 삭제, backend/web/runtime 검증.
- 기준: outward auth는 Next에 유지, reset만 먼저 옮기고 fields/auth는 건드리지 않는다.
- 결과:
  - Spring `member-tabs reset` repository/service/controller 및 테스트 추가 완료
  - Next `POST /api/v1/spaces/{spaceId}/member-tabs/reset`를 Spring fetch로 전환 완료
  - `apps/web/src/server/services/member-tabs-service.ts`의 direct reset 함수 `resetSpaceTabsToDefaults` 삭제 완료
- 검증:
  - `cd apps/backend && ./gradlew test --tests '*MemberTabResetRepositoryTests'`
  - `cd apps/backend && ./gradlew test --tests '*MemberTabResetServiceTests'`
  - `cd apps/backend && ./gradlew test --tests '*MemberTabResetControllerTests'`
  - `cd apps/backend && ./gradlew test`
  - `pnpm --filter @yeon/web exec vitest run 'src/app/api/v1/spaces/[spaceId]/member-tabs/reset/__tests__/route.test.ts'`
  - `pnpm --filter @yeon/web typecheck`
  - `pnpm --filter @yeon/web build`
  - runtime smoke: `POST /spaces/space_member_tabs_reset_smoke/member-tabs/reset` → `200 {"ok":true}` + system tab restore/custom 0/field 0/other space custom 1 확인
