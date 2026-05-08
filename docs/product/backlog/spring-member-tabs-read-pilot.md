# Spring Member Tabs Read Pilot

## 문서 목적
- `space-templates apply`가 public `member_tab_definitions` / `member_field_definitions`를 Spring에서 실제로 쓰기 시작했으므로, 다음에는 이 결과를 읽는 Next backend route를 Spring으로 이전할 후보 범위를 고정한다.
- 이번 문서는 구현이 아니라 **다음 Ralph 반복의 실행 범위**만 정한다.

## 왜 member-tabs read가 다음 순서인가
- 방금 `POST /spaces/{spaceId}/apply-template` cutover로 Spring이 public member tab/field 데이터를 실제로 갱신하는 증거를 확보했다.
- 그래서 다음 source of truth 이동은 같은 데이터의 **read path**로 이어지는 것이 경계상 가장 자연스럽다.
- 인증은 여전히 Next BFF가 유지하고, Spring은 read query source of truth만 먼저 가져간다.

## 1차 후보 API
- `GET /api/v1/spaces/{spaceId}/member-tabs`

## 비목표
- member-tabs write 전체 이전 금지
- members/student-board/public-check 동시 이전 금지
- auth source of truth 변경 금지

## 차수 1 — inventory
### 작업내용
- 현재 Next route/service/DB query mapping을 문서화한다.
### 논의 필요
- fields 포함 응답인지 tab list only인지
### 선택지
1. tab list only
2. tab + field summary
### 추천
- **2. tab + field summary**
### 사용자 방향
- 추천 기준으로 진행

## 차수 2 — cutover 범위
### 작업내용
- 1차 cutover는 `GET /api/v1/spaces/{spaceId}/member-tabs` 1개로 제한한다.
### 논의 필요
- reorder/reset route를 함께 넣을지
### 선택지
1. GET만
2. GET + reset
### 추천
- **1. GET만**
### 사용자 방향
- 추천 기준으로 진행

## 완료 기준
- Spring backend에서 `member-tabs` read endpoint 동작
- Next route가 Spring 호출로 중계
- backend test + web route test + runtime/연동 증거 확보
