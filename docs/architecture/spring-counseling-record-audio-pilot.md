# spring-counseling-record-audio pilot

## 목적
- `/api/v1/counseling-records/[recordId]/audio` direct R2 read를 Spring으로 이동한다.

## 결과
- route layer direct `getCounselingRecordAudio` 제거
- range / 206 / content-range / text-memo-demo 404 의미를 Spring transport가 담당
