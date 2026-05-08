# spring-member-counseling-records pilot

## 목적
- `/api/v1/spaces/[spaceId]/members/[memberId]/counseling-records` direct read를 Spring으로 이동한다.

## 결과
- route layer direct `counseling-records-service` 제거
- member별 counseling record list 집계를 Spring read endpoint가 담당
