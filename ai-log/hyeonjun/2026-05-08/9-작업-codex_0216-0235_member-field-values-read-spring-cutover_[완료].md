# member-field-values read spring cutover

- 작업 목표: `GET /api/v1/spaces/{spaceId}/members/{memberId}/field-values`를 Spring read source of truth로 전환하고, Next direct read 로직을 제거한다.
- 작업 범위: backend read endpoint 보강, Next GET route cutover, route test, backend/web 검증, runtime smoke, 재발방지 기록.
- 기준: Next는 outward auth/BFF 유지, Spring은 read source of truth 담당.
- 비목표: `google-sheets-export-service.ts` 내부 소비자 리팩토링, auth/session migration.

## 이번에 한 일
- backlog / architecture 문서 추가
  - `docs/product/backlog/spring-member-field-values-route-read-pilot.md`
  - `docs/architecture/spring-member-field-values-route-read-pilot-inventory.md`
  - `docs/architecture/spring-member-field-values-route-read-api-contract.md`
- backend read endpoint 추가
  - `MemberFieldValueMemberReadController`
  - `MemberFieldValueDetailedItemResponse`
  - `MemberFieldValueDetailedListResponse`
  - `MemberFieldValueReadRepository.findDetailedValues(...)`
  - `MemberFieldValueReadService.listMemberValues(...)`
- backend 테스트 추가/보강
  - `MemberFieldValueMemberReadControllerTests`
  - `MemberFieldValueMemberReadServiceTests`
  - `MemberFieldValueReadRepositoryTests`에 member route용 조회 케이스 추가
- web Spring client 보강
  - `fetchMemberFieldValuesFromSpring(...)` 추가
- Next route cutover
  - `apps/web/src/app/api/v1/spaces/[spaceId]/members/[memberId]/field-values/route.ts` GET이 이제 Spring fetch만 사용한다.
- route test 보강
  - GET success / 404 translation 케이스 추가

## 실제로 제거한 Next direct 로직
- route에서 direct `getFieldValues(...)` 제거
- route에서 direct `getFieldValuesForDefinitions(...)` 제거
- 확인: route 파일 기준 `rg` no matches

## 검증
- backend
  - `cd apps/backend && ./gradlew test --tests '*MemberFieldValueReadRepositoryTests'` 통과
  - `cd apps/backend && ./gradlew test --tests '*MemberFieldValueMemberReadServiceTests'` 통과
  - `cd apps/backend && ./gradlew test --tests '*MemberFieldValueMemberReadControllerTests'` 통과
  - `cd apps/backend && ./gradlew test` 통과
- web
  - `pnpm --filter @yeon/web exec vitest run 'src/app/api/v1/spaces/[spaceId]/members/[memberId]/field-values/__tests__/route.test.ts'` 통과
  - `pnpm --filter @yeon/web typecheck` 통과
  - `pnpm --filter @yeon/web build` 통과
- runtime smoke
  - Spring direct `GET /spaces/space_member_field_values_read_smoke/members/mem_member_field_values_read_smoke/field-values` 검증
  - Spring direct `GET /spaces/space_member_field_values_read_smoke/members/mem_member_field_values_read_smoke/field-values?fieldDefinitionId=mfd_read_smoke_status` 검증
  - 응답 확인
    - 전체 응답 order: `mfd_read_smoke_status`, `mfd_read_smoke_note`
    - `fieldType`, `fieldName`, `valueJson`, `valueText` 확인
    - filter query 시 `mfd_read_smoke_status`만 남는 것 확인
  - DB 확인
    - `mfd_read_smoke_status|<null>|["in_progress"]`
    - `mfd_read_smoke_note|메모값|<null>`

## 남은 것 / 다음 작업
- route direct read/write는 이제 모두 제거됐다.
- 하지만 Next 내부 service consumer는 아직 남아 있다.
  - `apps/web/src/server/services/google-sheets-export-service.ts`
    - `getFieldValuesForDefinitions(...)`
    - `bulkUpsertFieldValues(...)`
- 다음 lane 목표:
  - google-sheets export/import에서 member-field-values direct service 의존 inventory 고정
  - Spring client 또는 API hop으로 점진 이전
