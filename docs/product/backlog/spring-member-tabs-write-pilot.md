# Spring Member Tabs Write Pilot

## 문서 목적
- `member-tabs GET` read cutover가 끝났으므로, 다음에는 같은 도메인의 write path를 Spring source of truth로 옮기기 위한 실행 범위를 고정한다.
- 이번 문서는 구현이 아니라 **다음 Ralph 반복의 실행 범위**만 정한다.

## 왜 member-tabs write가 다음 순서인가
- `GET /api/v1/spaces/{spaceId}/member-tabs`는 이미 Spring read로 넘어갔다.
- 그래서 같은 aggregate의 write를 옮기면 Next는 `member-tabs`에서 더 얇은 BFF가 된다.
- 아직 `fields`는 별도 하위 aggregate 성격이 강하므로 먼저 tab write를 마무리하는 편이 자연스럽다.

## 1차 후보 API
- `POST /api/v1/spaces/{spaceId}/member-tabs`
- `PATCH /api/v1/spaces/{spaceId}/member-tabs/{tabId}`
- `DELETE /api/v1/spaces/{spaceId}/member-tabs/{tabId}`
- `PATCH /api/v1/spaces/{spaceId}/member-tabs/reorder`
- `POST /api/v1/spaces/{spaceId}/member-tabs/reset`

## 비목표
- `member-tabs/[tabId]/fields` 이전 금지
- auth source of truth 변경 금지
- backfill/bootstrap 자동화 전면 재설계 금지

## 차수 1 — inventory
### 작업내용
- 현재 Next route/service/DB mutation mapping을 문서화한다.
### 논의 필요
- 5개 route를 한 번에 할지, 작은 묶음으로 나눌지
### 선택지
1. create/update/delete 먼저
2. create/update/delete + reorder
3. 전부 한 번에
### 추천
- **1. create/update/delete 먼저**
### 사용자 방향
- 추천 기준으로 진행

## 차수 2 — write lane 분할
### 작업내용
- create/update/delete와 reorder/reset을 서로 다른 lane으로 분리한다.
### 논의 필요
- reset이 overview/system tab 규칙까지 포함하므로 별도 lane이 필요한지
### 선택지
1. create/update/delete
2. reorder
3. reset
### 추천
- **1 → 2 → 3 순서 분리**
### 사용자 방향
- 추천 기준으로 진행

## 완료 기준
- Spring backend에서 member-tabs create/update/delete 1차 write endpoint 동작
- Next route가 Spring 호출로 중계
- backend test + web route test + runtime/연동 증거 확보
