# counseling-record-details Spring pilot

## 작업내용
- `/api/v1/counseling-records/details`
- Next direct `counseling-records-service` bulk detail read 의존 제거

## 논의 필요
- counseling-records audio/chat/analyze mutation lane은 이번 차수 범위 밖

## 선택지
- A. details read lane만 먼저 Spring 이동
- B. counseling-records 본체를 한 번에 이동

## 추천
- A. details read lane만 먼저 Spring 이동

## 사용자 방향
- 추천 기준으로 진행
