# spring-counseling-record-list-read-pilot

## 작업내용
- `/api/v1/counseling-records` GET path를 Spring read endpoint로 이관한다.
- `spaceId`, `unlinked`, `limit`, `before` query 규칙을 유지한다.
- POST(audio/text memo upload)는 이번 차수 범위에서 유지한다.

## 논의 필요
- list GET이 기존에 수행하던 processing/analysis scheduling side effect를 어디에 둘지 결정 필요.

## 선택지
1. side effect까지 Spring으로 이동
2. list read만 Spring으로 이동하고 scheduling helper는 Next에 유지

## 추천
- 2. 이번 차수는 read lane만 고정하고, 기존 scheduling side effect는 Next helper로 유지한다.

## 사용자 방향
- 추천 기준으로 진행
