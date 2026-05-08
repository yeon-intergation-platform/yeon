# counseling-record trend-source Spring pilot

## 작업내용
- `/api/v1/counseling-records/analyze-trend`
- Next direct `getMultipleRecordsWithSegments` 의존 제거

## 논의 필요
- SSE stream / AI 호출은 이번 차수 범위 밖

## 선택지
- A. trend source aggregation만 먼저 Spring 이동
- B. analyze-trend 전체를 한 번에 이동

## 추천
- A. trend source aggregation만 먼저 Spring 이동

## 사용자 방향
- 추천 기준으로 진행
