# spring-counseling-record-students pilot

## 목적
- `/api/v1/counseling-records/students`의 direct student summary read를 Spring으로 이동한다.

## 결과
- route layer direct `counseling-records-service` 제거
- 학생명별 record count / first / last counseling 집계를 Spring read endpoint가 담당
