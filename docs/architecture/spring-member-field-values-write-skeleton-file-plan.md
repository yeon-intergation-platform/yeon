# Spring Member Field Values Write Skeleton File Plan

## 차수 A
- `apps/backend/src/main/java/world/yeon/backend/member_field_values/write/dto/BulkUpsertMemberFieldValuesRequest.java`
- `apps/backend/src/main/java/world/yeon/backend/member_field_values/write/dto/MemberFieldValuePayloadRequest.java`
- `apps/backend/src/main/java/world/yeon/backend/member_field_values/write/dto/MemberFieldValuesMutationResponse.java`
- `apps/backend/src/main/java/world/yeon/backend/member_field_values/write/repository/MemberFieldValueWriteRepository.java`
- `apps/backend/src/test/java/world/yeon/backend/member_field_values/write/repository/MemberFieldValueWriteRepositoryTests.java`

## 차수 B
- `apps/backend/src/main/java/world/yeon/backend/member_field_values/write/service/MemberFieldValueWriteService.java`
- `apps/backend/src/main/java/world/yeon/backend/member_field_values/write/service/MemberFieldValueWriteServiceException.java`
- `apps/backend/src/test/java/world/yeon/backend/member_field_values/write/service/MemberFieldValueWriteServiceTests.java`

## 차수 C
- `apps/backend/src/main/java/world/yeon/backend/member_field_values/write/controller/MemberFieldValueWriteController.java`
- `apps/backend/src/test/java/world/yeon/backend/member_field_values/write/controller/MemberFieldValueWriteControllerTests.java`

## 차수 D
- `apps/web/src/server/member-field-values-spring-client.ts` 또는 기존 client 확장
- `apps/web/src/app/api/v1/spaces/[spaceId]/members/[memberId]/field-values/route.ts`
- route test 추가
- direct `bulkUpsertFieldValues(...)` 제거 확인
