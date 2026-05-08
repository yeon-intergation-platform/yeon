# member counseling-records Spring pilot

## 작업내용
- `/api/v1/spaces/[spaceId]/members/[memberId]/counseling-records`
- Next direct `counseling-records-service` member read 의존 제거

## 논의 필요
- counseling-records 본체 detail/audio/chat/analyze는 이번 차수 범위 밖

## 선택지
- A. member counseling-records read lane만 먼저 Spring 이동
- B. counseling-records 축을 한 번에 이동

## 추천
- A. member counseling-records read lane만 먼저 Spring 이동

## 사용자 방향
- 추천 기준으로 진행
