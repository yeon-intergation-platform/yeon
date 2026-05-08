# spring member-fields write pilot

## 차수 1

### 작업내용
- `member-fields` write lane를 다음 Spring 파일럿으로 연다.
- 1차 범위:
  - `POST /api/v1/spaces/{spaceId}/member-tabs/{tabId}/fields`
  - `PATCH /api/v1/spaces/{spaceId}/member-fields/{fieldId}`
  - `DELETE /api/v1/spaces/{spaceId}/member-fields/{fieldId}`
  - `PATCH /api/v1/spaces/{spaceId}/member-tabs/{tabId}/fields/reorder`

### 논의 필요
- `create/update/delete`와 `reorder`를 같은 lane으로 둘지, bulk mutation인 reorder를 분리할지

### 선택지
1. create/update/delete 먼저, reorder는 다음 lane
2. write 전부 한 lane

### 추천
- **1번 추천**
- 이유:
  - reorder는 bulk mutation이라 실패 원인과 검증 포인트가 다르다.
  - create/update/delete를 먼저 옮기면 Next direct CRUD를 바로 줄일 수 있다.

### 사용자 방향
- 추천 기준으로 진행

## 차수 2

### 작업내용
- 현재 Next field write 규칙 inventory 고정
- Spring package / API contract / skeleton plan 작성

### 논의 필요
- overview 기본 field(`sourceKey` 존재) 수정 제약을 Spring에서도 동일하게 유지할지

### 선택지
1. 이름/순서만 수정 가능 규칙 유지
2. Spring 이관하면서 완화

### 추천
- **1번 추천**
- 이유:
  - 기존 사용자 영향/검증 경계 유지가 우선이다.
  - 정책 완화는 migration 이후 별도 제품 결정으로 분리하는 편이 안전하다.

### 사용자 방향
- 추천 기준으로 진행

## 차수 3

### 작업내용
- Spring create/update/delete source of truth 구현
- Next direct `createField/updateField/deleteField` 호출 제거
- backend/web/runtime smoke 검증

### 논의 필요
- reorder를 같은 반복에 묶을지 여부

### 선택지
1. CRUD cutover 완료 후 reorder
2. CRUD와 reorder를 한 번에

### 추천
- **1번 추천**

### 사용자 방향
- 추천 기준으로 진행
