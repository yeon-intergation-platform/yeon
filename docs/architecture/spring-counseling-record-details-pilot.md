# spring-counseling-record-details pilot

## 목적
- `/api/v1/counseling-records/details` direct read를 Spring으로 이동한다.

## 결과
- route layer direct `counseling-records-service` 제거
- bulk detail read + transcript segments + relation publicId 조합을 Spring read endpoint가 담당
