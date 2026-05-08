# Spring Google Sheets Import Mutation Package Plan

- package: `world.yeon.backend.sheet_export.import_mutation`
- controller
  - `POST /spaces/{spaceId}/sheet-export/import-mutation`
- service
  - linked export integration 존재 확인
  - planned updates/create를 순서대로 적용
  - member core write + member-field-values write orchestration
  - 전체 transactional boundary 유지
- repository
  - integration lookup
  - member insert/update native query
- dependency reuse
  - `member_field_values.write.MemberFieldValueWriteService` 재사용

## 남는 Next 책임
- Google access token 조회
- Google sheet values read
- evaluation API 호출
- mutation API 호출
- re-export / Google write
