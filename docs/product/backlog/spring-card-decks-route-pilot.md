# card-decks route Spring pilot

## 작업내용
- `/api/v1/card-decks/**` 7개 route lane Spring cutover
- Next direct `card-decks-service` 의존 제거
- deck CRUD / items CRUD / review / study-preference를 Spring으로 이동

## 논의 필요
- 없음

## 선택지
- A. route layer만 먼저 thin BFF로 전환
- B. 모바일/guest 연동까지 같은 차수에 묶는다

## 추천
- A. route layer만 먼저 thin BFF로 전환

## 사용자 방향
- 추천 기준으로 진행
