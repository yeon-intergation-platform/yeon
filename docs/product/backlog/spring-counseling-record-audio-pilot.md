# counseling-record audio Spring pilot

## 작업내용
- `/api/v1/counseling-records/[recordId]/audio`
- Next direct `getCounselingRecordAudio` / R2 접근 제거

## 논의 필요
- counseling-record upload/delete lane은 이번 차수 범위 밖

## 선택지
- A. audio transport만 먼저 Spring 이동
- B. counseling-record media 전체를 한 번에 이동

## 추천
- A. audio transport만 먼저 Spring 이동

## 사용자 방향
- 추천 기준으로 진행
