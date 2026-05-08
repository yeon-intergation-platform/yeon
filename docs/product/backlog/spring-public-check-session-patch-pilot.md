# spring public-check session patch pilot

## 작업내용
- `spaces/[spaceId]/public-check-sessions/[sessionId]` PATCH route의 direct Next service 의존을 Spring update API로 치환한다.
- Spring에 public-check session update lane을 추가한다.
- session summary 응답 shape를 유지한다.

## 논의 필요
- 이번 차수는 PATCH만 다룬다.
- create/search/submit/verify는 후속 lane으로 남긴다.

## 선택지
1. public-check session PATCH만 먼저 전환
2. public-check 전체를 한 번에 전환

## 추천
- 1번. 수정 route 하나와 update 쿼리만 옮기는 것이 가장 작은 안전 lane이다.

## 사용자 방향
- 추천 기준으로 진행
