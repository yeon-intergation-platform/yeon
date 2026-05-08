# typing-decks route Spring pilot

## 작업내용
- `/api/v1/typing-decks/**` 6개 route lane Spring cutover
- Next direct `typing-decks-service` 의존 제거
- read/write/race-seed를 Spring client 호출 중심으로 전환
- default deck static catalog는 기존 source of truth를 유지하면서 route thin BFF를 맞춘다

## 논의 필요
- 없음

## 선택지
- A. default deck은 Next static helper 유지 + DB-backed lane만 Spring 이동
- B. default deck source까지 이번 차수에 Java로 완전 이식

## 추천
- A. default deck은 Next static helper 유지 + DB-backed lane만 Spring 이동

## 사용자 방향
- 추천 기준으로 진행
