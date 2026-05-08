# Spring Next Backend Full Migration Inventory

## 현재 실측
- `apps/web/src/app/api/**/route.ts`: 127개
- `apps/web/src/server/services/*.ts`: 72개

## 이미 Spring migration된 축
- `space-templates`
- `member-tabs`
- `member-fields`
- `member-field-values`
- `google-sheets` (`sheet-export`, `sheet-integrations` legacy sync 포함)

## 아직 Next backend ownership이 큰 도메인
- `members-service`
- `activity-logs-service`
- `public-check-service`
- `student-board-service`
- `counseling-records-service` / `counseling-records-repository`
- `card-decks-service`
- `typing-decks-service`
- `chat-service/*`
- `life-os-service`
- `import-drafts-service`
- `import-preview-service`
- `auth-service`
- `googledrive-service` / `onedrive-service`

## 다음 smallest lane 추천
- `members CRUD`
  - route: `spaces/[spaceId]/members`, `spaces/[spaceId]/members/[memberId]`, `spaces/[spaceId]/members/bulk-delete`
  - service: `apps/web/src/server/services/members-service.ts`

## 추천 이유
- route/service 경계가 단순하다.
- direct DB + ownership check가 명확하다.
- 다른 도메인의 선행 의존이 적다.
