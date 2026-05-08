# member-fields write spring pilot

- 작업 목표: `member-fields` write lane(create/update/delete)를 다음 Spring 파일럿으로 연다.
- 작업 범위: field create/update/delete direct Next service 호출을 Spring source of truth로 치환할 준비를 한다.
- 기준: Next는 outward auth/BFF 유지, Spring은 mutation source of truth 담당
- 비목표: reorder bulk mutation, field values write 동시 진행

- `docs/product/backlog/spring-member-fields-write-pilot.md`로 create/update/delete를 reorder와 분리하는 백로그를 열었다.
- `docs/architecture/spring-member-fields-write-pilot-inventory.md`로 현재 Next field mutation route/service 규칙(create/update/delete/reorder)을 고정했다.
- `docs/architecture/spring-member-fields-write-package-plan.md`로 Spring CRUD write 패키지/계층 책임을 고정했다.
- `docs/architecture/spring-member-fields-write-api-contract.md`로 outward/internal contract, error shape, Next translation을 고정했다.
- `docs/architecture/spring-member-fields-write-skeleton-file-plan.md`로 차수 A/B/C/D와 write set을 고정했다.
- 다음 구현 목표: backend `member_fields.write` CRUD를 만들고, Next `createField/updateField/deleteField` direct 호출을 제거한다.

- backend `member_fields.write` CRUD(create/update/delete)를 구현했다.
- Next `fields` POST route에서 direct `createField(...)` 호출을 제거하고 Spring create fetch로 전환했다.
- Next `member-fields/[fieldId]` PATCH/DELETE route에서 direct `updateField(...)`/`deleteField(...)` 호출을 제거하고 Spring fetch로 전환했다.
- backend 검증: `./gradlew test --tests '*MemberFieldWriteRepositoryTests'`, `./gradlew test --tests '*MemberFieldWriteServiceTests'`, `./gradlew test --tests '*MemberFieldWriteControllerTests'`, `./gradlew test` 통과.
- web 검증: `pnpm --filter @yeon/web exec vitest run 'src/app/api/v1/spaces/[spaceId]/member-tabs/[tabId]/fields/__tests__/route.test.ts' 'src/app/api/v1/spaces/[spaceId]/member-fields/[fieldId]/__tests__/route.test.ts'`, `pnpm --filter @yeon/web typecheck`, `pnpm --filter @yeon/web build` 통과.
- direct 호출 제거 확인: `rg -n "createField\(|updateField\(|deleteField\(" -- 'apps/web/src/app/api/v1/spaces/[spaceId]/member-tabs/[tabId]/fields/route.ts' 'apps/web/src/app/api/v1/spaces/[spaceId]/member-fields/[fieldId]/route.ts'` 결과 없음.
- runtime smoke: Spring `POST /spaces/space_member_fields_write_smoke/member-tabs/mtb_member_fields_write_smoke/fields` -> 201, `PATCH /spaces/space_member_fields_write_smoke/member-fields/{fieldId}` -> 200, `DELETE /spaces/space_member_fields_write_smoke/member-fields/{fieldId}` -> 204 확인.
- DB 검증: 생성 field의 options JSON 보존, update된 `name/is_required/display_order` 반영, delete 후 `deleted_at is not null`, other space field count 0 확인.
- 다음 구현 목표: `member-fields reorder` bulk mutation lane를 Spring으로 옮기고 Next direct `reorderFields(...)` 호출을 제거한다.
