# spring-counseling-record-route-mutation pilot

## 목적
- `/api/v1/counseling-records/[recordId]` PATCH/DELETE direct mutation을 Spring으로 이동한다.

## 결과
- route layer direct `linkCounselingRecordMember` / `deleteCounselingRecord` 제거
- member link ownership check + audio object cleanup를 Spring이 담당
