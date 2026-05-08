# spring member-fields reorder pilot

## 차수 1

### 작업내용
- `member-fields` bulk mutation 중 reorder lane를 다음 Spring 파일럿으로 연다.
- 1차 범위:
  - `PATCH /api/v1/spaces/{spaceId}/member-tabs/{tabId}/fields/reorder`

### 논의 필요
- create/update/delete와 reorder를 같은 lane으로 둘지, bulk mutation인 reorder를 분리할지

### 선택지
1. CRUD cutover 완료 후 reorder 별도 lane
2. field write 전부 한 lane

### 추천
- **1번 추천**
- 이유:
  - reorder는 bulk mutation이라 실패 원인과 검증 포인트가 다르다.
  - direct `reorderFields(...)` 제거를 따로 증명해야 한다.

### 사용자 방향
- 추천 기준으로 진행

## 차수 2

### 작업내용
- 현재 Next reorder 규칙 inventory 고정
- Spring package / API contract / skeleton plan 작성

### 논의 필요
- 1차에 order 배열 완전성/중복/존재성 검증을 강화할지

### 선택지
1. Next 현재 동작과 동일한 best-effort reorder 유지
2. Spring 이관과 함께 정책 강화

### 추천
- **1번 추천**
- 이유:
  - migration 1차는 동작 동일성 + direct 호출 제거 증명이 우선이다.
  - 정책 강화는 reorder cutover 이후 별도 lane으로 분리하는 편이 안전하다.

### 사용자 방향
- 추천 기준으로 진행

## 차수 3

### 작업내용
- Spring reorder source of truth 구현
- Next direct `reorderFields(...)` 호출 제거
- backend/web/runtime smoke 검증

### 논의 필요
- values write 또는 다른 field lane와 함께 묶을지 여부

### 선택지
1. reorder cutover만 먼저 닫기
2. 다음 lane와 동시에 진행

### 추천
- **1번 추천**

### 사용자 방향
- 추천 기준으로 진행
