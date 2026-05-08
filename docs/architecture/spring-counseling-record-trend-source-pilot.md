# spring-counseling-record-trend-source pilot

## 목적
- `/api/v1/counseling-records/analyze-trend`의 record aggregation을 Spring으로 이동한다.

## 결과
- route layer direct `getMultipleRecordsWithSegments` 제거
- 최대 5개 제한 + 같은 수강생 검사를 Spring이 담당
