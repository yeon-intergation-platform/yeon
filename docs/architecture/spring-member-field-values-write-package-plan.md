# Spring Member Field Values Write Package Plan

## 문서 목적
- `member-field-values` write lane를 Spring으로 옮기기 위한 내부 구조를 고정한다.

## 1차 write 파일럿 범위
- Spring backend API
  - `PATCH /spaces/{spaceId}/members/{memberId}/field-values`
- Next BFF API
  - `PATCH /api/v1/spaces/{spaceId}/members/{memberId}/field-values`

## 설계 원칙
1. bulk upsert 1개만 먼저 옮긴다.
2. outward contract는 그대로 유지한다.
3. fieldType별 value column routing 규칙은 Spring에서 동일하게 구현한다.
4. `null`/`undefined` clear semantics를 유지한다.
5. write 직후 read-back은 1차에선 유지해 프론트 캐시 계약을 깨지 않는다.

## 추천 패키지 구조
- root:
  - `world.yeon.backend.member_field_values.write`
- 1차 생성 패키지:
  - `write.controller`
  - `write.service`
  - `write.repository`
  - `write.dto`

## 계층 책임
### `write.controller`
- `spaceId`, `memberId` path variable 수신
- `X-Yeon-User-Id`, `X-Yeon-Internal-Token` header 수신
- request body는 Spring DTO 수준만 파싱

### `write.service`
- space/member 존재 여부 확인
- definition existence/space ownership 검증
- `buildValueColumns`에 대응하는 컬럼 라우팅 수행
- bulk upsert transaction 경계
- 1차에는 write 후 values read-back까지 orchestrate 가능

### `write.repository`
- `spaceId -> internalId`
- `memberId -> internalId`
- field definitions bulk lookup
- `member_field_values` bulk upsert
- 필요 시 read-back용 join query

### `write.dto`
- request:
  - `values: [{ fieldDefinitionId, value }]`
- response:
  - `{ ok: true, values: [...] }`

## Next BFF 역할
- auth
- zod validation
- Spring fetch
- error translation
- outward response 유지
