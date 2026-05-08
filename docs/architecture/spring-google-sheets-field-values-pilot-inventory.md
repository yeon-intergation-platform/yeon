# Spring Google Sheets Field Values Pilot Inventory

## 문서 목적
- `google-sheets-export-service.ts`에 남아 있는 `member-field-values-service` direct 의존을 실제 코드 기준으로 고정한다.

## 현재 direct 의존 위치
기준 파일:
- `apps/web/src/server/services/google-sheets-export-service.ts`

### 1. import 경로 read
- 위치: `importSpaceFromLinkedSheet(...)`
- 기존 direct 호출:
  - `getFieldValuesForDefinitions(member.publicId, spaceId)`
- 목적:
  - 시트와 서버의 custom field payload diff 계산용 현재 값 snapshot 생성

### 2. import 경로 write
- 위치: `plannedUpdates` / `plannedCreates` apply 구간
- 기존 direct 호출:
  - `bulkUpsertFieldValues(update.memberPublicId, spaceId, update.customValues)`
  - `bulkUpsertFieldValues(member.publicId, spaceId, create.customValues)`
- 목적:
  - import 결과를 member field values source of truth에 반영

## 현재 비범위
### export rows builder
- `buildSpaceExportRows(...)`는 Drizzle로 member/definition/value를 직접 join 조회한다.
- 이 경로는 field-values service helper를 직접 쓰지 않으므로 이번 lane 비범위로 둔다.

## 1차 추천 경계
- read 치환:
  - `fetchMemberFieldValuesFromSpring(spaceId, memberId, userId, [])`
- write 치환:
  - `bulkUpsertMemberFieldValuesInSpring(spaceId, memberId, userId, { values })`
- Next는 계속 import/export coordinator 역할만 유지한다.

## 치환 시 주의점
- direct read helper는 internal field definition id 기준 비교를 했지만, Spring 응답은 `fieldDefinitionId = publicId`를 쓴다.
- 따라서 current payload diff 계산 시 비교 key를 `definition.id`가 아니라 `definition.publicId`로 맞춰야 한다.
- empty customValues일 때는 불필요한 Spring write 호출을 생략해도 된다.
