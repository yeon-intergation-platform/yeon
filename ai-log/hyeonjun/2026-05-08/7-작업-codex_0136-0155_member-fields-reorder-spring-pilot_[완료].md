# member-fields reorder spring pilot

- 작업 목표: `member-fields` reorder bulk mutation을 Spring source of truth로 이전하고 Next direct `reorderFields(...)` 호출을 제거한다.
- 작업 범위: backend reorder repository/service/controller + tests, Next client/route cutover, dead server service reorder 제거, runtime smoke.
- 기준: Next는 outward auth/BFF 유지, Spring은 bulk mutation source of truth 담당.
- 비목표: field values write, create/update/delete 재작업, auth/session migration.

- `docs/product/backlog/spring-member-fields-reorder-pilot.md` 작성.
- `docs/architecture/spring-member-fields-reorder-*.md` 4종으로 inventory/package-plan/api-contract/skeleton plan 고정.
- backend `member_fields.reorder` lane 구현:
  - `ReorderMemberFieldsRequest`, `OkResponse`, `MemberFieldReorderRepository`, `MemberFieldReorderService`, `MemberFieldReorderController`
  - repository/service/controller tests 추가
- Next route `apps/web/src/app/api/v1/spaces/[spaceId]/member-tabs/[tabId]/fields/reorder/route.ts`를 Spring fetch로 전환.
- `apps/web/src/server/member-fields-spring-client.ts`에 `reorderMemberFieldsInSpring(...)` 추가.
- dead Next backend helper `reorderFields(...)`와 전용 server service tests 제거.
- backend 검증: `./gradlew test` 통과.
- web 검증: `pnpm --filter @yeon/web exec vitest run 'src/app/api/v1/spaces/[spaceId]/member-tabs/[tabId]/fields/reorder/__tests__/route.test.ts'`, `pnpm --filter @yeon/web typecheck`, `pnpm --filter @yeon/web build` 통과.
- direct 제거 확인: `rg -n "reorderFields\(" apps/web/src/server/services` 결과 없음.
- runtime smoke: Spring `PATCH /spaces/space_member_fields_reorder_smoke/member-tabs/mtb_member_fields_reorder_smoke/fields/reorder` -> `{ ok: true }`, DB에서 `mfd_reorder_c -> 0`, `mfd_reorder_a -> 1`, `mfd_reorder_b -> 2`, other space `mfd_reorder_other -> 0` 유지 확인.
- 다음 구현 목표: `member-field-values write` 또는 `members read` 중 다음 aggregate lane를 선정해 계속 진행.
