# spring member-fields write package plan

## package root

- `world.yeon.backend.member_fields.write`

## 1차 package

- `write.controller`
- `write.service`
- `write.repository`
- `write.dto`
- `write.mapper`

## 1차 범위

- `POST /spaces/{spaceId}/member-tabs/{tabId}/fields`
- `PATCH /spaces/{spaceId}/member-fields/{fieldId}`
- `DELETE /spaces/{spaceId}/member-fields/{fieldId}`

## responsibility

### controller
- required headers:
  - `X-Yeon-User-Id`
  - `X-Yeon-Internal-Token`
- JSON body parsing/response shape

### service
- space/tab/field lookup
- create/update/delete business rule
- overview bootstrap endpoint는 여기서 다시 수행하지 않음
- `@Transactional` boundary

### repository
- public id lookup
- create insert
- update patch
- soft delete
- same-space ownership 확인

### dto
- create/update request
- `{ field: ... }` mutation response

### mapper
- entity -> outward field response shape

## 정책 잠금

- `sourceKey` 있는 기본 field는 이름/순서만 수정 가능
- delete는 soft delete 유지
- create는 current max order + 1 유지
- options/fieldType 규칙은 Next 현재 동작과 동일 유지

## Next BFF 역할

- auth
- zod validation
- Spring fetch
- error translation

## 금지

- Next direct `createField/updateField/deleteField` 유지
- reorder bulk mutation 섞기
