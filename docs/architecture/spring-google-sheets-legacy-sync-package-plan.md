# Spring Google Sheets Legacy Sync Package Plan

- 범위:
  - `GET /spaces/{spaceId}/sheet-integrations`
  - `POST /spaces/{spaceId}/sheet-integrations`
  - `POST /spaces/{spaceId}/sheet-integrations/{integrationId}/sync`
- Spring 책임:
  - legacy sheet integration list/create
  - Google service account 기반 sheet read
  - member/activity_logs upsert성 sync
  - `sheet_integrations.last_synced_at` update
- Next 책임:
  - 인증 확인
  - Spring internal API 호출
  - 에러 번역
