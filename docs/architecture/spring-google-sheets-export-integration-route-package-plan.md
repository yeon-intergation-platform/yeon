# Spring Google Sheets Export Integration Route Package Plan

- package
  - `world.yeon.backend.sheet_export.integration`
- controller
  - `GET /spaces/{spaceId}/sheet-export/integration`
  - `PUT /spaces/{spaceId}/sheet-export/integration`
  - `DELETE /spaces/{spaceId}/sheet-export/integration`
- service
  - export integration lookup
  - sheetUrl -> sheetId parse
  - upsert / delete
- repository
  - space + export integration native query

## Next에 남는 책임
- 인증 확인
- Spring endpoint proxy
