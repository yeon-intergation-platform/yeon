# spring member-field-values write pilot

## 차수 1

### 작업내용
- `member-field-values` write lane를 다음 Spring 파일럿으로 연다.
- 1차 범위:
  - `PATCH /api/v1/spaces/{spaceId}/members/{memberId}/field-values`

### 논의 필요
- 단건 save와 bulk upsert를 분리할지, 현재 PATCH bulk upsert 하나로 유지할지

### 선택지
1. 현재 outward contract를 유지하고 bulk upsert 1개만 먼저 이전
2. 단건 endpoint와 bulk endpoint를 새로 분리

### 추천
- **1번 추천**
- 이유:
  - 현재 Next/프론트 소비자는 PATCH bulk upsert 1개를 사용한다.
  - migration 1차는 contract 유지 + direct service 제거가 우선이다.

### 사용자 방향
- 추천 기준으로 진행

## 차수 2

### 작업내용
- 현재 Next field-values write 규칙 inventory 고정
- Spring package / API contract / skeleton plan 작성

### 논의 필요
- 값 삭제를 별도 delete endpoint로 만들지, `null` payload clear semantics를 유지할지

### 선택지
1. `null`/`undefined`를 clear로 유지
2. 별도 delete endpoint 추가

### 추천
- **1번 추천**
- 이유:
  - 현재 `buildValueColumns`와 PATCH save 흐름이 이미 clear semantics를 사용한다.
  - endpoint 추가는 migration 이후 정책 정리 lane로 분리하는 편이 안전하다.

### 사용자 방향
- 추천 기준으로 진행

## 차수 3

### 작업내용
- Spring bulk upsert source of truth 구현
- Next direct `bulkUpsertFieldValues(...)` 호출 제거
- backend/web/runtime smoke 검증

### 논의 필요
- read 조합/캐시 패치와 같은 턴에 묶을지 여부

### 선택지
1. write cutover만 먼저 닫기
2. read/write/cache 정리까지 한 번에

### 추천
- **1번 추천**

### 사용자 방향
- 추천 기준으로 진행
