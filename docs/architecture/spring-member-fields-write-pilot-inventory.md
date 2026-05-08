# spring member-fields write pilot inventory

## 현재 Next 구현 위치

- create:
  - `apps/web/src/app/api/v1/spaces/[spaceId]/member-tabs/[tabId]/fields/route.ts`
  - `createField(...)`
- update/delete:
  - `apps/web/src/app/api/v1/spaces/[spaceId]/member-fields/[fieldId]/route.ts`
  - `updateField(...)`
  - `deleteField(...)`
- reorder:
  - `apps/web/src/app/api/v1/spaces/[spaceId]/member-tabs/[tabId]/fields/reorder/route.ts`
  - `reorderFields(...)`

## 현재 규칙

### create
- space/tab public id resolve
- overview tab이면 bootstrap 선행
- 새 field는 같은 탭의 `max(displayOrder)+1`
- select/multi_select 외 options는 null 처리

### update
- deletedAt 있으면 404
- `sourceKey` 있는 기본 field는 이름/순서만 수정 가능
- tab 이동 시 target tab 존재 확인

### delete
- soft delete(`deletedAt`)
- 이후 read/query에서 제외

### reorder
- `order[]` index를 새 `displayOrder`로 그대로 사용
- 현재는 bulk best-effort, 완전성/중복 강화 검증 약함

## 1차 cutover 범위

- 포함:
  - create
  - update
  - delete
- 제외:
  - reorder
  - member field values write
  - overview bootstrap (이미 read lane에서 Spring으로 이전 완료)

## 추천 순서

1. `member_fields.write` CRUD package plan
2. API contract
3. skeleton file plan
4. backend CRUD 구현
5. Next POST/PATCH/DELETE direct 호출 제거
6. runtime smoke
