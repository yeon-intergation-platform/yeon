# spring member-fields overview bootstrap package plan

## package root

- `world.yeon.backend.member_fields.bootstrap_overview`

## 1차 package

- `bootstrap_overview.controller`
- `bootstrap_overview.service`
- `bootstrap_overview.repository`
- `bootstrap_overview.dto`
- `bootstrap_overview.support`

## package responsibility

### controller
- `POST /spaces/{spaceId}/member-tabs/{tabId}/bootstrap-overview-fields`
- required header:
  - `X-Yeon-User-Id`
  - `X-Yeon-Internal-Token`
- success:
  - `{ ok: true }`

### service
- space 존재 여부 확인
- tab 존재 여부 확인
- tab이 overview system tab인지 확인
- default overview field rows bootstrap
- `@Transactional` 경계

### repository
- `spacePublicId -> internalId`
- `tabPublicId -> (tabId, spaceId, systemKey)`
- existing overview default field 확인/삽입
- idempotent insert

### dto
- `OkResponse`

### support
- backend 전용 `DEFAULT_OVERVIEW_FIELDS` 상수
- field name/sourceKey/displayOrder/fieldType 정의

## 1차 정책

- overview tab이 아니면 no-op가 아니라 **400/409 성격 에러**로 명시적으로 거절
- missing overview tab row는 생성하지 않음
- field rows는 `on conflict do nothing` 수준의 idempotent insert

## Next BFF 역할

- overview 탭일 때만 bootstrap endpoint 호출
- 성공 후 기존 Spring read endpoint 호출
- bootstrap failure를 프론트용 `jsonError`로 번역

## 금지

- read endpoint 내부에 bootstrap side effect 다시 섞기
- Next route에 direct DB/service bootstrap 유지
- overview 외 system tab bootstrap 범위 확장
