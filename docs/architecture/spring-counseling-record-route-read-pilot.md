# spring-counseling-record-route-read pilot

## 목적
- `/api/v1/counseling-records/[recordId]` GET direct read를 Spring으로 이동한다.

## 결과
- route layer direct `getCounselingRecordDetail` 제거
- not found / placeholder 404 의미를 유지하는 single detail endpoint를 Spring이 담당
