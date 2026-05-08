# counseling-record route mutation Spring pilot

## 작업내용
- `/api/v1/counseling-records/[recordId]` PATCH / DELETE
- Next direct `linkCounselingRecordMember` / `deleteCounselingRecord` 의존 제거

## 논의 필요
- chat/analyze/transcribe는 이번 차수 범위 밖

## 선택지
- A. `[recordId]` mutation lane만 먼저 Spring 이동
- B. counseling-records 하위 mutation을 한 번에 이동

## 추천
- A. `[recordId]` mutation lane만 먼저 Spring 이동

## 사용자 방향
- 추천 기준으로 진행
