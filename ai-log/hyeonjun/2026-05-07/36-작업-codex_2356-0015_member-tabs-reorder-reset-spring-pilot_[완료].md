# member-tabs reorder reset spring pilot

- 작업 목표: `member-tabs` aggregate의 남은 bulk mutation(reorder/reset)을 다음 Spring 파일럿으로 연다.
- 작업 범위: backlog, inventory, 이후 reorder 우선 구현 판단
- 기준: Next는 outward auth/BFF 유지, Spring은 reorder/reset source of truth 담당
- 비목표: fields/auth migration 동시 진행

## 재발방지 메모

- 매 Ralph 반복에는 반드시 `Spring 이전 -> Next 기존 구현 제거/축소 -> 연동 검증` 세트가 함께 들어가야 한다.
- member-tabs write(create/update/delete)는 이미 Spring cutover 완료이므로 다음 cycle부터는 reorder/reset만 다룬다.

- `docs/architecture/spring-member-tabs-reorder-reset-pilot-inventory.md`로 reorder/reset의 route, bulk mutation 규칙, reset cascade 부작용 범위를 고정했다.

- `docs/architecture/spring-member-tabs-reorder-package-plan.md`로 reorder lane의 controller/service/repository/dto 경계와 transaction 책임을 고정했다.

- `docs/architecture/spring-member-tabs-reorder-api-contract.md`로 reorder endpoint, request/response, error shape, Next BFF translation 규칙을 고정했다.

- `docs/architecture/spring-member-tabs-reorder-skeleton-file-plan.md`로 dto/repository → service → controller → Next cutover 순서를 고정했다.

- 차수 A 구현 시작: reorder dto 2개와 `MemberTabReorderRepository`, repository integration test를 추가했다.

- 차수 B 구현 시작: `MemberTabReorderService`와 service unit test를 추가해 reorder 규칙(source of truth)을 Spring으로 옮겼다.

- 차수 C 및 cutover 시작: `MemberTabReorderController`와 controller slice test를 추가했고, Next reorder route를 Spring fetch로 전환해 기존 direct `reorderTabs(...)` 호출을 제거했다.

- reorder lane cutover 완료: Spring controller/service/repository source of truth와 Next reorder route의 Spring fetch 전환, runtime smoke까지 확보했다. 다음은 reset lane으로 넘어간다.

- `docs/architecture/spring-member-tabs-reset-package-plan.md`로 reset lane의 controller/service/repository/dto 경계와 custom delete + system restore transaction 책임을 고정했다.

- `docs/architecture/spring-member-tabs-reset-api-contract.md`로 reset endpoint, no-body request, ok 응답, error shape, Next BFF translation 규칙을 고정했다.

- `docs/architecture/spring-member-tabs-reset-skeleton-file-plan.md`로 dto/repository → service → controller → Next cutover 순서를 고정했다.

- reset 차수 A/B/C 및 cutover 완료: Spring reset repository/service/controller source of truth 구현, Next reset route를 Spring fetch로 전환, 기존 direct `resetSpaceTabsToDefaults(...)` 호출 제거 및 함수 본체 삭제까지 마쳤다.
- reset 검증 증거:
  - `cd apps/backend && ./gradlew test --tests '*MemberTabResetRepositoryTests'`
  - `cd apps/backend && ./gradlew test --tests '*MemberTabResetServiceTests'`
  - `cd apps/backend && ./gradlew test --tests '*MemberTabResetControllerTests'`
  - `cd apps/backend && ./gradlew test`
  - `pnpm --filter @yeon/web exec vitest run 'src/app/api/v1/spaces/[spaceId]/member-tabs/reset/__tests__/route.test.ts'`
  - `pnpm --filter @yeon/web typecheck`
  - `pnpm --filter @yeon/web build`
  - runtime smoke: Spring `POST /spaces/space_member_tabs_reset_smoke/member-tabs/reset` -> `200 { ok: true }`, system tab 5개 restore, customCount 0, fieldCount 0, betaCustomCount 1
- reorder/reset 상위 파일럿 완료. 다음 cycle은 `member-fields read` 파일럿으로 넘긴다.
