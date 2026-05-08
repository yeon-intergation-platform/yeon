# spring member-fields write skeleton file plan

## 차수 A

- `CreateMemberFieldRequest.java`
- `UpdateMemberFieldRequest.java`
- `MemberFieldMutationResponse.java`
- `MemberFieldWriteRepository.java`
- `MemberFieldWriteRepositoryTests.java`

## 차수 B

- `MemberFieldWriteService.java`
- `MemberFieldWriteServiceTests.java`

## 차수 C

- `MemberFieldWriteController.java`
- `MemberFieldWriteControllerTests.java`

## 차수 D

- `apps/web/src/server/member-fields-spring-client.ts` 확장
- `apps/web/src/app/api/v1/spaces/[spaceId]/member-tabs/[tabId]/fields/route.ts` POST 전환
- `apps/web/src/app/api/v1/spaces/[spaceId]/member-fields/[fieldId]/route.ts` PATCH/DELETE 전환
- 관련 route test 추가/수정

## 금지 범위

- `fields/reorder`
- member field values write
- overview bootstrap 재작업
